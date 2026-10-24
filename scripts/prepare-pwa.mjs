import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const files=[];
function walk(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,entry.name),relative=path.relative('out',file).split(path.sep).join('/');
    if(entry.isDirectory())walk(file);
    else if(/\.(html|js|css|woff2|png|webp|svg|webmanifest|txt|xml)$/.test(file)&&relative!=='sw.js'&&!/^(?:404(?:\/|\.)|_not-found\/)/.test(relative))files.push(file);
  }
}
walk("out");
files.sort();
const exportPath = file => path.relative("out", file).split(path.sep).join("/");
const basePath = process.env.PMWORK_BASE_PATH === "github" ? "/pmwork" : "";
const fontPaths = files.filter(file => file.endsWith(".woff2")).map(exportPath);
const fontPreloads = locale => {
  const scripts = locale === "ru" ? ["latin", "cyrillic"] : ["latin"];
  return scripts.flatMap(script => ["manrope", "inter"].map(family => {
    const stem = `${family}-${script}-wght-normal.`;
    const file = fontPaths.find(file => path.posix.basename(file).startsWith(stem));
    if (!file) throw Error(`Missing bundled critical font: ${stem}`);
    return `<link data-pmwork-font-preload="" rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href="${basePath}/${file}">`;
  })).join("");
};

// Language and self-hosted above-fold font hints must be hashed into offline HTML.
for (const file of files) {
  const locale = exportPath(file).match(/^(ru|en)\/.*\.html$/)?.[1];
  if (locale) {
    const html = fs.readFileSync(file, "utf8")
      .replace(/<html lang="[^"]*"/, `<html lang="${locale}"`)
      .replace(/<link data-pmwork-font-preload=""[^>]*>/g, "")
      .replace("</head>", `${fontPreloads(locale)}</head>`);
    fs.writeFileSync(file, html);
  }
}

const hash=createHash("sha256");
hash.update(fs.readFileSync("public/sw.js"));
for(const file of files)hash.update(file).update(fs.readFileSync(file));
const version=hash.digest("hex").slice(0,12);

const detailRoute = /^(ru|en)\/(?:glossary|methods|templates)\/[^/]+\//;
const urls=files
  .filter(file=>!detailRoute.test(exportPath(file)))
  .map(file=>"./"+exportPath(file).replace(/index\.html$/, ""));

const worker=fs.readFileSync("public/sw.js","utf8")
  .replace('"pmwork-v3"',JSON.stringify(`pmwork-${version}`))
  .replace('/* PRECACHE */ []',JSON.stringify(urls));
fs.writeFileSync("out/sw.js",worker);
fs.writeFileSync("out/release.json",JSON.stringify({
  version,
  productVersion:JSON.parse(fs.readFileSync("package.json","utf8")).version,
  commit:process.env.GITHUB_SHA ?? "local",
  assets:urls.length,
  cachePolicy:{
    precache:"application shell, catalog indexes, workspace and shared assets",
    runtime:"method/template/glossary detail pages are cached after successful visits"
  }
}));
console.log(`PWA: ${urls.length} precached resources; detail pages use runtime cache; release ${version}`);
