#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const apiDir = path.join(rootDir, "src", "app", "api");
const apiBackupDir = path.join(rootDir, ".gh-pages-api-backup");

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

try {
  if (existsSync(apiDir)) {
    rmSync(apiBackupDir, { recursive: true, force: true });
    run("cp", ["-r", apiDir, apiBackupDir]);
    rmSync(apiDir, { recursive: true, force: true });
  }

  run("npm", ["run", "build"], {
    GITHUB_PAGES: "true",
    GITHUB_REPOSITORY_NAME: "my-site",
    NEXT_PUBLIC_STATIC_EXPORT: "true",
  });
} finally {
  if (existsSync(apiBackupDir)) {
    rmSync(apiDir, { recursive: true, force: true });
    run("cp", ["-r", apiBackupDir, apiDir]);
    rmSync(apiBackupDir, { recursive: true, force: true });
  }
}

console.log("GitHub Pages static export ready in ./out");
