import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const script = path.resolve(import.meta.dirname, "check-image-budget.mjs");

test("image budget accepts raster files at or below 500 KB", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "image-budget-"));
  try {
    await mkdir(path.join(root, "public"));
    await writeFile(path.join(root, "public", "small.webp"), Buffer.alloc(500 * 1024));
    const result = spawnSync(process.execPath, [script], { cwd: root, env: { ...process.env, IMAGE_BUDGET_ROOT: root }, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("image budget names oversized files and recommends rebuilding images", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "image-budget-"));
  try {
    await mkdir(path.join(root, "public"));
    await writeFile(path.join(root, "public", "large.png"), Buffer.alloc(500 * 1024 + 1));
    const result = spawnSync(process.execPath, [script], { cwd: root, env: { ...process.env, IMAGE_BUDGET_ROOT: root }, encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /large\.png.*501 KB.*500 KB.*npm run images/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
