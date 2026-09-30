import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = path.resolve("OFF_GRID_WEBSITE_PRODUCTS");
const TARGET_DIR = path.resolve("public/images/products");

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Map each source relative file path to a target webp filename
const IMAGE_MAPPINGS = [
  // 01_Running_Performance_Line
  { src: "01_Running_Performance_Line/Running_2.0_Master_Collection_Cover.png", dest: "running-performance-cover.webp" },
  { src: "01_Running_Performance_Line/Running_Black_Offgrid_Classic_Shirt_Mockup.png", dest: "running-classic-black.webp" },
  { src: "01_Running_Performance_Line/Running_Blue_The_Flow_State_Shirt_Mockup.png", dest: "running-flow-state-blue.webp" },
  { src: "01_Running_Performance_Line/Running_Green_Run_With_Purpose_Shirt_Mockup.png", dest: "running-purpose-green.webp" },
  { src: "01_Running_Performance_Line/Running_Cream_Catch_Me_If_You_Can_Shirt_Mockup.png", dest: "running-catch-me-cream.webp" },
  { src: "01_Running_Performance_Line/Running_Dark_Gray_The_Stride_Club_Shirt_Mockup.png", dest: "running-stride-club-gray.webp" },

  // 02_Stride_Collection_Running
  { src: "02_Stride_Collection_Running/Good_Day_Chasing_PR_Banner.jpeg", dest: "stride-running-banner.webp" },
  { src: "02_Stride_Collection_Running/Good_Day_Promo_Price_Slate_PHP900.jpeg", dest: "stride-running-promo.webp" },
  { src: "02_Stride_Collection_Running/ph-11134207-7ra0t-mcli5o3vkvvy30@resize_w900_nl.webp", dest: "stride-running-grid.webp" },
  { src: "02_Stride_Collection_Running/ph-11134207-7rasj-matp7sznapfyc9.webp", dest: "stride-running-detail.webp" },

  // 03_Pickleball_Performance_Line
  { src: "03_Pickleball_Performance_Line/everyday is pickleday.webp", dest: "pickleball-everyday-pickleday.webp" },
  { src: "03_Pickleball_Performance_Line/od dink different.webp", dest: "pickleball-dink-different.webp" },
  { src: "03_Pickleball_Performance_Line/og pickleball club.webp", dest: "pickleball-club-legacy.webp" },
  { src: "03_Pickleball_Performance_Line/pickleball lifestyle shirt.webp", dest: "pickleball-lifestyle-shirt.webp" },
  { src: "03_Pickleball_Performance_Line/Pickleball_Alternative_Collection_Cover.png", dest: "pickleball-alt-cover.webp" },
  { src: "03_Pickleball_Performance_Line/Pickleball_Graphic_Get_Dink_On_Mockup.png", dest: "pickleball-get-dink-on.webp" },
  { src: "03_Pickleball_Performance_Line/Pickleball_Graphic_Pocket_Print_Mockup.png", dest: "pickleball-pocket-print.webp" },
  { src: "03_Pickleball_Performance_Line/Pickleball_Graphic_Summer_League_Mockup.png", dest: "pickleball-summer-league.webp" },
  { src: "03_Pickleball_Performance_Line/salmon smasher longsleeves.webp", dest: "pickleball-salmon-smasher-ls.webp" },
  { src: "03_Pickleball_Performance_Line/salmon smasher tshirt.webp", dest: "pickleball-salmon-smasher-ss.webp" },

  // 04_Pilipinas_AOUC_Jersey
  { src: "04_Pilipinas_AOUC_Jersey/ph-11134207-7ra0m-md4czg7p758ged.webp", dest: "pilipinas-aouc-capiz.webp" },
  { src: "04_Pilipinas_AOUC_Jersey/ph-11134207-7ra0n-md4czg8j5x0u55.webp", dest: "pilipinas-aouc-lilim.webp" },
  { src: "04_Pilipinas_AOUC_Jersey/ph-11134207-7ra0q-md4czcxrzpkw1f.webp", dest: "pilipinas-aouc-piloncitos.webp" },

  // 05_OG_Vibe_Streetwear
  { src: "05_OG_Vibe_Streetwear/ph-11134207-81ztk-mh8xmni0u8sq62.webp", dest: "og-vibe-steampunk-black.webp" },
  { src: "05_OG_Vibe_Streetwear/ph-11134207-81ztn-mh8vg5dd1nuy67.webp", dest: "og-vibe-blossom-black.webp" },
  { src: "05_OG_Vibe_Streetwear/ph-11134207-81zto-mh8xmnhqt8uia7.webp", dest: "og-vibe-steampunk-cream.webp" },
  { src: "05_OG_Vibe_Streetwear/ph-11134207-81ztq-mh8uzamy4gsob4.webp", dest: "og-vibe-blossom-cream.webp" },

  // 06_Gym_Line_Primal_Power
  // Hoodie
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Hoodie_Black_Green.png", dest: "primal-hoodie-black-green.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Hoodie_Blue_Ivory.png", dest: "primal-hoodie-blue-ivory.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Hoodie_Green_Pink.png", dest: "primal-hoodie-green-pink.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Hoodie_Teal_White.png", dest: "primal-hoodie-teal-white.webp" },
  // Longsleeve
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Longsleeve_Black_Green.png", dest: "primal-longsleeve-black-green.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Longsleeve_Blue_Ivory.png", dest: "primal-longsleeve-blue-ivory.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Longsleeve_Green_Pink.png", dest: "primal-longsleeve-green-pink.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Longsleeve_Teal_White.png", dest: "primal-longsleeve-teal-white.webp" },
  // Shortsleeve
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Shortsleeve_Black_Green.png", dest: "primal-shortsleeve-black-green.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Shortsleeve_Blue_Ivory.png", dest: "primal-shortsleeve-blue-ivory.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Shortsleeve_Green_Pink.png", dest: "primal-shortsleeve-green-pink.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Shortsleeve_Teal_White.png", dest: "primal-shortsleeve-teal-white.webp" },
  // Sleeveless Tank
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Sleeveless_Tank_Black_Green.png", dest: "primal-sleeveless-black-green.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Sleeveless_Tank_Blue_Ivory.png", dest: "primal-sleeveless-blue-ivory.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Sleeveless_Tank_Green_Pink.png", dest: "primal-sleeveless-green-pink.webp" },
  { src: "06_Gym_Line_Primal_Power/Primal_Power_Sleeveless_Tank_Teal_White.png", dest: "primal-sleeveless-teal-white.webp" },

  // 07_Gym_Line_Solar_Rise
  // Longsleeve
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Longsleeve_Blue_Yellow.png", dest: "solar-longsleeve-blue-yellow.webp" },
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Longsleeve_White_Red.png", dest: "solar-longsleeve-white-red.webp" },
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Longsleeve_White_Teal.png", dest: "solar-longsleeve-white-teal.webp" },
  // Shortsleeve
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Shortsleeve_Blue_Yellow.png", dest: "solar-shortsleeve-blue-yellow.webp" },
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Shortsleeve_White_Red.png", dest: "solar-shortsleeve-white-red.webp" },
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Shortsleeve_White_Teal.png", dest: "solar-shortsleeve-white-teal.webp" },
  // Sleeveless
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Sleeveless_Tank_Black_Teal.png", dest: "solar-sleeveless-black-teal.webp" },
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Sleeveless_Tank_Black_Yellow.png", dest: "solar-sleeveless-black-yellow.webp" },
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Sleeveless_Tank_Blue_Yellow.png", dest: "solar-sleeveless-blue-yellow.webp" },
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Sleeveless_Tank_White_Red.png", dest: "solar-sleeveless-white-red.webp" },
  { src: "07_Gym_Line_Solar_Rise/Solar_Rise_Sleeveless_Tank_White_Teal.png", dest: "solar-sleeveless-white-teal.webp" },

  // 08_Moto_Line
  { src: "08_Moto_Line/cover.webp", dest: "motoline-cover.webp" },
  { src: "08_Moto_Line/full throttle life.webp", dest: "motoline-full-throttle.webp" },
  { src: "08_Moto_Line/stay offgrid.webp", dest: "motoline-stay-offgrid.webp" },
  { src: "08_Moto_Line/takbong og.webp", dest: "motoline-takbong-og.webp" },
  { src: "08_Moto_Line/takbong pogi mode.webp", dest: "motoline-takbong-pogi.webp" },

  // 09_Golf_Line
  { src: "09_Golf_Line/Golf_Master_Collection_Cover.png", dest: "golf-links-cover.webp" },
  { src: "09_Golf_Line/Golf_Navy_Blue_One_More_Swing_Mockup.png", dest: "golf-navy-blue.webp" },
  { src: "09_Golf_Line/Golf_Pink_One_More_Swing_Mockup.png", dest: "golf-pink.webp" },
  { src: "09_Golf_Line/Golf_Teal_Green_Trust_The_Swing_Mockup.png", dest: "golf-teal-green.webp" },

  // 10_Lifestyle_Momentum_Caps
  { src: "10_Lifestyle_Momentum_Caps/ph-11134207-7rasl-m5uvv1mvgcnu60.webp", dest: "momentum-cap-cover.webp" },
  { src: "10_Lifestyle_Momentum_Caps/ph-11134207-7ras9-m5uvv95yfngi26.webp", dest: "momentum-cap-dark-blue.webp" },
  { src: "10_Lifestyle_Momentum_Caps/ph-11134207-7rasd-m5uvv5v79fnm42.webp", dest: "momentum-cap-white.webp" },
  { src: "10_Lifestyle_Momentum_Caps/ph-11134207-7rase-m5uvv4f1drtm92.webp", dest: "momentum-cap-black.webp" },
  { src: "10_Lifestyle_Momentum_Caps/ph-11134207-7rasf-m5uvv2tlpthe30.webp", dest: "momentum-cap-sky-blue.webp" },
  { src: "10_Lifestyle_Momentum_Caps/ph-11134207-7rasg-m5uvv7hqvriy6a.webp", dest: "momentum-cap-pink.webp" },

  // 13_Pilipinas_Ultimate_Jersey
  { src: "13_Pilipinas_Ultimate_Jersey/ph-11134207-81zti-miecf9blu3uq2f.webp", dest: "pilipinas-ultimate-blue.webp" },
  { src: "13_Pilipinas_Ultimate_Jersey/ph-11134207-81zth-miec7p9pjy14b8.webp", dest: "pilipinas-ultimate-white.webp" },

  // 14_Lifestyle_Towels
  { src: "14_Lifestyle_Towels/Microfiber_Towels_Full_Printed_Promo.jpg", dest: "towel-microfiber-promo.webp" },
  { src: "14_Lifestyle_Towels/Microfiber_Towels_Progress_Design.jpg", dest: "towel-microfiber-progress.webp" },
  { src: "14_Lifestyle_Towels/Microfiber_Hand_Towel_Spec_14x28.jpg", dest: "towel-microfiber-hand-spec.webp" },
  { src: "14_Lifestyle_Towels/Microfiber_Towel_Detail.jpg", dest: "towel-microfiber-detail.webp" },
  { src: "14_Lifestyle_Towels/Microfiber_Towel_Flatlay.jpg", dest: "towel-microfiber-flatlay.webp" },

  // 15_OG_Pilipinas_Padayon
  { src: "15_OG_Pilipinas_Padayon/ph-11134207-7rasa-maxyrxx5z16w44.webp", dest: "pilipinas-padayon-jersey.webp" },

  // 16_Pickleball_Club_Collection
  { src: "16_Pickleball_Club_Collection/Pickleball_Club_Master_Cover_Card.png", dest: "pickleball-club-cover.webp" },
  { src: "16_Pickleball_Club_Collection/Pickleball_Club_Black_Shirt_Mockup.png", dest: "pickleball-club-black.webp" },
  { src: "16_Pickleball_Club_Collection/Pickleball_Club_Cream_Shirt_Mockup.png", dest: "pickleball-club-cream.webp" },
  { src: "16_Pickleball_Club_Collection/Pickleball_Club_Green_Shirt_Mockup.png", dest: "pickleball-club-green.webp" },
  { src: "16_Pickleball_Club_Collection/Pickleball_Club_Violet_Shirt_Mockup.png", dest: "pickleball-club-violet.webp" },
  { src: "16_Pickleball_Club_Collection/Pickleball_Club_White_Shirt_Mockup.png", dest: "pickleball-club-white.webp" },
];

async function run() {
  console.log(`Starting image optimization for ${IMAGE_MAPPINGS.length} mockups...`);
  let successCount = 0;
  let totalOrigBytes = 0;
  let totalOptimizedBytes = 0;

  for (const item of IMAGE_MAPPINGS) {
    const inputPath = path.join(SOURCE_DIR, item.src);
    const outputPath = path.join(TARGET_DIR, item.dest);

    if (!fs.existsSync(inputPath)) {
      console.warn(`[SKIP] Missing source: ${inputPath}`);
      continue;
    }

    const inputStat = fs.statSync(inputPath);
    totalOrigBytes += inputStat.size;

    await sharp(inputPath)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(outputPath);

    const outStat = fs.statSync(outputPath);
    totalOptimizedBytes += outStat.size;
    successCount++;
    console.log(`[OK] ${item.dest} (${(inputStat.size / 1024).toFixed(0)}KB -> ${(outStat.size / 1024).toFixed(0)}KB)`);
  }

  console.log(`\nCompleted! Processed ${successCount}/${IMAGE_MAPPINGS.length} images.`);
  console.log(`Original size: ${(totalOrigBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Optimized size: ${(totalOptimizedBytes / (1024 * 1024)).toFixed(2)} MB`);
}

run().catch((err) => {
  console.error("Image processing error:", err);
  process.exit(1);
});
