import fs from "node:fs";
const text=fs.readFileSync("src/content/catalog.ts","utf8");
const counts={methods:(text.match(/\bm\("/g)||[]).length,templates:(text.match(/\btemplate\("/g)||[]).length,playbooks:(text.match(/\bpb\("/g)||[]).length};
const seedBlock=text.match(/const glossarySeed:[\s\S]*?=\[([\s\S]*?)\];\nconst g=/)?.[1]??"";
const extendedBlock=text.match(/const extendedGlossary:[\s\S]*?=\[([\s\S]*?)\];\nexport const glossary/)?.[1]??"";
const seed=(seedBlock.match(/^\s+\["/gm)||[]).length;
const extended=(extendedBlock.match(/^\s+g\("/gm)||[]).length;
counts.glossary=seed+extended;
const failures=[];
if(counts.methods<16)failures.push(`methods ${counts.methods}/16`);
if(counts.templates<45)failures.push(`templates ${counts.templates}/45`);
if(counts.playbooks<35)failures.push(`playbooks ${counts.playbooks}/35`);
if(counts.glossary<120)failures.push(`glossary ${counts.glossary}/120`);
if(/\b(TODO|FIXME|TBD|lorem ipsum|Coming Soon)\b/i.test(text))failures.push("placeholder text found");
if(/точный смысл зависит от выбранного workflow|precise meaning depends on the selected workflow/i.test(text))failures.push("generic glossary definition found");
if(!text.includes("2026-09-05"))failures.push("source review date missing");
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log(`content valid: ${counts.methods} methods, ${counts.templates} templates, ${counts.playbooks} playbooks, ${counts.glossary} glossary entries`);
