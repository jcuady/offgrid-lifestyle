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

const logoWhite = toBase64("public/OG logo/OG logo/Complete/White No BG.png");

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

console.log("Generating 16-slide HTML template...");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>OFFGRID® Lifestyle — 2026 Catalog & Teamwear Showcase</title>
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
    background-color: #000000;
    color: #FFFFFF;
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
    background: #080B09;
    border-bottom: 2px solid #1A241E;
  }

  /* Ambient Brand Lighting */
  .glow-blue {
    position: absolute;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 10, 255, 0.18) 0%, rgba(0, 10, 255, 0) 70%);
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
    align-items: flex-start;
    position: relative;
    z-index: 10;
  }
  .brand-logo {
    height: 48px;
    object-fit: contain;
  }
  .slide-eyebrow {
    font-family: "Courier New", Courier, monospace;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #000AFF;
    background: rgba(0, 10, 255, 0.12);
    border: 1px solid rgba(0, 10, 255, 0.35);
    padding: 6px 14px;
    border-radius: 9999px;
    display: inline-block;
  }
  .slide-category-badge {
    font-family: "Courier New", Courier, monospace;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #94A3B8;
  }

  /* Slide Body */
  .slide-body {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 20px 0;
  }

  .slide-title {
    font-size: 56px;
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1.05;
    text-transform: uppercase;
    color: #FFFFFF;
    margin-bottom: 12px;
  }
  .slide-title span.blue {
    color: #000AFF;
  }
  .slide-subtitle {
    font-size: 20px;
    line-height: 1.45;
    color: #CBD5E1;
    max-width: 1100px;
    margin-bottom: 30px;
  }

  /* Slide Footer */
  .slide-footer {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding-top: 20px;
    font-size: 14px;
    color: #94A3B8;
    font-family: "Courier New", Courier, monospace;
  }
  .footer-gateways {
    display: flex;
    gap: 24px;
    align-items: center;
  }
  .footer-gateway-link {
    color: #FFFFFF;
    font-weight: 700;
    transition: color 0.2s;
    letter-spacing: 0.05em;
  }
  .footer-gateway-link:hover {
    color: #000AFF;
  }
  .footer-page-num {
    font-weight: 700;
    color: #FFFFFF;
    background: #111827;
    border: 1px solid rgba(255, 255, 255, 0.15);
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
    gap: 32px;
  }
  .grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 26px;
  }

  /* Product Card */
  .product-card {
    background: #0E1410;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 22px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .product-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: transparent;
    transition: background 0.2s;
  }
  .product-card.featured::before {
    background: #000AFF;
  }
  .product-img-box {
    width: 100%;
    height: 330px;
    background: #050706;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .product-img-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .product-tag {
    font-family: "Courier New", Courier, monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: #000AFF;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .product-name {
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: #FFFFFF;
    margin-bottom: 8px;
    line-height: 1.2;
  }
  .product-desc {
    font-size: 13.5px;
    line-height: 1.45;
    color: #94A3B8;
    margin-bottom: 14px;
    flex: 1;
  }
  .product-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 12px;
    font-family: "Courier New", Courier, monospace;
    font-size: 11.5px;
    color: #CBD5E1;
  }
  .product-pill {
    background: rgba(0, 10, 255, 0.15);
    border: 1px solid rgba(0, 10, 255, 0.4);
    color: #FFFFFF;
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 700;
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
    box-shadow: 0 4px 20px rgba(0, 10, 255, 0.45);
  }
  .btn-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: transparent;
    color: #FFFFFF;
    font-weight: 700;
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 16px 36px;
    border-radius: 9999px;
    border: 1.5px solid rgba(255, 255, 255, 0.25);
  }

  /* Special Feature Layouts */
  .split-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .feature-box {
    background: #0E1410;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 20px;
  }
  .feature-box.highlight {
    border-color: #000AFF;
    background: linear-gradient(135deg, rgba(0, 10, 255, 0.12) 0%, #0E1410 100%);
  }
  .feature-box-title {
    font-size: 24px;
    font-weight: 800;
    color: #FFFFFF;
    margin-bottom: 10px;
    text-transform: uppercase;
  }
  .feature-box-desc {
    font-size: 16px;
    line-height: 1.5;
    color: #94A3B8;
  }

  /* Flow Steps */
  .step-card {
    background: #0E1410;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 28px;
    position: relative;
  }
  .step-num {
    font-family: "Courier New", Courier, monospace;
    font-size: 40px;
    font-weight: 900;
    color: #000AFF;
    margin-bottom: 14px;
    line-height: 1;
  }
  .step-title {
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    color: #FFFFFF;
    margin-bottom: 10px;
  }
  .step-desc {
    font-size: 14.5px;
    line-height: 1.5;
    color: #94A3B8;
  }
</style>
</head>
<body>

<!-- SLIDE 1: COVER -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="glow-blue glow-bottom-left"></div>

  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">2026 OFFICIAL CATALOG & TEAMWEAR SPECIFICATIONS</span>
  </div>

  <div class="slide-body" style="justify-content: center; padding-top: 40px;">
    <div style="max-width: 1200px; margin-bottom: 40px;">
      <h1 class="slide-title" style="font-size: 76px; line-height: 0.95; margin-bottom: 20px;">
        ENGINEERED TO WIN.<br>
        <span class="blue">CUSTOMIZED FOR SQUADS.</span>
      </h1>
      <p class="slide-subtitle" style="font-size: 24px; max-width: 950px; line-height: 1.4;">
        High-performance activewear, sublimated team uniforms, and championship tournament kits. 
        Trusted by national teams and athletes globally.
      </p>
      <div style="display: flex; gap: 16px; margin-top: 25px;">
        <span class="slide-eyebrow" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #FFFFFF;">
          WORLDWIDE SHIPPING
        </span>
        <span class="slide-eyebrow" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #FFFFFF;">
          CUSTOM TEAM SUBLIMATION
        </span>
        <span class="slide-eyebrow" style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #FFFFFF;">
          2XS–5XL INCLUSIVE SIZING
        </span>
      </div>
    </div>

    <!-- 4-Card Product Preview Row -->
    <div class="grid-4" style="margin-top: 10px;">
      <div style="background: #0E1410; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 14px;">
        <img src="${img.aouc}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
        <div>
          <div style="font-size: 11px; font-family: monospace; color: #000AFF; font-weight: bold;">PILIPINAS TEAM</div>
          <div style="font-size: 14px; font-weight: 800;">AOUC JERSEY 2025</div>
        </div>
      </div>
      <div style="background: #0E1410; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 14px;">
        <img src="${img.primalSleeveless}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
        <div>
          <div style="font-size: 11px; font-family: monospace; color: #000AFF; font-weight: bold;">GYM & TRAINING</div>
          <div style="font-size: 14px; font-weight: 800;">PRIMAL POWER TANK</div>
        </div>
      </div>
      <div style="background: #0E1410; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 14px;">
        <img src="${img.runningTee}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
        <div>
          <div style="font-size: 11px; font-family: monospace; color: #000AFF; font-weight: bold;">RUNNING</div>
          <div style="font-size: 14px; font-weight: 800;">STRIDE PERFORMANCE</div>
        </div>
      </div>
      <div style="background: #0E1410; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px; display: flex; align-items: center; gap: 14px;">
        <img src="${img.pickleClub}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
        <div>
          <div style="font-size: 11px; font-family: monospace; color: #000AFF; font-weight: bold;">PICKLEBALL</div>
          <div style="font-size: 14px; font-weight: 800;">COURT CLUB SERIES</div>
        </div>
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
    <div class="footer-page-num">PAGE 01 / 16</div>
  </div>
</div>

<!-- SLIDE 2: WORLDWIDE SHIPPING & GLOBAL REACH -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">GLOBAL REACH & LOGISTICS</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">ENGINEERED FOR ATHLETES EVERYWHERE.<br><span class="blue">SHIPPED WORLDWIDE.</span></h2>
    <p class="slide-subtitle">
      OFFGRID crafts tournament-grade performance apparel and custom team kits trusted by national squads, competitive clubs, and sports communities across the globe. Our dedicated international logistics pipeline ensures seamless door-to-door delivery wherever your squad plays.
    </p>

    <div class="grid-3" style="margin-top: 15px;">
      <div class="feature-box highlight">
        <div style="font-size: 32px; margin-bottom: 12px;">✈️</div>
        <div class="feature-box-title">WORLDWIDE EXPRESS COURIER</div>
        <div class="feature-box-desc">
          Direct air courier dispatch for all international clients abroad. Fast door-to-door transit, verified end-to-end flight tracking, and export-compliant customs handling.
        </div>
      </div>

      <div class="feature-box">
        <div style="font-size: 32px; margin-bottom: 12px;">🌐</div>
        <div class="feature-box-title">INTERNATIONAL DESK CONCIERGE</div>
        <div class="feature-box-desc">
          Dedicated account managers for international clubs and tournament teams. Seamless digital roster coordination, timezone-friendly communication, and multi-currency quotes.
        </div>
      </div>

      <div class="feature-box">
        <div style="font-size: 32px; margin-bottom: 12px;">📦</div>
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
    <div class="footer-page-num">PAGE 02 / 16</div>
  </div>
</div>

<!-- SLIDE 3: CUSTOM TEAMWEAR CAPABILITIES -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
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
            <span style="color: #000AFF; font-size: 20px; font-weight: bold;">✓</span>
            <div><strong>Full Sublimation Jerseys</strong> · Short sleeve, long sleeve, and tank cuts with unlimited color gradients.</div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 20px; font-weight: bold;">✓</span>
            <div><strong>Performance Team Shorts</strong> · Custom inseam lengths, reinforced side splits, optional zip pockets.</div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 20px; font-weight: bold;">✓</span>
            <div><strong>Reversible Pinnies & Scrimmage Kits</strong> · Ultra-breathable dual-layer tournament practice jerseys.</div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 20px; font-weight: bold;">✓</span>
            <div><strong>Team Hoodies & Warmup Outerwear</strong> · Pre-game thermal layers customized with team crests.</div>
          </div>
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="color: #000AFF; font-size: 20px; font-weight: bold;">✓</span>
            <div><strong>Sideline Accessories</strong> · Custom embroidered team caps and player-named microfiber towels.</div>
          </div>
        </div>

        <div style="margin-top: 32px;">
          <a href="https://oglifestyleph.com/custom/order" class="btn-electric">Start Custom Order at oglifestyleph.com/custom/order →</a>
        </div>
      </div>

      <div class="grid-2">
        <div class="product-card" style="padding: 16px;">
          <div class="product-img-box" style="height: 220px;"><img src="${img.ultimateBlue}"></div>
          <div class="product-name" style="font-size: 16px;">GAME UNIFORMS</div>
          <div class="product-desc" style="font-size: 12px; margin-bottom: 0;">Full-sublimation matchday jerseys & shorts with individual names and numbers.</div>
        </div>
        <div class="product-card" style="padding: 16px;">
          <div class="product-img-box" style="height: 220px;"><img src="${img.primalHoodie}"></div>
          <div class="product-name" style="font-size: 16px;">TEAM OUTERWEAR</div>
          <div class="product-desc" style="font-size: 12px; margin-bottom: 0;">Warmup hoodies, shooter shirts, and windbreaker layers engineered for squads.</div>
        </div>
        <div class="product-card" style="padding: 16px;">
          <div class="product-img-box" style="height: 220px;"><img src="${img.capCover}"></div>
          <div class="product-name" style="font-size: 16px;">CUSTOM HEADWEAR</div>
          <div class="product-desc" style="font-size: 12px; margin-bottom: 0;">Structured athletic caps, visors, and bucket hats with high-density team embroidery.</div>
        </div>
        <div class="product-card" style="padding: 16px;">
          <div class="product-img-box" style="height: 220px;"><img src="${img.towelPromo}"></div>
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
    <div class="footer-page-num">PAGE 03 / 16</div>
  </div>
</div>

<!-- SLIDE 4: FABRIC TECHNOLOGY & ENGINEERING -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">MATERIAL SCIENCE & ENGINEERING</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PROPRIETARY FABRIC SYSTEMS.<br><span class="blue">PERFORMANCE FIRST.</span></h2>
    <p class="slide-subtitle">
      Every garment is designed from the fiber up. We test our fabrics under extreme heat, sweat saturation, and intense contact play to guarantee maximum mobility and zero distractions.
    </p>

    <div class="grid-4" style="margin-top: 20px;">
      <div class="feature-box" style="margin-bottom: 0;">
        <div style="font-family: monospace; font-size: 12px; color: #000AFF; font-weight: bold; margin-bottom: 8px;">TECH FABRIC 01</div>
        <div class="feature-box-title" style="font-size: 20px;">HYPER-WICK POLYESTER</div>
        <div class="feature-box-desc">
          4-way mechanical stretch activewear yarn. Pulls perspiration away from skin instantly, evaporating moisture 3x faster than standard athletic poly.
        </div>
      </div>

      <div class="feature-box" style="margin-bottom: 0;">
        <div style="font-family: monospace; font-size: 12px; color: #000AFF; font-weight: bold; margin-bottom: 8px;">TECH FABRIC 02</div>
        <div class="feature-box-title" style="font-size: 20px;">DYNAMIC AIR-MESH</div>
        <div class="feature-box-desc">
          Laser-mapped micro-perforation panels placed across high-heat zones. Provides continuous airflow during intense tournament matches.
        </div>
      </div>

      <div class="feature-box" style="margin-bottom: 0;">
        <div style="font-family: monospace; font-size: 12px; color: #000AFF; font-weight: bold; margin-bottom: 8px;">TECH FABRIC 03</div>
        <div class="feature-box-title" style="font-size: 20px;">COMBED STREET COTTON</div>
        <div class="feature-box-desc">
          Heavyweight 100% pre-shrunk combed cotton. Ultra-soft handfeel with reinforced collar ribbing designed for enduring off-court streetwear comfort.
        </div>
      </div>

      <div class="feature-box" style="margin-bottom: 0;">
        <div style="font-family: monospace; font-size: 12px; color: #000AFF; font-weight: bold; margin-bottom: 8px;">TECH FABRIC 04</div>
        <div class="feature-box-title" style="font-size: 20px;">WAFFLE MICROFIBER</div>
        <div class="feature-box-desc">
          High-density split-microfiber weave. Absorbs 5x its dry weight in moisture while remaining lightweight, lint-free, and rapid-drying on the bench.
        </div>
      </div>
    </div>

    <div class="feature-box highlight" style="margin-top: 30px; margin-bottom: 0; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; text-transform: uppercase;">THERMAL MOLECULAR SUBLIMATION STANDARDS</div>
        <div style="font-size: 14px; color: #94A3B8; margin-top: 4px;">Dye pigments are infused directly into fibers under high pressure and heat. Graphics will never crack, peel, or fade.</div>
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
    <div class="footer-page-num">PAGE 04 / 16</div>
  </div>
</div>

<!-- SLIDE 5: ULTIMATE FRISBEE — PILIPINAS COLLECTION -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · ULTIMATE FRISBEE</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PILIPINAS NATIONAL TEAM COLLECTION.<br><span class="blue">CHAMPIONSHIP TESTED.</span></h2>
    <p class="slide-subtitle">
      The pinnacle of tournament ultimate apparel. Engineered for aggressive layout extensions, maximum shoulder rotation on deep hucks, and all-day tropical performance.
    </p>

    <div class="grid-3" style="margin-top: 15px;">
      <div class="product-card featured">
        <div class="product-img-box"><img src="${img.aouc}"></div>
        <div class="product-tag">NATIONAL TEAM 2025 · SHORT SLEEVE</div>
        <div class="product-name">PILIPINAS AOUC JERSEY 2025</div>
        <div class="product-desc">Official international competition kit. Full sublimation dryfit activewear in heritage Capiz, Lilim, and Piloncitos colorways.</div>
        <div class="product-meta-row">
          <span>FABRIC: DRYFIT POLY</span>
          <span class="product-pill">SIZES 2XS–5XL</span>
        </div>
      </div>

      <div class="product-card featured">
        <div class="product-img-box"><img src="${img.ultimateBlue}"></div>
        <div class="product-tag">TEAM OFFICIAL · COMPETITION CUT</div>
        <div class="product-name">PILIPINAS ULTIMATE TEAM JERSEY</div>
        <div class="product-desc">Clean national cresting with high-contrast chest branding. Built with tailored raglan sleeves for overhead layout mobility.</div>
        <div class="product-meta-row">
          <span>FABRIC: PRO DRYFIT</span>
          <span class="product-pill">SIZES 2XS–5XL</span>
        </div>
      </div>

      <div class="product-card featured">
        <div class="product-img-box"><img src="${img.padayon}"></div>
        <div class="product-tag">COMMUNITY & CLUB · SHORT SLEEVE</div>
        <div class="product-name">OFFGRID PADAYON DRIFIT JERSEY</div>
        <div class="product-desc">Signature tournament drifit jersey celebrating resilience and forward momentum on the pitch. Full sublimation activewear.</div>
        <div class="product-meta-row">
          <span>FABRIC: SUB POLYESTER</span>
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
    <div class="footer-page-num">PAGE 05 / 16</div>
  </div>
</div>

<!-- SLIDE 6: GYM & TRAINING — PRIMAL POWER -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · GYM & CONDITIONING</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PRIMAL POWER LINE.<br><span class="blue">BUILT FOR INTENSE LIFTS.</span></h2>
    <p class="slide-subtitle">
      Heavy-duty drifit performance apparel engineered with deep athletic armholes, reinforced flatlock seams, and non-restrictive cuts for serious strength conditioning.
    </p>

    <div class="grid-4" style="margin-top: 15px;">
      <div class="product-card">
        <div class="product-img-box"><img src="${img.primalSleeveless}"></div>
        <div class="product-tag">SLEEVELESS TANK · 4 COLORWAYS</div>
        <div class="product-name">PRIMAL SLEEVELESS TANK</div>
        <div class="product-desc">Maximum shoulder and lat freedom for heavy pulls, bench presses, and functional athletic circuits.</div>
        <div class="product-meta-row">
          <span>CUT: SLEEVELESS</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box"><img src="${img.primalShortsleeve}"></div>
        <div class="product-tag">SHORT SLEEVE · 4 COLORWAYS</div>
        <div class="product-name">PRIMAL SHORT SLEEVE</div>
        <div class="product-desc">Clean geometric drifit styling with breathable underarm panels. Moisture-wicking performance mesh.</div>
        <div class="product-meta-row">
          <span>CUT: SHORT SLEEVE</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box"><img src="${img.primalLongsleeve}"></div>
        <div class="product-tag">LONG SLEEVE · 4 COLORWAYS</div>
        <div class="product-name">PRIMAL LONG SLEEVE</div>
        <div class="product-desc">Full arm coverage designed for outdoor conditioning and sun-deflecting outdoor functional workouts.</div>
        <div class="product-meta-row">
          <span>CUT: LONG SLEEVE</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box"><img src="${img.primalHoodie}"></div>
        <div class="product-tag">THERMAL WARMUP · 4 COLORWAYS</div>
        <div class="product-name">PRIMAL PERFORMANCE HOODIE</div>
        <div class="product-desc">Lightweight active drifit hoodie designed for warmups, pump covers, and post-session recovery.</div>
        <div class="product-meta-row">
          <span>CUT: HOODIE</span>
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
    <div class="footer-page-num">PAGE 06 / 16</div>
  </div>
</div>

<!-- SLIDE 7: GYM & ENDURANCE — SOLAR RISE -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · OUTDOOR CONDITIONING</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">SOLAR RISE LINE.<br><span class="blue">HIGH-HEAT ENDURANCE.</span></h2>
    <p class="slide-subtitle">
      Vibrant radiant colorways crafted with featherlight filament yarns. Engineered to deflect solar heat and keep athletes light and rapid through high-temperature endurance sessions.
    </p>

    <div class="grid-3" style="margin-top: 15px;">
      <div class="product-card">
        <div class="product-img-box"><img src="${img.solarSleeveless}"></div>
        <div class="product-tag">SLEEVELESS TANK · 5 COLORWAYS</div>
        <div class="product-name">SOLAR RISE SLEEVELESS</div>
        <div class="product-desc">Max-ventilation activewear tank with high-visibility radiant gradients. Engineered for tropical heat and open-air drills.</div>
        <div class="product-meta-row">
          <span>FABRIC: FEATHERLIGHT DRIFIT</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box"><img src="${img.solarShortsleeve}"></div>
        <div class="product-tag">SHORT SLEEVE · 3 COLORWAYS</div>
        <div class="product-name">SOLAR RISE SHORT SLEEVE</div>
        <div class="product-desc">Radiant sunburst motifs with anti-cling micro-knit surface. Stays featherlight even when saturated during marathon training.</div>
        <div class="product-meta-row">
          <span>FABRIC: UV DEFLECTING POLY</span>
          <span class="product-pill">2XS–5XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box"><img src="${img.solarLongsleeve}"></div>
        <div class="product-tag">LONG SLEEVE · 3 COLORWAYS</div>
        <div class="product-name">SOLAR RISE LONG SLEEVE</div>
        <div class="product-desc">Full-sleeve athletic sun defense for outdoor bootcamp sessions, trail conditioning, and open-field tournament games.</div>
        <div class="product-meta-row">
          <span>FABRIC: FULL SUN DEFENSE</span>
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
    <div class="footer-page-num">PAGE 07 / 16</div>
  </div>
</div>

<!-- SLIDE 8: RUNNING PERFORMANCE -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · RUNNING & MARATHON</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">RUNNING PERFORMANCE & STRIDE.<br><span class="blue">AERODYNAMIC MOVEMENT.</span></h2>
    <p class="slide-subtitle">
      Frictionless flatlock seams, anti-chafing ergonomic drape, and high-visibility colorways engineered for road marathoners, midnight runners, and competitive club pacers.
    </p>

    <div class="grid-2" style="margin-top: 15px;">
      <div class="product-card featured" style="padding: 28px;">
        <div class="product-img-box" style="height: 380px;"><img src="${img.runningTee}"></div>
        <div class="product-tag">STRIDE CLUB · 5 COLORWAYS</div>
        <div class="product-name" style="font-size: 24px;">OFFGRID RUNNING PERFORMANCE TEE</div>
        <div class="product-desc" style="font-size: 15px;">
          Available in Flow State Blue, Classic Black, Purpose Green, Stride Club Gray, and Catch Me Cream. Ergonomic drop-tail hem and anti-chafing side vents.
        </div>
        <div class="product-meta-row">
          <span>AVAILABLE FOR CUSTOM MARATHON & CLUB TEAM RUNS</span>
          <span class="product-pill">SIZES XS–3XL</span>
        </div>
      </div>

      <div class="product-card featured" style="padding: 28px;">
        <div class="product-img-box" style="height: 380px;"><img src="${img.strideRunning}"></div>
        <div class="product-tag">AERODYNAMIC SLEEVE · RACE-READY</div>
        <div class="product-name" style="font-size: 24px;">OFFGRID STRIDE RUNNING LONGSLEEVE</div>
        <div class="product-desc" style="font-size: 15px;">
          Lightweight thermal moderation for early morning road races and mountain trail runs. Micro-filament cuffs with zero bounce or slip.
        </div>
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
    <div class="footer-page-num">PAGE 08 / 16</div>
  </div>
</div>

<!-- SLIDE 9: PICKLEBALL CLUB & GRAPHICS -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · PICKLEBALL</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">PICKLEBALL CLUB & GRAPHICS.<br><span class="blue">COURT CULTURE & SPEED.</span></h2>
    <p class="slide-subtitle">
      Court-ready activewear combining laid-back clubhouse swagger with lightning-fast lateral agility. Breathable drifit mesh designed for quick hands at the kitchen line.
    </p>

    <div class="grid-2" style="margin-top: 15px;">
      <div class="product-card" style="padding: 26px;">
        <div class="product-img-box" style="height: 370px;"><img src="${img.pickleClub}"></div>
        <div class="product-tag">CLUB COLLECTION · 5 COLORWAYS</div>
        <div class="product-name" style="font-size: 22px;">OFFGRID PICKLEBALL CLUB TEE</div>
        <div class="product-desc" style="font-size: 14.5px;">
          Classic court identity in Pickleball Cream, Green, Black, Violet, and White. Clean minimalist chest typography with tournament-ready performance poly.
        </div>
        <div class="product-meta-row">
          <span>CUT: SHORT SLEEVE DRIFIT</span>
          <span class="product-pill">SIZES 2XS–2XL</span>
        </div>
      </div>

      <div class="product-card" style="padding: 26px;">
        <div class="product-img-box" style="height: 370px;"><img src="${img.pickleGraphics}"></div>
        <div class="product-tag">SIGNATURE GRAPHIC LINE · 5 DESIGNS</div>
        <div class="product-name" style="font-size: 22px;">OFFGRID PICKLEBALL GRAPHICS TEE</div>
        <div class="product-desc" style="font-size: 14.5px;">
          Featuring viral court graphics: <em>Dink Different</em>, <em>Summer League</em>, <em>Everyday Pickle Day</em>, <em>Get Your Dink On</em>, and <em>Pocket Print</em> with bold court back prints.
        </div>
        <div class="product-meta-row">
          <span>CUT: SHORT SLEEVE DRIFIT</span>
          <span class="product-pill">SIZES 2XS–3XL</span>
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
    <div class="footer-page-num">PAGE 09 / 16</div>
  </div>
</div>

<!-- SLIDE 10: SALMON SMASHER FEATURE -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">TOURNAMENT SPOTLIGHT · PICKLEBALL</span>
  </div>

  <div class="slide-body">
    <div class="split-layout">
      <div>
        <span class="slide-eyebrow" style="margin-bottom: 12px;">COURT PHENOMENON</span>
        <h2 class="slide-title">THE SALMON SMASHER<br><span class="blue">PERFORMANCE SERIES.</span></h2>
        <p class="slide-subtitle" style="font-size: 18px; margin-bottom: 24px;">
          Smash like a salmon — the viral court favorite designed for athletes who play with unapologetic personality, fearless court coverage, and electric energy.
        </p>

        <div class="feature-box highlight" style="margin-bottom: 24px;">
          <div class="feature-box-title" style="font-size: 20px;">2 TOURNAMENT-GRADE CUTS</div>
          <div class="feature-box-desc">
            Available in both <strong>Short Sleeve</strong> for hot outdoor court battles and <strong>Long Sleeve</strong> for full-arm sun defense and skin-glide protection on diving returns.
          </div>
        </div>

        <div style="display: flex; gap: 16px;">
          <a href="https://www.facebook.com/offgridlifestyleph" class="btn-electric">Inquire for Team Salmon Editions →</a>
          <a href="https://oglifestyleph.com" class="btn-outline">View Online</a>
        </div>
      </div>

      <div class="grid-2">
        <div class="product-card featured" style="padding: 20px;">
          <div class="product-img-box" style="height: 350px;"><img src="${img.salmonSS}"></div>
          <div class="product-tag">SHORT SLEEVE TOURNAMENT CUT</div>
          <div class="product-name" style="font-size: 18px;">SALMON SMASHER SHORTSLEEVE</div>
          <div class="product-desc" style="font-size: 13px;">Signature Salmon Pink dryfit jersey with tournament speed print.</div>
          <div class="product-meta-row">
            <span>SIZES 2XS–3XL</span>
            <span class="product-pill">PRO DRIFIT</span>
          </div>
        </div>

        <div class="product-card featured" style="padding: 20px;">
          <div class="product-img-box" style="height: 350px;"><img src="${img.salmonLS}"></div>
          <div class="product-tag">LONG SLEEVE SUN DEFENSE</div>
          <div class="product-name" style="font-size: 18px;">SALMON SMASHER LONGSLEEVE</div>
          <div class="product-desc" style="font-size: 13px;">Full tournament sleeve for maximum UV protection during daytime play.</div>
          <div class="product-meta-row">
            <span>SIZES 2XS–3XL</span>
            <span class="product-pill">PRO DRIFIT</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div>OFFGRID® SALMON SMASHER · OFFICIAL TOURNAMENT CUTS</div>
    <div class="footer-gateways">
      <a href="https://oglifestyleph.com" class="footer-gateway-link">OGLIFESTYLEPH.COM</a>
      <span>·</span>
      <a href="https://www.facebook.com/offgridlifestyleph" class="footer-gateway-link">FB.COM/OFFGRIDLIFESTYLEPH</a>
    </div>
    <div class="footer-page-num">PAGE 10 / 16</div>
  </div>
</div>

<!-- SLIDE 11: GOLF PERFORMANCE -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · GOLF PERFORMANCE</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">OFFGRID GOLF SERIES.<br><span class="blue">COURSE PERFORMANCE POLOS.</span></h2>
    <p class="slide-subtitle">
      Modern fairway polos combining 4-way mechanical stretch with a sharp tailored fit. Engineered to maintain full rotational swing freedom and cool breathability across 18 holes under the sun.
    </p>

    <div class="grid-4" style="margin-top: 15px;">
      <div class="product-card featured">
        <div class="product-img-box"><img src="${img.golfCover}"></div>
        <div class="product-tag">TECHNICAL FAIRWAY POLO</div>
        <div class="product-name">LINKS PERFORMANCE SERIES</div>
        <div class="product-desc">Engineered knit collar that never curls or loses shape through humid afternoon rounds.</div>
        <div class="product-meta-row">
          <span>FABRIC: TECHNICAL POLY</span>
          <span class="product-pill">XS–3XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box"><img src="${img.golfNavy}"></div>
        <div class="product-tag">COURSE NAVY BLUE</div>
        <div class="product-name">NAVY BLUE FAIRWAY POLO</div>
        <div class="product-desc">Understated clubhouse elegance with discrete electric blue collar and placket detailing.</div>
        <div class="product-meta-row">
          <span>CUT: ATHLETIC FIT</span>
          <span class="product-pill">XS–3XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box"><img src="${img.golfPink}"></div>
        <div class="product-tag">COURSE SUNSET PINK</div>
        <div class="product-name">PINK FAIRWAY POLO</div>
        <div class="product-desc">Vibrant high-visibility fairway pastel with moisture-wicking and UV-shielding treatment.</div>
        <div class="product-meta-row">
          <span>CUT: ATHLETIC FIT</span>
          <span class="product-pill">XS–3XL</span>
        </div>
      </div>

      <div class="product-card">
        <div class="product-img-box"><img src="${img.golfTeal}"></div>
        <div class="product-tag">FAIRWAY TEAL GREEN</div>
        <div class="product-name">TEAL GREEN FAIRWAY POLO</div>
        <div class="product-desc">Deep course green with technical side vents for unhindered hip rotation on the tee box.</div>
        <div class="product-meta-row">
          <span>CUT: ATHLETIC FIT</span>
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
    <div class="footer-page-num">PAGE 11 / 16</div>
  </div>
</div>

<!-- SLIDE 12: LIFESTYLE & STREETWEAR — MOTOLINE & THE OG VIBE -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">SPORT SHOWCASE · LIFESTYLE & STREETWEAR</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">MOTOLINE & THE OG VIBE.<br><span class="blue">BEYOND THE COMPETITION.</span></h2>
    <p class="slide-subtitle">
      Athletic performance meets authentic street culture. From rider-inspired long sleeve jerseys to heavyweight combed cotton tees, OFFGRID equips athletes on and off the field.
    </p>

    <div class="grid-2" style="margin-top: 15px;">
      <div class="product-card featured" style="padding: 26px;">
        <div class="product-img-box" style="height: 370px;"><img src="${img.motolineCover}"></div>
        <div class="product-tag">MOTO PERFORMANCE · 4 COLORWAYS</div>
        <div class="product-name" style="font-size: 22px;">OFFGRID MOTOLINE LIFESTYLE JERSEY</div>
        <div class="product-desc" style="font-size: 14.5px;">
          Gritty road and street kits featuring iconic Filipino rider phrases: <em>Full Throttle Life</em>, <em>Takbong OG</em>, <em>Stay OFFGRID</em>, and <em>Takbong Pogi Mode</em>. Long sleeve drifit activewear.
        </div>
        <div class="product-meta-row">
          <span>FABRIC: PREMIUM MOTO DRIFIT</span>
          <span class="product-pill">SIZES XS–4XL</span>
        </div>
      </div>

      <div class="product-card featured" style="padding: 26px;">
        <div class="product-img-box" style="height: 370px;"><img src="${img.vibeBanner}"></div>
        <div class="product-tag">HEAVYWEIGHT COTTON · 4 COLORWAYS</div>
        <div class="product-name" style="font-size: 22px;">THE OG VIBE STREETWEAR TEE</div>
        <div class="product-desc" style="font-size: 14.5px;">
          Heavyweight combed cotton with premium high-density screenprints: Steampunk and Blossom in Black & Cream. Boxy, relaxed streetwear silhouette.
        </div>
        <div class="product-meta-row">
          <span>FABRIC: 100% COMBED COTTON</span>
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
    <div class="footer-page-num">PAGE 12 / 16</div>
  </div>
</div>

<!-- SLIDE 13: HEADWEAR & ATHLETIC ACCESSORIES -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">ESSENTIAL ATHLETIC EQUIPMENT</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">MOMENTUM CAPS & TOWELS.<br><span class="blue">SIDELINE RECOVERY.</span></h2>
    <p class="slide-subtitle">
      Essential tournament accessories engineered for sun protection, moisture defense, and team sideline identity. Available as add-ons to custom team jersey orders.
    </p>

    <div class="grid-2" style="margin-top: 15px;">
      <div class="product-card featured" style="padding: 26px;">
        <div class="product-img-box" style="height: 370px;"><img src="${img.capCover}"></div>
        <div class="product-tag">ATHLETIC HEADWEAR · 5 COLORWAYS</div>
        <div class="product-name" style="font-size: 22px;">OFFGRID MOMENTUM ATHLETIC CAP</div>
        <div class="product-desc" style="font-size: 14.5px;">
          Structured 6-panel breathable twill with moisture-wicking sweatband, pre-curved visor, and adjustable back strap. Available in Dark Blue, Black, White, Sky Blue, and Pink.
        </div>
        <div class="product-meta-row">
          <span>CUSTOM TEAM EMBROIDERY AVAILABLE</span>
          <span class="product-pill">ONE SIZE ADJUSTABLE</span>
        </div>
      </div>

      <div class="product-card featured" style="padding: 26px;">
        <div class="product-img-box" style="height: 370px;"><img src="${img.towelPromo}"></div>
        <div class="product-tag">MICROFIBER TOWEL · 35×75 CM</div>
        <div class="product-name" style="font-size: 22px;">OFFGRID PERFORMANCE MICROFIBER TOWEL</div>
        <div class="product-desc" style="font-size: 14.5px;">
          High-density waffle split-microfiber sports towel with 5x moisture absorption. Ultra-compact, fast-drying, and odor-resistant. Signature OFFGRID Lime & Field Black.
        </div>
        <div class="product-meta-row">
          <span>CUSTOM PLAYER NUMBERING AVAILABLE</span>
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
    <div class="footer-page-num">PAGE 13 / 16</div>
  </div>
</div>

<!-- SLIDE 14: HOW CUSTOM ORDERS WORK (4 STEPS) -->
<div class="slide">
  <div class="glow-blue glow-bottom-left"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">ORDER PROCESS & TIMELINE</span>
  </div>

  <div class="slide-body">
    <h2 class="slide-title">FROM CONCEPT TO PITCH.<br><span class="blue">SEAMLESS 4-STEP TEAM FLOW.</span></h2>
    <p class="slide-subtitle">
      We make team ordering effortless for captains, athletic directors, and team managers. From your initial napkin sketch to worldwide express delivery, our team handles every detail.
    </p>

    <div class="grid-4" style="margin-top: 20px;">
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

      <div class="step-card" style="border-color: #000AFF; background: linear-gradient(135deg, rgba(0,10,255,0.15) 0%, #0E1410 100%);">
        <div class="step-num">04</div>
        <div class="step-title">WORLDWIDE DELIVERY</div>
        <div class="step-desc">
          Individually sorted and labeled by player name and roster number, then dispatched via express air courier directly to your door anywhere globally.
        </div>
      </div>
    </div>

    <div style="margin-top: 36px; display: flex; gap: 20px; align-items: center;">
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
    <div class="footer-page-num">PAGE 14 / 16</div>
  </div>
</div>

<!-- SLIDE 15: SIZING & FIT GUIDE -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
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
            <div style="font-weight: 800; font-size: 16px; color: #FFFFFF; margin-bottom: 4px;">ATHLETIC COMPETITION FIT</div>
            <div style="font-size: 14px; color: #94A3B8;">Tapered chest and waist silhouette engineered to eliminate excess fabric and maximize aerodynamics during high-speed play.</div>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
            <div style="font-weight: 800; font-size: 16px; color: #FFFFFF; margin-bottom: 4px;">RELAXED CLUB & SIDELINE FIT</div>
            <div style="font-size: 14px; color: #94A3B8;">Traditional athletic drape offering generous mobility through the torso for warmups, sidelines, and multi-day tournament comfort.</div>
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
    <div class="footer-page-num">PAGE 15 / 16</div>
  </div>
</div>

<!-- SLIDE 16: CLOSING / CONTACT / THE 3 GATEWAYS -->
<div class="slide">
  <div class="glow-blue glow-top-right"></div>
  <div class="glow-blue glow-bottom-left"></div>

  <div class="slide-header">
    <img src="${logoWhite}" alt="OFFGRID" class="brand-logo">
    <span class="slide-eyebrow">ORDER INQUIRIES & DIRECT GATEWAYS</span>
  </div>

  <div class="slide-body" style="text-align: center; align-items: center; justify-content: center; padding-top: 20px;">
    <span class="slide-eyebrow" style="margin-bottom: 16px;">START YOUR SQUAD PROJECT TODAY</span>
    <h2 class="slide-title" style="font-size: 68px; margin-bottom: 16px;">
      READY TO SUIT UP<br><span class="blue">YOUR TEAM?</span>
    </h2>
    <p class="slide-subtitle" style="text-align: center; max-width: 800px; margin-bottom: 40px;">
      Connect directly with OFFGRID through any of our 3 official gateways. Instant team quotes, free 3D digital mockups, and worldwide air delivery.
    </p>

    <!-- 3 Official Gateways Grid -->
    <div class="grid-3" style="width: 100%; max-width: 1300px; text-align: left; margin-bottom: 30px;">
      <a href="https://oglifestyleph.com" style="text-decoration: none;" class="feature-box highlight">
        <div style="font-size: 32px; margin-bottom: 12px;">🌐</div>
        <div class="feature-box-title" style="font-size: 22px;">OFFICIAL STORE & BUILDER</div>
        <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #FFFFFF; background: #000AFF; padding: 6px 14px; border-radius: 8px; display: inline-block; margin-bottom: 12px; letter-spacing: 0.05em;">OGLIFESTYLEPH.COM</div>
        <div class="feature-box-desc" style="font-size: 14px;">
          Browse full retail drops, download templates, or submit team specs directly at <strong>oglifestyleph.com/custom/order</strong>
        </div>
      </a>

      <a href="https://www.facebook.com/offgridlifestyleph" style="text-decoration: none;" class="feature-box highlight">
        <div style="font-size: 32px; margin-bottom: 12px;">💬</div>
        <div class="feature-box-title" style="font-size: 22px;">FACEBOOK CONCIERGE</div>
        <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #FFFFFF; background: #000AFF; padding: 6px 14px; border-radius: 8px; display: inline-block; margin-bottom: 12px; letter-spacing: 0.05em;">FB.COM/OFFGRIDLIFESTYLEPH</div>
        <div class="feature-box-desc" style="font-size: 14px;">
          Chat live with our custom team consultants. Send design references, request quotes, and track order production.
        </div>
      </a>

      <a href="https://www.instagram.com/offgridlifestyleph/" style="text-decoration: none;" class="feature-box highlight">
        <div style="font-size: 32px; margin-bottom: 12px;">📸</div>
        <div class="feature-box-title" style="font-size: 22px;">INSTAGRAM COMMUNITY</div>
        <div style="font-size: 15px; font-weight: 800; font-family: monospace; color: #FFFFFF; background: #000AFF; padding: 6px 14px; border-radius: 8px; display: inline-block; margin-bottom: 12px; letter-spacing: 0.05em;">@OFFGRIDLIFESTYLEPH</div>
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
    <div class="footer-page-num">PAGE 16 / 16</div>
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
  console.log(`Compiling 16-slide PDF to ${pdfPath}...`);
  await page.pdf({
    path: pdfPath,
    width: "1920px",
    height: "1080px",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();
  const stats = fs.statSync(pdfPath);
  console.log(`🎉 Successfully generated OFFGRID 2026 Catalog PDF!`);
  console.log(`File: ${pdfPath}`);
  console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  process.exit(0);
})().catch((err) => {
  console.error("PDF Generation error:", err);
  process.exit(1);
});
