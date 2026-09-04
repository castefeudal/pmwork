import fs from "node:fs";
const files=["src/content/catalog.ts","src/content/ui.ts"];
for(const file of files){const text=fs.readFileSync(file,"utf8");if(!/ru\s*:/.test(text)||!(/en\s*:/.test(text)))throw new Error(`${file}: locale missing`);if(/ru\s*:\s*""|en\s*:\s*""/.test(text))throw new Error(`${file}: empty translation`)}
const ui=fs.readFileSync("src/content/ui.ts","utf8");const ru=ui.match(/ru:\{([\s\S]*?)\},\n\s*en:/)?.[1];const en=ui.match(/en:\{([\s\S]*?)\}\n\}/)?.[1];if(!ru||!en)throw new Error("Cannot parse locale catalogs");const keys=s=>(s.match(/\b[a-zA-Z]+:/g)||[]).map(x=>x.slice(0,-1)).sort().join("|");if(keys(ru)!==keys(en))throw new Error("UI locale keys differ");console.log("i18n parity valid: ru ↔ en");
