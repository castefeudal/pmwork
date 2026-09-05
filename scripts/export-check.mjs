import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out"),
  failures = [];
const required = [
  "index.html",
  "ru/index.html",
  "en/index.html",
  "ru/workspace/index.html",
  "en/workspace/index.html",
  "ru/methods/index.html",
  "en/glossary/index.html",
  "manifest-ru.webmanifest",
  "manifest-en.webmanifest",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "sw.js",
  "robots.txt",
  "sitemap.xml",
];
for (const file of required)
  if (!fs.existsSync(path.join(root, file)))
    failures.push(`missing export file: ${file}`);

const html = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith(".html")) html.push(file);
  }
};
if (fs.existsSync(root)) walk(root);
for (const file of html) {
  const source = fs.readFileSync(file, "utf8");
  if (/\b(TODO|FIXME|TBD|lorem ipsum|Coming Soon)\b/i.test(source))
    failures.push(`placeholder in ${path.relative(root, file)}`);
  for (const match of source.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const ref = match[1];
    if (!ref || /^(https?:|mailto:|tel:|data:|#)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0].replace(/^\/pmwork\//, "/");
    if (!clean.startsWith("/")) continue;
    let target = path.join(root, clean);
    if (clean.endsWith("/")) target = path.join(target, "index.html");
    if (!fs.existsSync(target))
      failures.push(`${path.relative(root, file)} -> ${ref}`);
  }
}
if (html.length < 23) failures.push(`only ${html.length} HTML pages exported`);
if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exit(1);
}
console.log(
  `export valid: ${html.length} HTML pages, required PWA assets and local references present`,
);
