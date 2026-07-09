/**
 * Regenerate public/favicon_io/* from the official OG short mark (black).
 * Run: npm run generate:favicons
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public/OG logo/OG logo/Short/Black No BG.png");
const outDir = path.join(root, "public/favicon_io");

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

const outputs = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
];

for (const [name, size] of outputs) {
  await sharp(source)
    .resize(size, size, { fit: "contain", background: transparent })
    .png()
    .toFile(path.join(outDir, name));
  console.log(`wrote ${name}`);
}

await sharp(source)
  .resize(32, 32, { fit: "contain", background: transparent })
  .toFile(path.join(outDir, "favicon.ico"));

await sharp(source)
  .resize(32, 32, { fit: "contain", background: transparent })
  .toFile(path.join(root, "public/favicon.ico"));

console.log("wrote favicon.ico");
console.log("wrote public/favicon.ico");
