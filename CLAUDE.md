@AGENTS.md

# Round AI Harness

This project is operated by an AI agent system. The harness structure
is under `.ai/`. Read the relevant files before acting.

## Structure
```
.ai/
  agents/           ← Role definitions (orchestrator, review, BU agents)
  policies/         ← BU governance configs (core, ko, en-us, en-ph)
  schemas/          ← Zod data model for tasks, runs, reviews, lessons
  state/            ← Runtime data (tasks.json, runs.json, progress.json)
  scripts/          ← Orchestration scripts (create/dispatch/review task)
```

## Key Rules
- **Document = rules/roles** (`.ai/agents/*.md`, `.ai/policies/*.json`)
- **Data = runtime state** (`.ai/state/*.json`) — changes every execution
- Never guess. Read `.ai/state/progress.json` first.
- Check `.ai/state/lessons.json` before repeating a known mistake.
- Core engine changes require review-agent approval.
- Constitution policies cannot be changed by any agent.

## Policy Levels
- **constitution**: immutable. no agent can change.
- **operating**: requires review-agent pass to change.
- **runtime**: can be auto-updated by agents within scope.

## Market Separation
Each market is an independent product:
- `/` = Korea (ko-KR)
- `/en-us` = US (en-US)
- `/en-ph` = Philippines (en-PH)

Shared: feed engine, Question OS, scoring, admin, infra.
Isolated: questions, choices, DNA, copy, onboarding state.
