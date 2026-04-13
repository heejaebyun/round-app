#!/usr/bin/env node
// 토스 미니앱 빌드용 — next.config.toss.ts를 사용하여 정적 export
import { execSync } from "child_process";
import {
  copyFileSync,
  unlinkSync,
  existsSync,
  rmSync,
  mkdirSync,
  renameSync,
} from "fs";
import { dirname, join } from "path";

const main = "next.config.ts";
const toss = "next.config.toss.ts";
const backup = "next.config.backup.ts";
const tempDir = ".toss-build-temp";
const excludedRoutes = [
  // OG / share
  "app/opengraph-image.tsx",
  "app/api/og/dna/route.tsx",
  "app/dna/share/page.tsx",
  // Auth (server-side, not needed in static export)
  "app/api/auth/toss/login/route.ts",
  "app/api/auth/toss/me/route.ts",
  "app/api/auth/toss/logout/route.ts",
  "app/api/auth/toss/unlink/route.ts",
  "app/api/members/me/route.ts",
  // Admin (must not be in public bundle)
  "app/admin/questions/page.tsx",
  "app/api/admin/login/route.ts",
  "app/api/admin/logout/route.ts",
  "app/api/admin/me/route.ts",
  // Internal ops
  "app/api/internal/question-inspect/route.ts",
  "app/api/internal/question-metrics/route.ts",
  "app/api/internal/question-candidates/route.ts",
  "app/api/internal/question-candidates/[id]/approve/route.ts",
  "app/api/internal/question-candidates/[id]/reject/route.ts",
  "app/api/internal/moderation/replies/route.ts",
  "app/api/internal/moderation/replies/[id]/route.ts",
  // Cron
  "app/api/cron/update-metrics/route.ts",
];

function stashPath(path) {
  if (!existsSync(path)) return;
  const target = join(tempDir, path);
  mkdirSync(dirname(target), { recursive: true });
  renameSync(path, target);
}

function restorePath(path) {
  const target = join(tempDir, path);
  if (!existsSync(target)) return;
  mkdirSync(dirname(path), { recursive: true });
  renameSync(target, path);
}

// 이전 빌드 산출물 정리 (락 충돌 방지)
if (existsSync(".next")) rmSync(".next", { recursive: true, force: true });
if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });

copyFileSync(main, backup);
copyFileSync(toss, main);
excludedRoutes.forEach(stashPath);

try {
  execSync("npx next build", { stdio: "inherit" });
} finally {
  excludedRoutes.forEach(restorePath);
  if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
  copyFileSync(backup, main);
  if (existsSync(backup)) unlinkSync(backup);
}
