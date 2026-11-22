import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { test } from "node:test";

const script = path.resolve(import.meta.dirname, "build-images.mjs");

async function runBuilder(root) {
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    env: { ...process.env, IMAGES_ROOT: root },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
}

async function writePng(file, color) {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp({ create: { width: 100, height: 60, channels: 3, background: color } }).png().toFile(file);
}

async function variantFiles(directory, stem, slot) {
  return (await readdir(directory)).filter((file) => new RegExp(`^${stem}-${slot}\\.[a-f0-9]{8}\\.webp$`).test(file));
}

test("image builder emits all slots for a narrow source", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "build-images-"));
  try {
    await mkdir(path.join(root, "assets-src"));
    await mkdir(path.join(root, "public"));
    await sharp({ create: { width: 100, height: 60, channels: 3, background: "red" } })
      .png().toFile(path.join(root, "assets-src", "narrow.png"));
    const result = spawnSync(process.execPath, [script], {
      cwd: root,
      env: { ...process.env, IMAGES_ROOT: root },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    const files = await readdir(path.join(root, "public"));
    for (const slot of ["hero", "card", "thumb"]) {
      assert.match(files.join("\n"), new RegExp(`^narrow-${slot}\\.[a-f0-9]{8}\\.webp$`, "m"));
    }
    const firstManifest = await readFile(path.join(root, "lib", "media", "static-images.generated.json"), "utf8");
    const heroFile = files.find((file) => file.includes("-hero."));
    assert.ok(heroFile);
    const firstMtime = (await stat(path.join(root, "public", heroFile))).mtimeMs;
    const second = spawnSync(process.execPath, [script], {
      cwd: root,
      env: { ...process.env, IMAGES_ROOT: root },
      encoding: "utf8",
    });
    assert.equal(second.status, 0, second.stderr);
    assert.equal(await readFile(path.join(root, "lib", "media", "static-images.generated.json"), "utf8"), firstManifest);
    assert.equal((await stat(path.join(root, "public", heroFile))).mtimeMs, firstMtime);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("image builder prunes stale nested hashed variants after source changes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "build-images-prune-"));
  try {
    const source = path.join(root, "assets-src", "folder", "pic.png");
    const outputDir = path.join(root, "public", "folder");
    await writePng(source, "red");
    await runBuilder(root);

    const firstManifest = JSON.parse(await readFile(path.join(root, "lib/media/static-images.generated.json"), "utf8"));
    const oldHero = path.basename(firstManifest["folder/pic"].hero);
    await writeFile(path.join(outputDir, "pic-hero.deadbeef.webp"), "stale");
    await writePng(source, "blue");
    await runBuilder(root);

    const manifest = JSON.parse(await readFile(path.join(root, "lib/media/static-images.generated.json"), "utf8"));
    const heroFiles = await variantFiles(outputDir, "pic", "hero");
    assert.notEqual(path.basename(manifest["folder/pic"].hero), oldHero);
    assert.deepEqual(heroFiles, [path.basename(manifest["folder/pic"].hero)]);
    assert.equal((await readdir(outputDir)).includes("pic-hero.deadbeef.webp"), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("image builder prunes sibling stems without matching their variants", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "build-images-sibling-"));
  try {
    await writePng(path.join(root, "assets-src", "folder", "pic.png"), "red");
    await writePng(path.join(root, "assets-src", "folder", "pic-v2.png"), "blue");
    await runBuilder(root);
    await runBuilder(root);

    const manifest = JSON.parse(await readFile(path.join(root, "lib/media/static-images.generated.json"), "utf8"));
    const outputDir = path.join(root, "public", "folder");
    for (const stem of ["pic", "pic-v2"]) {
      for (const slot of ["thumb", "card", "hero"]) {
        assert.deepEqual(await variantFiles(outputDir, stem, slot), [path.basename(manifest[`folder/${stem}`][slot])]);
      }
    }
    assert.equal((await readdir(outputDir)).length, 6);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
