import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
const files=[];
function walk(dir) { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(html|js|css|woff2|png|svg|webmanifest)$/.test(file)&&!file.endsWith('/sw.js'))files.push(file);} }
walk("out");
files.sort();
const hash=createHash("sha256");
for(const file of files)hash.update(file).update(fs.readFileSync(file));
const version=hash.digest("hex").slice(0,12);
const urls=files.map(file=>"./"+file.slice(4).replace(/index\.html$/, ""));
const worker=fs.readFileSync("public/sw.js","utf8").replace('"pmwork-v3"',JSON.stringify(`pmwork-${version}`)).replace('/* PRECACHE */ []',JSON.stringify(urls));
fs.writeFileSync("out/sw.js",worker);
fs.writeFileSync("out/release.json",JSON.stringify({version,assets:urls.length}));
console.log(`PWA: ${urls.length} precached resources; release ${version}`);
