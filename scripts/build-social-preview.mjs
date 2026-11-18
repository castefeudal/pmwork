/**
 * Renders the two social-preview plates (1200x630 PNG) used by Open Graph.
 *
 * Composes the generated atlas relief with the brand and localized route labels.
 *
 * Usage: node scripts/build-social-preview.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const fontDir = join(root, "node_modules/@fontsource-variable/manrope/files");
const fontSource = async (script) =>
  `data:font/woff2;base64,${(await readFile(join(fontDir, `manrope-${script}-wght-normal.woff2`))).toString("base64")}`;
const [cyrillic, latin] = await Promise.all([fontSource("cyrillic"), fontSource("latin")]);
const scene = `data:image/webp;base64,${(await readFile(join(root, "public/visuals/sections/convergence.webp"))).toString("base64")}`;
const mark = `data:image/png;base64,${(await readFile(join(root, "public/icon-512.png"))).toString("base64")}`;

const plates = {
  ru: {
    loop: ["Сигнал", "Решение", "Действие", "Контроль"],
    note: "Данные остаются в браузере. Аккаунт не нужен.",
  },
  en: {
    loop: ["Signal", "Decision", "Action", "Control"],
    note: "Data stays in your browser. No account needed.",
  },
};

/** Node x positions inside the 1052-wide loop sheet. */
const nodes = [16, 358, 700, 1036];

function document({ loop, note }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face{font-family:'Manrope';font-style:normal;font-weight:200 800;
  src:url(${cyrillic}) format('woff2-variations');}
@font-face{font-family:'Manrope';font-style:normal;font-weight:200 800;
  src:url(${latin}) format('woff2-variations');}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{position:relative;background:#0b1117;color:#dfeaed;font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased}
.field{position:absolute;inset:0;background:linear-gradient(90deg,#0b1117 3%,transparent 85%),linear-gradient(0deg,#0b1117 3%,transparent 75%),url("${scene}") center/cover}
.kicker{position:absolute;left:74px;top:106px;font-size:19px;font-weight:700;letter-spacing:.3em;color:#c79a75}
.plate{position:absolute;left:72px;top:148px;width:134px;height:134px;overflow:hidden;border-radius:26px;
  border:1px solid rgba(222,237,242,.16);background:#0d1a22}
.plate img{display:block;width:100%;height:100%;object-fit:cover}
.wordmark{position:absolute;left:232px;top:160px;font-size:98px;font-weight:800;letter-spacing:-.05em;line-height:1;color:#eef6f8}
.rule{position:absolute;left:74px;top:322px;width:1052px;height:1px;background:rgba(222,237,242,.16)}
.loop{position:absolute;left:74px;top:352px}
.loop text{font-family:'Manrope',sans-serif;font-size:26px;font-weight:700;fill:#cfe2e6}
.note{position:absolute;left:74px;top:506px;font-size:27px;font-weight:500;color:#8fadb8}
.corner{position:absolute;width:26px;height:26px;border-color:rgba(199,154,117,.7);border-style:solid}
.c1{left:34px;top:34px;border-width:1px 0 0 1px}
.c2{right:34px;top:34px;border-width:1px 1px 0 0}
.c3{right:34px;bottom:34px;border-width:0 1px 1px 0}
.c4{left:34px;bottom:34px;border-width:0 0 1px 1px}
</style></head><body>
<div class="field" aria-hidden="true"></div>
<div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div><div class="corner c4"></div>
<p class="kicker">OPERATIONAL ATLAS</p>
<div class="plate"><img src="${mark}" alt=""></div>
<h1 class="wordmark">PMWORK</h1>
<div class="rule"></div>
<svg class="loop" width="1052" height="126" viewBox="0 0 1052 126" aria-hidden="true" fill="none">
  <defs>
    <marker id="head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M0 1 L9 5 L0 9 z" fill="#56c9bd"/>
    </marker>
  </defs>
  <line x1="16" y1="34" x2="1036" y2="34" stroke="#dfeaed" stroke-opacity=".16"/>
  ${nodes.map((cx, i) => `
  <g>
    <circle cx="${cx}" cy="34" r="7.5" fill="#0b1117" stroke="${i === 3 ? "#c79a75" : "#56c9bd"}" stroke-width="2"/>
    ${i < 3 ? `<line x1="${cx + 22}" y1="34" x2="${nodes[i + 1] - 16}" y2="34" stroke="#56c9bd" stroke-width="2" marker-end="url(#head)"/>` : ""}
    <line x1="${cx}" y1="50" x2="${cx}" y2="64" stroke="#dfeaed" stroke-opacity=".2"/>
    <text x="${i === 0 ? 16 : i === 3 ? 1036 : cx}" y="98" text-anchor="${i === 0 ? "start" : i === 3 ? "end" : "middle"}">${loop[i]}</text>
  </g>`).join("")}
</svg>
<p class="note">${note}</p>
</body></html>`;
}

const server = createServer((req, res) => {
  const locale = req.url === "/en" ? "en" : "ru";
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(document(plates[locale]));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [locale, plate] of Object.entries(plates)) {
  await page.goto(`${baseUrl}/${locale}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const file = `og-image-${locale}.png`;
  const shot = await page.screenshot({ type: "png" });
  await writeFile(join(root, "public/visuals/social", file), shot);
  console.log(file, `${(shot.byteLength / 1024).toFixed(1)} kB`, plate.note);
}
await browser.close();
server.close();
