#!/usr/bin/env node
/**
 * Dispatch the next queued task to its assigned agent.
 *
 * Usage:
 *   node .ai/scripts/dispatch-task.mjs                    # dispatch next queued task
 *   node .ai/scripts/dispatch-task.mjs --task task-abc123 # dispatch specific task
 *   node .ai/scripts/dispatch-task.mjs --dry-run          # show what would happen
 *
 * Flow:
 *   1. Pick the highest-priority queued task
 *   2. Load the agent definition + BU policy
 *   3. Build a prompt from agent.md + policy + task
 *   4. Execute via Claude CLI (or dry-run)
 *   5. Record the run in runs.json
 *   6. Update task status
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AI_DIR = resolve(__dirname, "..");
const STATE_DIR = resolve(AI_DIR, "state");
const AGENTS_DIR = resolve(AI_DIR, "agents");
const POLICIES_DIR = resolve(AI_DIR, "policies");

const TASKS_FILE = resolve(STATE_DIR, "tasks.json");
const RUNS_FILE = resolve(STATE_DIR, "runs.json");
const PROGRESS_FILE = resolve(STATE_DIR, "progress.json");

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function parseArgs() {
  const args = { taskId: null, dryRun: false };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--task") args.taskId = argv[++i];
    else if (argv[i] === "--dry-run") args.dryRun = true;
  }
  return args;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2));
}

function loadAgentPrompt(agentId) {
  // Map agent IDs to .md filenames
  const fileMap = {
    "core-orchestrator": "orchestrator.md",
    "review-agent": "review.md",
    "kr-bu-agent": "kr-bu.md",
    "en-bu-agent": "en-bu.md",
    "ph-bu-agent": "ph-bu.md",
  };
  const filename = fileMap[agentId];
  if (!filename) return null;
  const path = resolve(AGENTS_DIR, filename);
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function loadPolicy(bu) {
  const fileMap = { core: "core.json", ko: "ko.json", "en-us": "en-us.json", "en-ph": "en-ph.json" };
  const filename = fileMap[bu];
  if (!filename) return null;
  const path = resolve(POLICIES_DIR, filename);
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function callClaude(prompt, timeoutMs = 300_000) {
  return new Promise((res, rej) => {
    const proc = spawn("claude", ["-p", prompt], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => { proc.kill("SIGKILL"); rej(new Error("timeout")); }, timeoutMs);
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (e) => { clearTimeout(timer); rej(e); });
    proc.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) rej(new Error(`claude exited ${code}: ${stderr.slice(0, 300)}`));
      else res(stdout);
    });
  });
}

async function main() {
  const args = parseArgs();
  const tasksState = loadJson(TASKS_FILE);
  const runsState = loadJson(RUNS_FILE);

  // Pick task
  let task;
  if (args.taskId) {
    task = tasksState.tasks.find((t) => t.id === args.taskId && t.status === "queued");
    if (!task) { console.error(`task ${args.taskId} not found or not queued`); process.exit(1); }
  } else {
    const queued = tasksState.tasks
      .filter((t) => t.status === "queued")
      .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9));
    task = queued[0];
    if (!task) { console.log("[harness] no queued tasks"); process.exit(0); }
  }

  console.log(`[harness] dispatching: ${task.id} — ${task.title} → ${task.owner_agent}`);

  // Build prompt — static context first (cacheable), dynamic last
  const agentPrompt = loadAgentPrompt(task.owner_agent) || "You are a Round agent.";
  const policy = loadPolicy(task.business_unit) || "{}";
  const progress = readFileSync(PROGRESS_FILE, "utf8");

  // Inject relevant lessons so the agent doesn't repeat known mistakes
  const lessonsState = loadJson(resolve(STATE_DIR, "lessons.json"));
  const relevantLessons = lessonsState.lessons
    .filter((l) => l.scope === task.business_unit || l.scope === "global")
    .slice(-5) // last 5 relevant
    .map((l) => `- ${l.summary} (${l.created_at})`)
    .join("\n");

  const fullPrompt = [
    // --- Static layer (rarely changes, cacheable) ---
    "# Agent Role",
    agentPrompt,
    "",
    "# BU Policy",
    policy,
    "",
    // --- Session layer ---
    "# Current Progress",
    progress,
    "",
    relevantLessons ? `# Lessons (avoid these mistakes)\n${relevantLessons}\n` : "",
    // --- Dynamic layer (changes every task) ---
    "# Task",
    `ID: ${task.id}`,
    `Title: ${task.title}`,
    `Business Unit: ${task.business_unit}`,
    `Priority: ${task.priority}`,
    `Inputs: ${JSON.stringify(task.inputs)}`,
    "",
    "Execute this task. Return a JSON object with:",
    '{ "summary": "what you did", "outputs": {}, "next_action": "suggested next step or null" }',
  ].filter(Boolean).join("\n");

  if (args.dryRun) {
    console.log("\n--- DRY RUN: Prompt ---");
    console.log(fullPrompt.slice(0, 500) + "\n...(truncated)");
    console.log(`\nTotal prompt length: ${fullPrompt.length} chars`);
    process.exit(0);
  }

  // Execute
  const now = new Date().toISOString();
  const runId = `run-${randomUUID().slice(0, 8)}`;

  task.status = "running";
  task.updated_at = now;
  saveJson(TASKS_FILE, tasksState);

  const run = {
    id: runId,
    task_id: task.id,
    agent_id: task.owner_agent,
    status: "running",
    started_at: now,
    ended_at: null,
    input_summary: task.title,
    output_summary: "",
    error: null,
    token_usage: 0,
  };
  runsState.runs.push(run);
  saveJson(RUNS_FILE, runsState);

  try {
    const result = await callClaude(fullPrompt);
    run.status = "completed";
    run.ended_at = new Date().toISOString();
    run.output_summary = result.slice(0, 500);

    task.status = "review";
    task.outputs = { raw: result.slice(0, 2000) };
    task.updated_at = run.ended_at;
    task.next_action = "review-agent should review this output";

    console.log(`[harness] run ${runId} completed. Task → review.`);
  } catch (e) {
    run.status = "failed";
    run.ended_at = new Date().toISOString();
    run.error = e.message;

    task.status = "failed";
    task.updated_at = run.ended_at;

    console.error(`[harness] run ${runId} failed: ${e.message}`);
  }

  saveJson(TASKS_FILE, tasksState);
  saveJson(RUNS_FILE, runsState);

  // Update progress
  const progressState = loadJson(PROGRESS_FILE);
  progressState.last_updated = new Date().toISOString();
  progressState.current_focus = task.status === "review" ? `Reviewing: ${task.title}` : "";
  saveJson(PROGRESS_FILE, progressState);
}

main().catch((e) => { console.error(`[harness] fatal: ${e.message}`); process.exit(1); });
