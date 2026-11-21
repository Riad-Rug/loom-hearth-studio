import { readdir, stat, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const imageRoot = process.env.IMAGES_ROOT ?? root;
const sourceRoot = path.join(imageRoot, "assets-src");
const publicRoot = path.join(imageRoot, "public");
const manifestPath = path.join(imageRoot, "lib/media/static-images.generated.json");
const slots = [{ name: "thumb", width: 400 }, { name: "card", width: 800 }, { name: "hero", width: 1920 }];
const manifest = {};

async function walk(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return files.flat();
}

for (const source of await walk(sourceRoot)) {
  if (!/\.(png|jpe?g)$/i.test(source)) continue;
  const metadata = await sharp(source).metadata();
  if (!metadata.width) throw new Error(`Cannot read image width: ${source}`);
  const relative = path.relative(sourceRoot, source);
  const stem = relative.replace(/\.(png|jpe?g)$/i, "");
  const sourceBytes = await readFile(source);
  manifest[stem] = {};
  for (const { name: slot, width: slotWidth } of slots) {
    const width = Math.min(slotWidth, metadata.width);
    const hash = createHash("sha1").update(sourceBytes).update(slot).update(String(slotWidth)).update("80").digest("hex").slice(0, 8);
    const output = path.join(publicRoot, `${stem}-${slot}.${hash}.webp`);
    manifest[stem][slot] = `/${path.relative(publicRoot, output).split(path.sep).join("/")}`;
    await mkdir(path.dirname(output), { recursive: true });
    const sourceStat = await stat(source);
    let outputIsCurrent = false;
    try {
      outputIsCurrent = (await stat(output)).mtimeMs >= sourceStat.mtimeMs;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (!outputIsCurrent) {
      await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(output);
    }
    const stemBase = path.basename(stem);
    const escapedStem = stemBase.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const staleVariant = new RegExp(`^${escapedStem}-${slot}\\.[a-f0-9]{8}\\.webp$`);
    for (const file of await readdir(path.dirname(output))) {
      if (staleVariant.test(file) && file !== path.basename(output)) {
        await unlink(path.join(path.dirname(output), file));
      }
    }
  }
}

const sortedManifest = Object.fromEntries(Object.keys(manifest).sort().map((stem) => [stem, manifest[stem]]));
await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(sortedManifest, null, 2)}\n`);
