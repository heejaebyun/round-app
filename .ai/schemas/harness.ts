/**
 * Round AI Harness — core data model.
 *
 * All runtime entities stored as JSON in .ai/state/.
 * Schemas are zod-backed for validation in scripts.
 */

import { z } from "zod";

// ── Task ────────────────────────────────────────────────────────

export const TaskStatus = z.enum(["queued", "running", "review", "done", "failed", "blocked"]);

export const Task = z.object({
  id: z.string(),
  title: z.string(),
  business_unit: z.enum(["core", "toss", "ko", "en-us", "en-ph"]),
  owner_agent: z.string().nullable(),
  status: TaskStatus,
  priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  inputs: z.record(z.unknown()).default({}),
  outputs: z.record(z.unknown()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
  next_action: z.string().nullable().default(null),
  parent_task_id: z.string().nullable().default(null),
});

export type Task = z.infer<typeof Task>;

// ── Agent Run ───────────────────────────────────────────────────

export const AgentRunStatus = z.enum(["running", "completed", "failed", "cancelled"]);

export const AgentRun = z.object({
  id: z.string(),
  task_id: z.string(),
  agent_id: z.string(),
  status: AgentRunStatus,
  started_at: z.string(),
  ended_at: z.string().nullable().default(null),
  input_summary: z.string().default(""),
  output_summary: z.string().default(""),
  error: z.string().nullable().default(null),
  token_usage: z.number().default(0),
});

export type AgentRun = z.infer<typeof AgentRun>;

// ── Review ──────────────────────────────────────────────────────

export const ReviewVerdict = z.enum(["pass", "revise", "escalate"]);

export const Review = z.object({
  id: z.string(),
  task_id: z.string(),
  agent_run_id: z.string().nullable().default(null),
  reviewer_agent: z.string(),
  verdict: ReviewVerdict,
  notes: z.string().default(""),
  created_at: z.string(),
});

export type Review = z.infer<typeof Review>;

// ── Decision ────────────────────────────────────────────────────

export const Decision = z.object({
  id: z.string(),
  task_id: z.string().nullable().default(null),
  made_by: z.string(),
  decision_type: z.enum(["approve", "reject", "defer", "escalate", "policy_change"]),
  reason: z.string(),
  created_at: z.string(),
});

export type Decision = z.infer<typeof Decision>;

// ── Lesson ──────────────────────────────────────────────────────

export const Lesson = z.object({
  id: z.string(),
  scope: z.enum(["core", "toss", "ko", "en-us", "en-ph", "global"]),
  summary: z.string(),
  trigger: z.string().default(""),
  proposed_policy_update: z.string().nullable().default(null),
  created_at: z.string(),
});

export type Lesson = z.infer<typeof Lesson>;

// ── Policy ──────────────────────────────────────────────────────

export const PolicyLevel = z.enum(["constitution", "operating", "runtime"]);

export const Policy = z.object({
  id: z.string(),
  scope: z.enum(["core", "toss", "ko", "en-us", "en-ph"]),
  level: PolicyLevel,
  content: z.string(),
  auto_update_allowed: z.boolean().default(false),
  updated_at: z.string(),
  updated_by: z.string().default("human"),
});

export type Policy = z.infer<typeof Policy>;
