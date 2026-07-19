#!/usr/bin/env node
// OG 이미지(1200×630)·파비콘 생성 — 실측 사실만(SAMICK H&P·삼익유공압주식회사·CI 레드 #9F1B0A).
// sharp의 SVG 렌더(시스템 폰트: Malgun Gothic/Consolas)로 정적 PNG를 만든다.
// 사용법: node scripts/gen-og.mjs  → public/og.png, public/favicon 재생성
// (런타임 의존 없음 — ImageResponse 대신 정적 PNG 트랙, BUILD-CONTRACT §SEO)
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const pub = path.join(root, "public");
mkdirSync(pub, { recursive: true });

// 라이트(#f4f5f3) + CI 레드 바(#9F1B0A) — 사실 텍스트만(오너 라이트 전환 2026-07-19)
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f4f5f3"/>
  <rect x="0" y="0" width="1200" height="6" fill="#9F1B0A"/>
  <rect x="72" y="176" width="56" height="4" fill="#9F1B0A"/>
  <text x="72" y="150" font-family="Consolas, 'Courier New', monospace" font-size="26" letter-spacing="10" fill="#565d64">HYDRAULIC &amp; PNEUMATIC CYLINDERS</text>
  <text x="66" y="300" font-family="Consolas, 'Courier New', monospace" font-weight="700" font-size="96" letter-spacing="2" fill="#1b1e21">SAMICK H&amp;P</text>
  <text x="72" y="370" font-family="'Malgun Gothic', sans-serif" font-size="34" fill="#4a5157">삼익유공압주식회사</text>
  <rect x="72" y="440" width="1056" height="1" fill="#d9dcd8"/>
  <text x="72" y="492" font-family="'Malgun Gothic', sans-serif" font-size="22" fill="#4a5157">유압·공압 실린더 제조 — 표준 유압실린더 · 제철용 강력 실린더 · 공압 실린더</text>
  <text x="72" y="540" font-family="Consolas, monospace" font-size="20" letter-spacing="1" fill="#565d64">TEL 053-591-9931~2</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(path.join(pub, "og.png"));
console.log("생성: public/og.png (1200x630)");

// 파비콘 — 원본 CI 로고(logo.gif 243×67)의 레드 심볼(픽셀 실측 x14-70·y12-54) 크롭
const logo = path.join(pub, "uploads", "orig", "brand", "logo.gif");
try {
  const base = sharp(logo).extract({ left: 11, top: 5, width: 63, height: 57 });
  const bg = { r: 255, g: 255, b: 255, alpha: 1 };
  await base.clone().resize(150, 150, { fit: "contain", background: bg })
    .extend({ top: 15, bottom: 15, left: 15, right: 15, background: bg })
    .png().toFile(path.join(pub, "apple-touch-icon.png"));
  await base.clone().resize(30, 30, { fit: "contain", background: bg })
    .extend({ top: 1, bottom: 1, left: 1, right: 1, background: bg })
    .png().toFile(path.join(pub, "icon.png"));
  console.log("생성: public/apple-touch-icon.png, public/icon.png (원본 CI 로고 심볼)");
} catch (e) {
  console.error("파비콘 생성 실패(로고 없음?):", e.message);
}
