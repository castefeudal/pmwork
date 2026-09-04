import fs from "node:fs";
const text=fs.readFileSync("src/content/catalog.ts","utf8");
const counts={methods:(text.match(/\bm\("/g)||[]).length,templates:(text.match(/\btemplate\("/g)||[]).length,playbooks:(text.match(/\bpb\("/g)||[]).length};
const extended=text.match(/const extendedTerms=\[([\s\S]*?)\];/)?.[1]??"";
const seed=(text.match(/^\s+\["/gm)||[]).length;
counts.glossary=seed+(extended.match(/"[^"\n]+"/g)||[]).length;
const failures=[];
if(counts.methods<16)failures.push(`methods ${counts.methods}/16`);
if(counts.templates<45)failures.push(`templates ${counts.templates}/45`);
if(counts.playbooks<35)failures.push(`playbooks ${counts.playbooks}/35`);
if(counts.glossary<120)failures.push(`glossary ${counts.glossary}/120`);
if(/\b(TODO|FIXME|TBD|lorem ipsum|Coming Soon)\b/i.test(text))failures.push("placeholder text found");
if(!text.includes("2026-09-04"))failures.push("source review date missing");
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log(`content valid: ${counts.methods} methods, ${counts.templates} templates, ${counts.playbooks} playbooks, ${counts.glossary} glossary entries`);
