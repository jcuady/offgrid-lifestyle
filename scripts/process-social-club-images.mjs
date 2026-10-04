import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = path.resolve("OFF_GRID_WEBSITE_PRODUCTS/17_The_Social_Club_Collection");
const TARGET_DIR = path.resolve("public/images/products");

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const ITEMS = [
  { src: "The Social Club.png", dest: "social-club-cover.webp" },
  { src: "Chill Sunday.png", dest: "social-club-chill-sunday.webp" },
  { src: "Coffee and Cup.png", dest: "social-club-coffee-cup.webp" },
  { src: "Dink and Drink.png", dest: "social-club-dink-drink.webp" },
  { src: "Matcha Therapy.png", dest: "social-club-matcha-therapy.webp" },
];

async function run() {
  for (const item of ITEMS) {
    const inputPath = path.join(SOURCE_DIR, item.src);
    const outputPath = path.join(TARGET_DIR, item.dest);

    if (!fs.existsSync(inputPath)) {
      console.warn(`[SKIP] Missing: ${inputPath}`);
      continue;
    }

    const stat = fs.statSync(inputPath);
    await sharp(inputPath)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(outputPath);

    const outStat = fs.statSync(outputPath);
    console.log(`[OK] ${item.dest} (${(stat.size / 1024).toFixed(0)}KB -> ${(outStat.size / 1024).toFixed(0)}KB)`);
  }
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
