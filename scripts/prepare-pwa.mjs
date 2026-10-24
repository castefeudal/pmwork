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

// Transform and hash in one pass; avoid rewriting already-correct export pages.
const hash=createHash("sha256");
hash.update(fs.readFileSync("public/sw.js"));
for (const file of files) {
  let bytes=fs.readFileSync(file);
  const locale = exportPath(file).match(/^(ru|en)\/.*\.html$/)?.[1];
  if (locale) {
    const original=bytes.toString("utf8"),html=original.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`);
    if(html!==original){bytes=Buffer.from(html);fs.writeFileSync(file,bytes);}
  }
  hash.update(file).update(bytes);
}

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
