#!/usr/bin/env node
/**
 * Review a completed task. Creates a review record and updates task state.
 *
 * Usage:
 *   node .ai/scripts/review-task.mjs --task task-abc123 --verdict pass
 *   node .ai/scripts/review-task.mjs --task task-abc123 --verdict revise --notes "Missing category check"
 *   node .ai/scripts/review-task.mjs --task task-abc123 --verdict escalate --notes "Policy change needed"
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = resolve(__dirname, "../state");

const TASKS_FILE = resolve(STATE_DIR, "tasks.json");
const RUNS_FILE = resolve(STATE_DIR, "runs.json");
const REVIEWS_FILE = resolve(STATE_DIR, "reviews.json");
const LESSONS_FILE = resolve(STATE_DIR, "lessons.json");

const VALID_VERDICTS = ["pass", "revise", "escalate"];

function parseArgs() {
  const args = { taskId: "", verdict: "", notes: "", lesson: "" };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--task") args.taskId = argv[++i];
    else if (argv[i] === "--verdict") args.verdict = argv[++i];
    else if (argv[i] === "--notes") args.notes = argv[++i];
    else if (argv[i] === "--lesson") args.lesson = argv[++i];
  }
  return args;
}

function loadJson(path) { return JSON.parse(readFileSync(path, "utf8")); }
function saveJson(path, data) { writeFileSync(path, JSON.stringify(data, null, 2)); }

const args = parseArgs();

if (!args.taskId) { console.error("error: --task required"); process.exit(1); }
if (!VALID_VERDICTS.includes(args.verdict)) {
  console.error(`error: --verdict must be one of ${VALID_VERDICTS.join(", ")}`);
  process.exit(1);
}

const tasksState = loadJson(TASKS_FILE);
const runsState = loadJson(RUNS_FILE);
const reviewsState = loadJson(REVIEWS_FILE);
const lessonsState = loadJson(LESSONS_FILE);

const task = tasksState.tasks.find((t) => t.id === args.taskId);
if (!task) { console.error(`task ${args.taskId} not found`); process.exit(1); }

const run = runsState.runs.filter((r) => r.task_id === task.id).pop();
const now = new Date().toISOString();

// Create review
const review = {
  id: `rev-${randomUUID().slice(0, 8)}`,
  task_id: task.id,
  agent_run_id: run?.id || null,
  reviewer_agent: "review-agent",
  verdict: args.verdict,
  notes: args.notes,
  created_at: now,
};
reviewsState.reviews.push(review);
saveJson(REVIEWS_FILE, reviewsState);

// Update task based on verdict
switch (args.verdict) {
  case "pass":
    task.status = "done";
    task.next_action = null;
    break;
  case "revise":
    task.status = "queued"; // re-queue for another attempt
    task.next_action = `Revision needed: ${args.notes}`;
    break;
  case "escalate":
    task.status = "blocked";
    task.next_action = `Escalated: ${args.notes}`;
    break;
}
task.updated_at = now;
saveJson(TASKS_FILE, tasksState);

// Optionally record a lesson
if (args.lesson) {
  const lesson = {
    id: `les-${randomUUID().slice(0, 8)}`,
    scope: task.business_unit,
    summary: args.lesson,
    trigger: `${review.id} (${args.verdict})`,
    proposed_policy_update: null,
    created_at: now,
  };
  lessonsState.lessons.push(lesson);
  saveJson(LESSONS_FILE, lessonsState);
  console.log(`[harness] lesson recorded: ${lesson.id} — ${lesson.summary}`);
}

console.log(`[harness] review: ${review.id} → ${args.verdict} (task ${task.id} → ${task.status})`);
