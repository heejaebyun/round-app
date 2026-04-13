#!/usr/bin/env node
/**
 * Create a task in the harness queue.
 *
 * Usage:
 *   node .ai/scripts/create-task.mjs --bu ko --title "Research 4 questions" --priority medium
 *   node .ai/scripts/create-task.mjs --bu en-us --title "Evaluate skip rates" --priority high
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = resolve(__dirname, "../state");
const TASKS_FILE = resolve(STATE_DIR, "tasks.json");

const VALID_BUS = ["core", "toss", "ko", "en-us", "en-ph"];
const VALID_PRIORITIES = ["critical", "high", "medium", "low"];

// Map BU to default agent
const BU_AGENT_MAP = {
  core: "core-orchestrator",
  toss: "toss-bu-agent",
  ko: "kr-bu-agent",
  "en-us": "en-bu-agent",
  "en-ph": "ph-bu-agent",
};

function parseArgs() {
  const args = { bu: "", title: "", priority: "medium" };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--bu") args.bu = argv[++i];
    else if (argv[i] === "--title") args.title = argv[++i];
    else if (argv[i] === "--priority") args.priority = argv[++i];
  }
  return args;
}

const args = parseArgs();

if (!VALID_BUS.includes(args.bu)) {
  console.error(`error: --bu must be one of ${VALID_BUS.join(", ")}`);
  process.exit(1);
}
if (!args.title) {
  console.error("error: --title required");
  process.exit(1);
}
if (!VALID_PRIORITIES.includes(args.priority)) {
  console.error(`error: --priority must be one of ${VALID_PRIORITIES.join(", ")}`);
  process.exit(1);
}

const state = JSON.parse(readFileSync(TASKS_FILE, "utf8"));
const now = new Date().toISOString();

const task = {
  id: `task-${randomUUID().slice(0, 8)}`,
  title: args.title,
  business_unit: args.bu,
  owner_agent: BU_AGENT_MAP[args.bu] || null,
  status: "queued",
  priority: args.priority,
  inputs: {},
  outputs: {},
  created_at: now,
  updated_at: now,
  next_action: null,
  parent_task_id: null,
};

state.tasks.push(task);
writeFileSync(TASKS_FILE, JSON.stringify(state, null, 2));
console.log(`[harness] task created: ${task.id} — ${task.title} (${task.business_unit}/${task.priority})`);
