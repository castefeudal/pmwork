import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
const files=[];
function walk(dir) { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(html|js|css|woff2|png|svg|webmanifest|txt|xml)$/.test(file)&&!file.endsWith('/sw.js')&&!/out\/(?:404(?:\/|\.)|_not-found\/)/.test(file))files.push(file);} }
walk("out");
files.sort();
const hash=createHash("sha256");
hash.update(fs.readFileSync("public/sw.js"));
for(const file of files)hash.update(file).update(fs.readFileSync(file));
const version=hash.digest("hex").slice(0,12);
// Individual term pages are cached on visit; precache the public shell and shared assets.
const urls=files.filter(file=>!/^out\/(ru|en)\/glossary\/[^/]+\//.test(file)).map(file=>"./"+file.slice(4).replace(/index\.html$/, ""));
const worker=fs.readFileSync("public/sw.js","utf8").replace('"pmwork-v3"',JSON.stringify(`pmwork-${version}`)).replace('/* PRECACHE */ []',JSON.stringify(urls));
fs.writeFileSync("out/sw.js",worker);
fs.writeFileSync("out/release.json",JSON.stringify({version,productVersion:JSON.parse(fs.readFileSync("package.json","utf8")).version,commit:process.env.GITHUB_SHA ?? "local",assets:urls.length}));
console.log(`PWA: ${urls.length} precached resources; release ${version}`);
