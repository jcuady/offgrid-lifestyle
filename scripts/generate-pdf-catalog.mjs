import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

function toBase64(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found for base64: ${filePath}`);
    return "";
  }
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const mime =
    ext === "webp"
      ? "image/webp"
      : ext === "png"
        ? "image/png"
        : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "svg"
            ? "image/svg+xml"
            : "application/octet-stream";
  const data = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${data}`;
}

const logoBlack = toBase64("public/OG logo/OG logo/Complete/Black No BG.png");

// Collect product images as base64
const img = {
  aouc: toBase64("public/images/products/pilipinas-aouc-capiz.webp"),
  ultimateBlue: toBase64("public/images/products/pilipinas-ultimate-blue.webp"),
  padayon: toBase64("public/images/products/pilipinas-padayon-jersey.webp"),
  primalSleeveless: toBase64("public/images/products/primal-sleeveless-black-green.webp"),
  primalShortsleeve: toBase64("public/images/products/primal-shortsleeve-teal-white.webp"),
  primalLongsleeve: toBase64("public/images/products/primal-longsleeve-blue-ivory.webp"),
  primalHoodie: toBase64("public/images/products/primal-hoodie-black-green.webp"),
  solarSleeveless: toBase64("public/images/products/solar-sleeveless-white-teal.webp"),
  solarShortsleeve: toBase64("public/images/products/solar-shortsleeve-white-red.webp"),
  solarLongsleeve: toBase64("public/images/products/solar-longsleeve-blue-yellow.webp"),
  runningTee: toBase64("public/images/products/running-performance-cover.webp"),
  runningFlowState: toBase64("public/images/products/running-flow-state-blue.webp"),
  strideRunning: toBase64("public/images/products/stride-running-grid.webp"),
  pickleClub: toBase64("public/images/products/pickleball-club-cover.webp"),
  pickleClubCream: toBase64("public/images/products/pickleball-club-cream.webp"),
  pickleGraphics: toBase64("public/images/products/pickleball-alt-cover.webp"),
  salmonSS: toBase64("public/images/products/pickleball-salmon-smasher-ss.webp"),
  salmonLS: toBase64("public/images/products/pickleball-salmon-smasher-ls.webp"),
  golfCover: toBase64("public/images/products/golf-links-cover.webp"),
  golfNavy: toBase64("public/images/products/golf-navy-blue.webp"),
  golfPink: toBase64("public/images/products/golf-pink.webp"),
  golfTeal: toBase64("public/images/products/golf-teal-green.webp"),
  motolineCover: toBase64("public/images/products/motoline-cover.webp"),
  motolineThrottle: toBase64("public/images/products/motoline-full-throttle.webp"),
  vibeBanner: toBase64("public/images/products/og-vibe-photoshoot-banner.webp"),
  vibeSteampunk: toBase64("public/images/products/og-vibe-steampunk-black.webp"),
  capCover: toBase64("public/images/products/momentum-cap-cover.webp"),
  capDarkBlue: toBase64("public/images/products/momentum-cap-dark-blue.webp"),
  towelPromo: toBase64("public/images/products/towel-microfiber-promo.webp"),
  towelDetail: toBase64("public/images/products/towel-microfiber-detail.webp"),
};

console.log("Generating 15-slide White Edition HTML template...");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>OFFGRID® Lifestyle — 2026 Catalog & Teamwear Showcase (White Edition)</title>
<style>
  @page {
    size: 1920px 1080px;
    margin: 0;
  }
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    background-color: #FFFFFF;
    color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  a {
    color: inherit;
    text-decoration: none;
  }

  .slide {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    break-after: page;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 55px 75px 45px 75px;
    background: #FFFFFF;
    border-bottom: 2px solid #E2E8F0;
  }

  /* Ambient Brand Lighting on Light Canvas */
  .glow-blue {
    position: absolute;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 10, 255, 0.05) 0%, rgba(0, 10, 255, 0) 70%);
    pointer-events: none;
    z-index: 1;
  }
  .glow-top-right {
    top: -200px;
    right: -200px;
  }
  .glow-bottom-left {
    bottom: -250px;
    left: -200px;
  }

  /* Slide Header */
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
  }
  .brand-logo {
    height: 44px;
    object-fit: contain;
  }
  .slide-eyebrow {
    font-family: "Courier New", Courier, monospace;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #000AFF;
    background: rgba(0, 10, 255, 0.08);
    border: 1px solid rgba(0, 10, 255, 0.28);
    padding: 6px 14px;
    border-radius: 9999px;
    display: inline-block;
  }

  /* Slide Body */
  .slide-body {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 16px 0;
  }

  .slide-title {
    font-size: 52px;
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1.05;
    text-transform: uppercase;
    color: #000000;
    margin-bottom: 10px;
  }
  .slide-title span.blue {
    color: #000AFF;
  }
  .slide-subtitle {
    font-size: 19px;
    line-height: 1.45;
    color: #475569;
    max-width: 1200px;
    margin-bottom: 24px;
  }

  /* Slide Footer */
  .slide-footer {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #E2E8F0;
    padding-top: 18px;
    font-size: 13.5px;
    color: #64748B;
    font-family: "Courier New", Courier, monospace;
  }
  .footer-gateways {
    display: flex;
    gap: 22px;
    align-items: center;
  }
  .footer-gateway-link {
    color: #000000;
    font-weight: 800;
    letter-spacing: 0.05em;
  }
  .footer-gateway-link:hover {
    color: #000AFF;
  }
  .footer-page-num {
    font-weight: 800;
    color: #000000;
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    padding: 4px 12px;
    border-radius: 6px;
  }

  /* Product Grid Layouts */
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 36px;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }
  .grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  /* Product Card (Crisp Framed Showcase) */
  .product-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .product-card.featured {
    border-color: #000AFF;
    box-shadow: 0 10px 30px rgba(0, 10, 255, 0.08);
  }
  .product-img-box {
    width: 100%;
    background: #FFFFFF;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    border: 1px solid #E2E8F0;
  }
  .product-img-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .product-tag {
    font-family: "Courier New", Courier, monospace;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.16em;
    color: #000AFF;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .product-name {
    font-size: 19px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: #000000;
    margin-bottom: 6px;
    line-height: 1.2;
  }
  .product-desc {
    font-size: 13px;
    line-height: 1.4;
    color: #475569;
    margin-bottom: 12px;
    flex: 1;
  }
  .product-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #E2E8F0;
    padding-top: 10px;
    font-family: "Courier New", Courier, monospace;
    font-size: 11px;
    font-weight: 700;
    color: #334155;
  }
  .product-pill {
    background: rgba(0, 10, 255, 0.1);
    border: 1px solid rgba(0, 10, 255, 0.3);
    color: #000AFF;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 800;
  }

  /* CTAs & Buttons */
  .btn-electric {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #000AFF;
    color: #FFFFFF;
    font-weight: 800;
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 16px 36px;
    border-radius: 9999px;
    border: none;
    box-shadow: 0 6px 20px rgba(0, 10, 255, 0.3);
  }
  .btn-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #FFFFFF;
    color: #000000;
    font-weight: 800;
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 16px 36px;
    border-radius: 9999px;
    border: 1.5px solid #CBD5E1;
  }

  /* Special Feature Layouts */
  .split-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .feature-box {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 30px;
    margin-bottom: 20px;
  }
  .feature-box.highlight {
    border-color: #000AFF;
    background: linear-gradient(135deg, rgba(0, 10, 255, 0.05) 0%, #F8FAFC 100%);
  }
  .feature-box-title {
    font-size: 22px;
    font-weight: 900;
    color: #000000;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .feature-box-desc {
    font-size: 15px;
    line-height: 1.5;
    color: #475569;
  }

  /* Flow Steps */
  .step-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 26px;
    position: relative;
  }
  .step-num {
    font-family: "Courier New", Courier, monospace;
    font-size: 38px;
    font-weight: 900;
    color: #000AFF;
    margin-bottom: 12px;
    line-height: 1;
  }
  .step-title {
    font-size: 19px;
    font-weight: 900;
    text-transform: uppercase;
    color: #000000;
    margin-bottom: 8px;
  }
  .step-desc {
    font-size: 14px;
    line-height: 1.5;
    color: #475569;
  }
</style>
</head>
<body>

<!-- SLIDE 1: COVER (MINIMALIST TYPOGRAPHIC ON PURE WHITE) -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="glow-blue glow-bottom-left"></div>

  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">2026 OFFICIAL CATALOG & TEAMWEAR SPECIFICATIONS</span>
  </div>

  <div class="slide-body" style="justify-content: center; padding-left: 20px;">
    <div style="max-width: 1300px;">
      <div style="display: flex; gap: 14px; margin-bottom: 30px;">
        <span class="slide-eyebrow" style="background: rgba(0, 10, 255, 0.1); border-color: rgba(0, 10, 255, 0.35); color: #000AFF;">
          WORLDWIDE SHIPPING
        </span>
        <span class="slide-eyebrow" style="background: #F1F5F9; border-color: #CBD5E1; color: #000000;">
          FULL SUBLIMATION SPECIALISTS
        </span>
        <span class="slide-eyebrow" style="background: #F1F5F9; border-color: #CBD5E1; color: #000000;">
          2XS–5XL INCLUSIVE SIZING
        </span>
      </div>

      <h1 class="slide-title" style="font-size: 88px; line-height: 0.95; margin-bottom: 28px; letter-spacing: -0.04em;">
        HIGH-PERFORMANCE<br>
        ACTIVEWEAR &<br>
        <span class="blue">CUSTOM TEAMWEAR.</span>
      </h1>

      <p class="slide-subtitle" style="font-size: 26px; max-width: 980px; line-height: 1.45; color: #475569; margin-bottom: 40px;">
        Engineered for athletes, clubs, and national tournament teams worldwide. 
        Competition-grade performance fabrics and fully customized team kits.
      </p>

      <div style="display: flex; gap: 20px; align-items: center;">
        <a href="https://oglifestyleph.com/custom/order" class="btn-electric" style="font-size: 16px; padding: 18px 44px;">
          START CUSTOM TEAM ORDER →
        </a>
        <a href="https://oglifestyleph.com" class="btn-outline" style="font-size: 16px; padding: 18px 44px;">
          EXPLORE CATALOG ONLINE
        </a>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® LIFESTYLE · OFFICIAL BRAND CATALOG</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
      <span>·</span>
      <a href="https://www.instagram.com/offgridlifestyleph/" class="footer-gateway-link">@OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 01 / 15</div>
  </div>
</div>

<!-- SLIDE 2: WORLDWIDE SHIPPING & GLOBAL REACH -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">GLOBAL REACH & LOGISTICS</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">ENGINEERED FOR ATHLETES EVERYWHERE.<br><span class="blue">SHIPPED WORLDWIDE.</span></h2>
    <p class="slide-subtitle">
      OFFGRID crafts tournament-grade performance apparel and custom team kits trusted by national squads, competitive clubs, and sports communities across the globe. Our dedicated international logistics pipeline ensures seamless door-to-door delivery wherever your squad plays.
    </p>

    <div class="grid-3" style="margin-top: 15px;">
      <div class="feature-box highlight">
        <div style="font-size: 36px; margin-bottom: 14px;">✈️</div>
        <div class="feature-box-title">WORLDWIDE EXPRESS COURIER</div>
        <div class="feature-box-desc">
          Direct air courier dispatch for all international clients abroad. Fast door-to-door transit, verified end-to-end flight tracking, and export-compliant customs handling.
        </div>
      </div>

      <div class="feature-box">
        <div style="font-size: 36px; margin-bottom: 14px;">🌐</div>
        <div class="feature-box-title">INTERNATIONAL DESK CONCIERGE</div>
        <div class="feature-box-desc">
          Dedicated account managers for international clubs and tournament teams. Seamless digital roster coordination, timezone-friendly communication, and multi-currency quotes.
        </div>
      </div>

      <div class="feature-box">
        <div style="font-size: 36px; margin-bottom: 14px;">📦</div>
        <div class="feature-box-title">ROSTER-SORTED PACKAGING</div>
        <div class="feature-box-desc">
          Every custom team order is individually packed, labeled by player name, number, and size. When the package arrives at your clubhouse, handing out kits takes minutes.
        </div>
      </div>
    </div>

    <div style="margin-top: 30px; display: flex; gap: 20px; align-items: center;">
      <a href="https://www.facebook.com/offgridlifestyleph" class="btn-electric">Connect with International Team Desk →</a>
      <a href="https://oglifestyleph.com" class="btn-outline">Visit Official Storefront</a>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® LIFESTYLE · WORLDWIDE TEAMWEAR</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
      <span>·</span>
      <a href="https://www.instagram.com/offgridlifestyleph/" class="footer-gateway-link">@OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 02 / 15</div>
  </div>
</div>

<!-- SLIDE 3: CUSTOM TEAMWEAR CAPABILITIES -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">CUSTOM MANUFACTURING CAPABILITIES</span>
  </div>

  <div class="slide-body">
    <div class="split-layout">
      <div>
        <h2 class="slide-title">CUSTOM TEAM ORDERS.<br><span class="blue">YOUR EXACT VISION.</span></h2>
        <p class="slide-subtitle" style="font-size: 18px; margin-bottom: 24px;">
          No hard ceilings on squad or league quantities. From tight-knit 10-player club teams to entire 500-athlete tournament divisions, OFFGRID manufactures competition-grade gear tailored to your exact specifications.
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 22px; font-weight: bold;">✓</span>
            <div><strong>Full Sublimation Game Jerseys</strong> · Unlimited custom graphics, gradients, and logos.</div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 22px; font-weight: bold;">✓</span>
            <div><strong>Performance Team Shorts</strong> · Custom inseam lengths, reinforced side splits, optional zip pockets.</div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 22px; font-weight: bold;">✓</span>
            <div><strong>Reversible Pinnies & Scrimmage Kits</strong> · Ultra-breathable dual-layer tournament practice jerseys.</div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 22px; font-weight: bold;">✓</span>
            <div><strong>Team Hoodies & Outerwear</strong> · Pre-game thermal layers customized with team crests.</div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 22px; font-weight: bold;">✓</span>
            <div><strong>Sideline Accessories</strong> · Custom embroidered team caps and player-named microfiber towels.</div>
          </div>
        </div>

        <div style="margin-top: 32px;">
          <a href="https://oglifestyleph.com/custom/order" class="btn-electric">Start Custom Order at oglifestyleph.com/custom/order →</a>
        </div>
      </div>

      <div class="grid-2">
        <div class="product-card" style="padding: 14px;">
          <div class="product-img-box" style="height: 230px;"><img src="${img.ultimateBlue}"></div>
          <div class="product-name" style="font-size: 16px;">GAME UNIFORMS</div>
          <div class="product-desc" style="font-size: 12px; margin-bottom: 0;">Full-sublimation matchday jerseys & shorts with individual names and numbers.</div>
        </div>
        <div class="product-card" style="padding: 14px;">
          <div class="product-img-box" style="height: 230px;"><img src="${img.primalHoodie}"></div>
          <div class="product-name" style="font-size: 16px;">TEAM OUTERWEAR</div>
          <div class="product-desc" style="font-size: 12px; margin-bottom: 0;">Warmup hoodies, shooter shirts, and windbreaker layers engineered for squads.</div>
        </div>
        <div class="product-card" style="padding: 14px;">
          <div class="product-img-box" style="height: 230px;"><img src="${img.capCover}"></div>
          <div class="product-name" style="font-size: 16px;">CUSTOM HEADWEAR</div>
          <div class="product-desc" style="font-size: 12px; margin-bottom: 0;">Structured athletic caps, visors, and bucket hats with high-density team embroidery.</div>
        </div>
        <div class="product-card" style="padding: 14px;">
          <div class="product-img-box" style="height: 230px;"><img src="${img.towelPromo}"></div>
          <div class="product-name" style="font-size: 16px;">SIDELINE ESSENTIALS</div>
          <div class="product-desc" style="font-size: 12px; margin-bottom: 0;">Sublimated microfiber team towels and custom team banners for sidelines.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® LIFESTYLE · CUSTOM UNIFORM SPECIALISTS</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
      <span>·</span>
      <a href="https://www.instagram.com/offgridlifestyleph/" class="footer-gateway-link">@OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 03 / 15</div>
  </div>
</div>

<!-- SLIDE 4: FABRIC TECHNOLOGY & ENGINEERING -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">MATERIAL SCIENCE & ENGINEERING</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PROPRIETARY FABRIC SYSTEMS.<br><span class="blue">PERFORMANCE FIRST.</span></h2>
    <p class="slide-subtitle">
      Every garment is designed from the fiber up. Tested under extreme heat, sweat saturation, and intense contact play to guarantee maximum mobility and zero distractions.
    </p>

    <div class="grid-4" style="margin-top: 15px;">
      <div class="feature-box" style="margin-bottom: 0;">
        <div style="font-family: monospace; font-size: 12px; color: #000AFF; font-weight: 800; margin-bottom: 8px;">TECH FABRIC 01</div>
        <div class="feature-box-title" style="font-size: 20px;">HYPER-WICK POLYESTER</div>
        <div class="feature-box-desc">
          4-way mechanical stretch activewear yarn. Pulls perspiration away from skin instantly, evaporating moisture 3x faster than standard athletic poly.
        </div>
      </div>

      <div class="feature-box" style="margin-bottom: 0;">
        <div style="font-family: monospace; font-size: 12px; color: #000AFF; font-weight: 800; margin-bottom: 8px;">TECH FABRIC 02</div>
        <div class="feature-box-title" style="font-size: 20px;">DYNAMIC AIR-MESH</div>
        <div class="feature-box-desc">
          Laser-mapped micro-perforation panels placed across high-heat zones. Provides continuous airflow during intense tournament matches.
        </div>
      </div>

      <div class="feature-box" style="margin-bottom: 0;">
        <div style="font-family: monospace; font-size: 12px; color: #000AFF; font-weight: 800; margin-bottom: 8px;">TECH FABRIC 03</div>
        <div class="feature-box-title" style="font-size: 20px;">COMBED STREET COTTON</div>
        <div class="feature-box-desc">
          Heavyweight 100% pre-shrunk combed cotton. Ultra-soft handfeel with reinforced collar ribbing designed for enduring off-court streetwear comfort.
        </div>
      </div>

      <div class="feature-box" style="margin-bottom: 0;">
        <div style="font-family: monospace; font-size: 12px; color: #000AFF; font-weight: 800; margin-bottom: 8px;">TECH FABRIC 04</div>
        <div class="feature-box-title" style="font-size: 20px;">WAFFLE MICROFIBER</div>
        <div class="feature-box-desc">
          High-density split-microfiber weave. Absorbs 5x its dry weight in moisture while remaining lightweight, lint-free, and rapid-drying on the bench.
        </div>
      </div>
    </div>

    <div class="feature-box highlight" style="margin-top: 26px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 18px; font-weight: 800; color: #000000; text-transform: uppercase;">THERMAL MOLECULAR SUBLIMATION STANDARDS</div>
        <div style="font-size: 14px; color: #475569; margin-top: 4px;">Dye pigments are infused directly into fibers under high pressure and heat. Graphics will never crack, peel, or fade.</div>
      </div>
      <a href="https://oglifestyleph.com/custom/order" class="btn-electric" style="padding: 12px 28px; font-size: 13px;">Inquire for Fabric Swatches →</a>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® LIFESTYLE · MATERIAL SCIENCE SPECIFICATIONS</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
      <span>·</span>
      <a href="https://www.instagram.com/offgridlifestyleph/" class="footer-gateway-link">@OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 04 / 15</div>
  </div>
</div>

<!-- SLIDE 5: ULTIMATE FRISBEE — PILIPINAS COLLECTION (EXTRA LARGE PHOTOS) -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · ULTIMATE FRISBEE</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PILIPINAS NATIONAL TEAM COLLECTION.<br><span class="blue">CHAMPIONSHIP TESTED.</span></h2>
    <p class="slide-subtitle">
      The pinnacle of tournament ultimate apparel. Full-sublimation activewear engineered for extreme layout extension, overhead throws, and all-day tropical performance.
    </p>

    <div class="grid-3" style="margin-top: 10px;">
      <div class="product-card featured">
        <div class="product-img-box" style="height: 480px;"><img src="${img.aouc}"></div>
        <div class="product-tag">NATIONAL TEAM 2025 · CAPIZ / LILIM / PILONCITOS</div>
        <div class="product-name">PILIPINAS AOUC JERSEY 2025</div>
        <div class="product-meta-row">
          <span>DRYFIT POLYESTER · TOURNAMENT CUT</span>
          <span class="product-pill">SIZES 2XS–5XL</span>
        </div>
      </div>

      <div class="product-card featured">
        <div class="product-img-box" style="height: 480px;"><img src="${img.ultimateBlue}"></div>
        <div class="product-tag">TEAM OFFICIAL · NATIONAL BLUE & WHITE</div>
        <div class="product-name">PILIPINAS ULTIMATE TEAM JERSEY</div>
        <div class="product-meta-row">
          <span>PRO DRYFIT · TAILORED RAGLAN SLEEVE</span>
          <span class="product-pill">SIZES 2XS–5XL</span>
        </div>
      </div>

      <div class="product-card featured">
        <div class="product-img-box" style="height: 480px;"><img src="${img.padayon}"></div>
        <div class="product-tag">COMMUNITY & CLUB · SHORT SLEEVE</div>
        <div class="product-name">OFFGRID PADAYON DRIFIT JERSEY</div>
        <div class="product-meta-row">
          <span>FULL SUBLIMATION · ACTIVEWEAR</span>
          <span class="product-pill">SIZES 2XS–5XL</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>CUSTOM TEAM RE-SKINS AVAILABLE WITH YOUR TEAM'S LOGO & ROSTER</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com/custom/order" class="footer-gateway-link">ORDER CUSTOM TEAM KITS</a>
      <span>·</span>
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
    </div>
    <div class="footer-page-num">PAGE 05 / 15</div>
  </div>
</div>

<!-- SLIDE 6: GYM & TRAINING — PRIMAL POWER (4-CARD LARGE GALLERY) -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · GYM & CONDITIONING</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PRIMAL POWER LINE.<br><span class="blue">BUILT FOR INTENSE LIFTS.</span></h2>
    <p class="slide-subtitle">
      Heavy-duty drifit performance apparel engineered with deep athletic armholes, reinforced flatlock seams, and non-restrictive cuts for serious strength conditioning.
    </p>

    <div class="grid-4" style="margin-top: 10px;">
      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.primalSleeveless}"></div>
        <div class="product-tag">SLEEVELESS TANK · 4 COLORWAYS</div>
        <div class="product-name">PRIMAL SLEEVELESS TANK</div>
        <div class="product-meta-row">
          <span>DEEP DELTOID CUT</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.primalShortsleeve}"></div>
        <div class="product-tag">SHORT SLEEVE · 4 COLORWAYS</div>
        <div class="product-name">PRIMAL SHORT SLEEVE</div>
        <div class="product-meta-row">
          <span>GEOMETRIC DRIFIT</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.primalLongsleeve}"></div>
        <div class="product-tag">LONG SLEEVE · 4 COLORWAYS</div>
        <div class="product-name">PRIMAL LONG SLEEVE</div>
        <div class="product-meta-row">
          <span>FULL ARM COVERAGE</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.primalHoodie}"></div>
        <div class="product-tag">THERMAL WARMUP · 4 COLORWAYS</div>
        <div class="product-name">PRIMAL PERFORMANCE HOODIE</div>
        <div class="product-meta-row">
          <span>ACTIVE HOODIE LAYER</span>
          <span class="product-pill">XS–3XL</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® PRIMAL POWER · AVAILABLE FOR CUSTOM GYM & BOX MERCHANDISE</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 06 / 15</div>
  </div>
</div>

<!-- SLIDE 7: GYM & ENDURANCE — SOLAR RISE (EXTRA LARGE PHOTOS) -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · OUTDOOR CONDITIONING</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">SOLAR RISE LINE.<br><span class="blue">HIGH-HEAT ENDURANCE.</span></h2>
    <p class="slide-subtitle">
      Vibrant radiant colorways crafted with featherlight filament yarns. Engineered to deflect solar heat and keep athletes light and rapid through high-temperature endurance sessions.
    </p>

    <div class="grid-3" style="margin-top: 10px;">
      <div class="product-card">
        <div class="product-img-box" style="height: 480px;"><img src="${img.solarSleeveless}"></div>
        <div class="product-tag">SLEEVELESS TANK · 5 COLORWAYS</div>
        <div class="product-name">SOLAR RISE SLEEVELESS</div>
        <div class="product-meta-row">
          <span>FEATHERLIGHT DRIFIT</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 480px;"><img src="${img.solarShortsleeve}"></div>
        <div class="product-tag">SHORT SLEEVE · 3 COLORWAYS</div>
        <div class="product-name">SOLAR RISE SHORT SLEEVE</div>
        <div class="product-meta-row">
          <span>UV DEFLECTING POLY</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 480px;"><img src="${img.solarLongsleeve}"></div>
        <div class="product-tag">LONG SLEEVE · 3 COLORWAYS</div>
        <div class="product-name">SOLAR RISE LONG SLEEVE</div>
        <div class="product-meta-row">
          <span>FULL SUN DEFENSE</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® SOLAR RISE · DISCOVER COLORWAYS AT OGLIFESTYLEPH.COM</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.instagram.com/offgridlifestyleph/" class="footer-gateway-link">@OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 07 / 15</div>
  </div>
</div>

<!-- SLIDE 8: RUNNING PERFORMANCE (HERO 2-CARD SHOWCASE) -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · RUNNING & MARATHON</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">RUNNING PERFORMANCE & STRIDE.<br><span class="blue">AERODYNAMIC MOVEMENT.</span></h2>
    <p class="slide-subtitle">
      Frictionless flatlock seams, anti-chafing ergonomic drape, and high-visibility colorways engineered for road marathoners, midnight runners, and competitive club pacers.
    </p>

    <div class="grid-2" style="margin-top: 10px;">
      <div class="product-card featured" style="padding: 20px;">
        <div class="product-img-box" style="height: 480px;"><img src="${img.runningTee}"></div>
        <div class="product-tag">STRIDE CLUB · 5 COLORWAYS (BLUE, BLACK, GREEN, GRAY, CREAM)</div>
        <div class="product-name" style="font-size: 24px;">OFFGRID RUNNING PERFORMANCE TEE</div>
        <div class="product-meta-row">
          <span>AVAILABLE FOR CUSTOM CLUB TEAM RUNS</span>
          <span class="product-pill">SIZES XS–3XL</span>
        </div>
      </div>

      <div class="product-card featured" style="padding: 20px;">
        <div class="product-img-box" style="height: 480px;"><img src="${img.strideRunning}"></div>
        <div class="product-tag">AERODYNAMIC RACE SLEEVE · TRAIL & ROAD</div>
        <div class="product-name" style="font-size: 24px;">OFFGRID STRIDE RUNNING LONGSLEEVE</div>
        <div class="product-meta-row">
          <span>CUSTOM CLUB SPONSOR INTEGRATION AVAILABLE</span>
          <span class="product-pill">SIZES XS–3XL</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>EQUIP YOUR RUNNING CLUB WITH CUSTOM KITS · INQUIRE AT OGLIFESTYLEPH.COM/CUSTOM/ORDER</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 08 / 15</div>
  </div>
</div>

<!-- SLIDE 9: PICKLEBALL & SALMON SMASHER (CONSOLIDATED 4-CARD GALLERY) -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · PICKLEBALL & SALMON SMASHER</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PICKLEBALL COURT COLLECTION.<br><span class="blue">FEATURING THE SALMON SMASHER.</span></h2>
    <p class="slide-subtitle">
      Court-ready activewear combining laid-back clubhouse swagger with lightning-fast tournament agility. Micro-pique drifit mesh designed for quick lateral cuts and fast hands at the net.
    </p>

    <div class="grid-4" style="margin-top: 10px;">
      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.pickleClub}"></div>
        <div class="product-tag">CLUB COLLECTION · 5 COLORWAYS</div>
        <div class="product-name">PICKLEBALL CLUB TEE</div>
        <div class="product-meta-row">
          <span>SHORT SLEEVE DRIFIT</span>
          <span class="product-pill">2XS–2XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.pickleGraphics}"></div>
        <div class="product-tag">SIGNATURE GRAPHICS · 5 DESIGNS</div>
        <div class="product-name">PICKLEBALL GRAPHICS TEE</div>
        <div class="product-meta-row">
          <span>COURT BACK PRINTS</span>
          <span class="product-pill">2XS–3XL</span>
        </div>
      </div>

      <div class="product-card featured">
        <div class="product-img-box" style="height: 440px;"><img src="${img.salmonSS}"></div>
        <div class="product-tag">SALMON SMASHER · SHORT SLEEVE</div>
        <div class="product-name">SALMON SMASHER SS</div>
        <div class="product-meta-row">
          <span>SIGNATURE SALMON PINK</span>
          <span class="product-pill">2XS–3XL</span>
        </div>
      </div>

      <div class="product-card featured">
        <div class="product-img-box" style="height: 440px;"><img src="${img.salmonLS}"></div>
        <div class="product-tag">SALMON SMASHER · LONG SLEEVE</div>
        <div class="product-name">SALMON SMASHER LS</div>
        <div class="product-meta-row">
          <span>SUN DEFENSE SLEEVE</span>
          <span class="product-pill">2XS–3XL</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® PICKLEBALL · OUTFIT YOUR LOCAL LEAGUE OR CLUB COURT SQUAD</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 09 / 15</div>
  </div>
</div>

<!-- SLIDE 10: GOLF PERFORMANCE SERIES (4-CARD GALLERY) -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · GOLF PERFORMANCE</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">OFFGRID GOLF SERIES.<br><span class="blue">COURSE PERFORMANCE POLOS.</span></h2>
    <p class="slide-subtitle">
      Modern fairway polos combining 4-way mechanical stretch with a sharp tailored fit. Engineered to maintain full rotational swing freedom and cool breathability across 18 holes under the sun.
    </p>

    <div class="grid-4" style="margin-top: 10px;">
      <div class="product-card featured">
        <div class="product-img-box" style="height: 440px;"><img src="${img.golfCover}"></div>
        <div class="product-tag">TECHNICAL FAIRWAY POLO</div>
        <div class="product-name">LINKS SERIES POLO</div>
        <div class="product-meta-row">
          <span>STRUCTURED KNIT COLLAR</span>
          <span class="product-pill">XS–3XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.golfNavy}"></div>
        <div class="product-tag">COURSE NAVY BLUE</div>
        <div class="product-name">NAVY FAIRWAY POLO</div>
        <div class="product-meta-row">
          <span>ELECTRIC BLUE PLACKET</span>
          <span class="product-pill">XS–3XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.golfPink}"></div>
        <div class="product-tag">COURSE SUNSET PINK</div>
        <div class="product-name">PINK FAIRWAY POLO</div>
        <div class="product-meta-row">
          <span>UV SHIELDING FINISH</span>
          <span class="product-pill">XS–3XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box" style="height: 440px;"><img src="${img.golfTeal}"></div>
        <div class="product-tag">FAIRWAY TEAL GREEN</div>
        <div class="product-name">TEAL FAIRWAY POLO</div>
        <div class="product-meta-row">
          <span>TECHNICAL SIDE VENTS</span>
          <span class="product-pill">XS–3XL</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>CUSTOM CORPORATE GOLF TOURNAMENTS & COUNTRY CLUB CRESTING · OGLIFESTYLEPH.COM/CUSTOM/ORDER</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 10 / 15</div>
  </div>
</div>

<!-- SLIDE 11: LIFESTYLE & STREETWEAR — MOTOLINE & THE OG VIBE -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · LIFESTYLE & STREETWEAR</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">MOTOLINE & THE OG VIBE.<br><span class="blue">BEYOND THE COMPETITION.</span></h2>
    <p class="slide-subtitle">
      Athletic performance meets authentic street culture. From rider-inspired long sleeve jerseys to heavyweight combed cotton tees, OFFGRID equips athletes on and off the field.
    </p>

    <div class="grid-2" style="margin-top: 10px;">
      <div class="product-card featured" style="padding: 20px;">
        <div class="product-img-box" style="height: 480px;"><img src="${img.motolineCover}"></div>
        <div class="product-tag">MOTO PERFORMANCE · 4 COLORWAYS</div>
        <div class="product-name" style="font-size: 24px;">OFFGRID MOTOLINE LIFESTYLE JERSEY</div>
        <div class="product-meta-row">
          <span>FULL THROTTLE · TAKBONG OG · STAY OFFGRID · TAKBONG POGI</span>
          <span class="product-pill">SIZES XS–4XL</span>
        </div>
      </div>

      <div class="product-card featured" style="padding: 20px;">
        <div class="product-img-box" style="height: 480px;"><img src="${img.vibeBanner}"></div>
        <div class="product-tag">HEAVYWEIGHT COMBED COTTON · 4 COLORWAYS</div>
        <div class="product-name" style="font-size: 24px;">THE OG VIBE STREETWEAR TEE</div>
        <div class="product-meta-row">
          <span>STEAMPUNK & BLOSSOM GRAPHICS (BLACK & CREAM)</span>
          <span class="product-pill">SIZES S–2XL</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® LIFESTYLE · SHOP STREETWEAR & MOTO LINES ONLINE</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.instagram.com/offgridlifestyleph/" class="footer-gateway-link">@OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 11 / 15</div>
  </div>
</div>

<!-- SLIDE 12: HEADWEAR & ATHLETIC ACCESSORIES -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">ESSENTIAL ATHLETIC EQUIPMENT</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">MOMENTUM CAPS & TOWELS.<br><span class="blue">SIDELINE RECOVERY.</span></h2>
    <p class="slide-subtitle">
      Essential tournament accessories engineered for sun protection, moisture defense, and team sideline identity. Available as add-ons to custom team jersey orders.
    </p>

    <div class="grid-2" style="margin-top: 10px;">
      <div class="product-card featured" style="padding: 20px;">
        <div class="product-img-box" style="height: 480px;"><img src="${img.capCover}"></div>
        <div class="product-tag">ATHLETIC HEADWEAR · 5 COLORWAYS (BLUE, BLACK, WHITE, SKY, PINK)</div>
        <div class="product-name" style="font-size: 24px;">OFFGRID MOMENTUM ATHLETIC CAP</div>
        <div class="product-meta-row">
          <span>STRUCTURED 6-PANEL TWILL · MOISTURE SWEATBAND</span>
          <span class="product-pill">ONE SIZE ADJUSTABLE</span>
        </div>
      </div>

      <div class="product-card featured" style="padding: 20px;">
        <div class="product-img-box" style="height: 480px;"><img src="${img.towelPromo}"></div>
        <div class="product-tag">HIGH-DENSITY WAFFLE MICROFIBER · 35×75 CM</div>
        <div class="product-name" style="font-size: 24px;">OFFGRID PERFORMANCE MICROFIBER TOWEL</div>
        <div class="product-meta-row">
          <span>5X RAPID MOISTURE ABSORPTION · FAST DRYDOWN</span>
          <span class="product-pill">35×75 CM OVERSIZED</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>BUNDLE CUSTOM HEADWEAR & TOWELS WITH YOUR SQUAD ORDER · OGLIFESTYLEPH.COM/CUSTOM/ORDER</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 12 / 15</div>
  </div>
</div>

<!-- SLIDE 13: HOW CUSTOM ORDERS WORK (4 STEPS) -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">ORDER PROCESS & TIMELINE</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">FROM CONCEPT TO PITCH.<br><span class="blue">SEAMLESS 4-STEP TEAM FLOW.</span></h2>
    <p class="slide-subtitle">
      We make team ordering effortless for captains, athletic directors, and team managers. From your initial napkin sketch to worldwide express delivery, our team handles every detail.
    </p>

    <div class="grid-4" style="margin-top: 15px;">
      <div class="step-card">
        <div class="step-num">01</div>
        <div class="step-title">CONSULTATION & QUOTE</div>
        <div class="step-desc">
          Tell us your squad size, sport, and design ideas via our web builder or Facebook. An account manager provides a tailored proposal within 24 hours.
        </div>
      </div>

      <div class="step-card">
        <div class="step-num">02</div>
        <div class="step-title">3D DIGITAL MOCKUP</div>
        <div class="step-desc">
          Our design studio prepares photorealistic 3D renders with your team colors, crests, player names, and numbers for team alignment and final sign-off.
        </div>
      </div>

      <div class="step-card">
        <div class="step-num">03</div>
        <div class="step-title">PRECISION PRODUCTION</div>
        <div class="step-desc">
          High-definition sublimation printing, precision laser cutting, and reinforced athletic stitching with 100% quality inspection before packing.
        </div>
      </div>

      <div class="step-card" style="border-color: #000AFF; background: linear-gradient(135deg, rgba(0,10,255,0.06) 0%, #F8FAFC 100%);">
        <div class="step-num">04</div>
        <div class="step-title">WORLDWIDE DELIVERY</div>
        <div class="step-desc">
          Individually sorted and labeled by player name and roster number, then dispatched via express air courier directly to your door anywhere globally.
        </div>
      </div>
    </div>

    <div style="margin-top: 32px; display: flex; gap: 20px; align-items: center;">
      <a href="https://oglifestyleph.com/custom/order" class="btn-electric">Launch Step 1: Start Custom Order →</a>
      <a href="https://www.facebook.com/offgridlifestyleph" class="btn-outline">Message Team Concierge on Facebook</a>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® LIFESTYLE · SEAMLESS TEAM LOGISTICS</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
      <span>·</span>
      <a href="https://www.instagram.com/offgridlifestyleph/" class="footer-gateway-link">@OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 13 / 15</div>
  </div>
</div>

<!-- SLIDE 14: SIZING & FIT GUIDE -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">ATHLETE FIT & SIZING MATRIX</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PRECISION ATHLETE SIZING.<br><span class="blue">INCLUSIVE 2XS TO 5XL.</span></h2>
    <p class="slide-subtitle">
      No athlete left behind. OFFGRID offers an extensive size spectrum across all uniform silhouettes, with custom tailoring options for youth squads, women's cuts, and men's competition fit.
    </p>

    <div class="split-layout" style="margin-top: 15px;">
      <div class="feature-box highlight" style="margin-bottom: 0;">
        <div class="feature-box-title" style="font-size: 22px;">2 ATHLETIC FIT PROFILES</div>
        <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 18px;">
          <div>
            <div style="font-weight: 800; font-size: 16px; color: #000000; margin-bottom: 4px;">ATHLETIC COMPETITION FIT</div>
            <div style="font-size: 14px; color: #475569;">Tapered chest and waist silhouette engineered to eliminate excess fabric and maximize aerodynamics during high-speed play.</div>
          </div>
          <div style="border-top: 1px solid #E2E8F0; padding-top: 14px;">
            <div style="font-weight: 800; font-size: 16px; color: #000000; margin-bottom: 4px;">RELAXED CLUB & SIDELINE FIT</div>
            <div style="font-size: 14px; color: #475569;">Traditional athletic drape offering generous mobility through the torso for warmups, sidelines, and multi-day tournament comfort.</div>
          </div>
        </div>
      </div>

      <div class="feature-box" style="margin-bottom: 0;">
        <div class="feature-box-title" style="font-size: 22px;">ROSTER FORM MANAGEMENT</div>
        <div class="feature-box-desc" style="margin-top: 14px; font-size: 15px;">
          Eliminate team sizing headaches. We provide a standardized digital roster template where your players fill in their size, preferred jersey number, and back name. Our production software maps each row straight to our sublimation cutting tables with 100% accuracy.
        </div>
        <div style="margin-top: 24px;">
          <a href="https://oglifestyleph.com/custom/order" class="btn-electric" style="padding: 12px 28px; font-size: 13px;">Download Team Sizing Spec Sheet →</a>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® SIZING · INCLUSIVE 2XS TO 5XL ACROSS ALL PERFORMANCE CUTS</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 14 / 15</div>
  </div>
</div>

<!-- SLIDE 15: CLOSING / CONTACT / THE 3 GATEWAYS -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="glow-blue glow-bottom-left"></div>

  <div class="slide-header">
    <img src="${logoBlack}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">ORDER INQUIRIES & DIRECT GATEWAYS</span>
  </div>

  <div class="slide-body" style="text-align: center; align-items: center; justify-content: center; padding-top: 10px;">
    <span class="slide-eyebrow" style="margin-bottom: 14px;">START YOUR SQUAD PROJECT TODAY</span>
    <h2 class="slide-title" style="font-size: 68px; margin-bottom: 14px;">
      READY TO SUIT UP<br><span class="blue">YOUR TEAM?</span>
    </h2>
    <p class="slide-subtitle" style="text-align: center; max-width: 850px; margin-bottom: 36px;">
      Connect directly with OFFGRID through any of our 3 official gateways. Instant team quotes, free 3D digital mockups, and worldwide air delivery.
    </p>

    <!-- 3 Official Gateways Grid -->
    <div class="grid-3" style="width: 100%; max-width: 1300px; text-align: left; margin-bottom: 30px;">
      <a href="https://oglifestyleph.com" style="text-decoration: none;" class="feature-box highlight">
        <div style="font-size: 34px; margin-bottom: 12px;">🌐</div>
        <div class="feature-box-title" style="font-size: 20px;">OFFICIAL STORE & BUILDER</div>
        <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #FFFFFF; background: #000AFF; padding: 6px 14px; border-radius: 8px; display: inline-block; margin-bottom: 10px; letter-spacing: 0.05em;">OGLIFESTYLEPH.COM</div>
        <div class="feature-box-desc" style="font-size: 14px;">
          Browse full retail drops, download templates, or submit team specs directly at <strong>oglifestyleph.com/custom/order</strong>
        </div>
      </a>

      <a href="https://www.facebook.com/offgridlifestyleph" style="text-decoration: none;" class="feature-box highlight">
        <div style="font-size: 34px; margin-bottom: 12px;">💬</div>
        <div class="feature-box-title" style="font-size: 20px;">FACEBOOK CONCIERGE</div>
        <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #FFFFFF; background: #000AFF; padding: 6px 14px; border-radius: 8px; display: inline-block; margin-bottom: 10px; letter-spacing: 0.05em;">FB.COM/OFFGRIDLIFESTYLEPH</div>
        <div class="feature-box-desc" style="font-size: 14px;">
          Chat live with our custom team consultants. Send design references, request quotes, and track order production.
        </div>
      </a>

      <a href="https://www.instagram.com/offgridlifestyleph/" style="text-decoration: none;" class="feature-box highlight">
        <div style="font-size: 34px; margin-bottom: 12px;">📸</div>
        <div class="feature-box-title" style="font-size: 20px;">INSTAGRAM COMMUNITY</div>
        <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #FFFFFF; background: #000AFF; padding: 6px 14px; border-radius: 8px; display: inline-block; margin-bottom: 10px; letter-spacing: 0.05em;">@OFFGRIDLIFESTYLEPH</div>
        <div class="feature-box-desc" style="font-size: 14px;">
          Explore live athlete drops, tournament highlights, client jersey showcases, and DM our team directly.
        </div>
      </a>
    </div>

    <div style="display: flex; gap: 20px;">
      <a href="https://oglifestyleph.com/custom/order" class="btn-electric" style="font-size: 16px; padding: 18px 48px;">
        START CUSTOM ORDER NOW →
      </a>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® LIFESTYLE · ALL RIGHTS RESERVED 2026</div>
    <div class="footer-gateways">
      <span>WORLDWIDE SHIPPING AVAILABLE</span>
      <span>·</span>
      <span>NATIONAL TEAM & CLUB SPECIALISTS</span>
    </div>
    <div class="footer-page-num">PAGE 15 / 15</div>
  </div>
</div>

</body>
</html>
`;

const htmlPath = path.resolve("public/catalog.html");
fs.writeFileSync(htmlPath, html, "utf8");
console.log(`Saved standalone HTML presentation to ${htmlPath}`);

// Compile to PDF with Playwright via Edge Chromium
(async () => {
  console.log("Launching Microsoft Edge via Playwright...");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  console.log("Loading presentation HTML...");
  await page.setContent(html, { waitUntil: "networkidle" });

  const pdfPath = path.resolve("public/OFFGRID_Catalog_2026.pdf");
  console.log(`Compiling 15-slide PDF to ${pdfPath}...`);
  await page.pdf({
    path: pdfPath,
    width: "1920px",
    height: "1080px",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
  const stats = fs.statSync(pdfPath);
  console.log(`🎉 Successfully generated OFFGRID 2026 Catalog PDF (White Edition)!`);
  console.log(`File: ${pdfPath}`);
  console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  process.exit(0);
})().catch((err) => {
  console.error("PDF Generation error:", err);
  process.exit(1);
});
