import fs from "node:fs";
const text = fs.readFileSync("src/content/catalog.ts", "utf8");
const counts = {
  methods: (text.match(/\bm\(\s*"/g) || []).length,
  templates: (text.match(/\btemplate\(\s*"/g) || []).length,
  playbooks: (text.match(/\bpb\(\s*"/g) || []).length,
};
const seedBlock =
  text.match(/const glossarySeed:[\s\S]*?=\s*\[([\s\S]*?)\];\nconst g\s*=/)?.[1] ??
  "";
const extendedBlock =
  text.match(
    /const extendedGlossary:[\s\S]*?=\s*\[([\s\S]*?)\];\nexport const glossary/,
  )?.[1] ?? "";
const seed = (seedBlock.match(/^\s+\[\s*$/gm) || []).length;
const extended = (extendedBlock.match(/^\s+g\(\s*"/gm) || []).length;
counts.glossary = seed + extended;
const failures = [];
if (counts.methods < 16) failures.push(`methods ${counts.methods}/16`);
if (counts.templates < 45) failures.push(`templates ${counts.templates}/45`);
if (counts.playbooks < 35) failures.push(`playbooks ${counts.playbooks}/35`);
if (counts.glossary < 120) failures.push(`glossary ${counts.glossary}/120`);
if (/\b(TODO|FIXME|TBD|lorem ipsum|Coming Soon)\b/i.test(text))
  failures.push("placeholder text found");
if (
  /точный смысл зависит от выбранного workflow|precise meaning depends on the selected workflow/i.test(
    text,
  )
)
  failures.push("generic glossary definition found");
if (!text.includes("2026-09-05")) failures.push("source review date missing");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `content valid: ${counts.methods} methods, ${counts.templates} templates, ${counts.playbooks} playbooks, ${counts.glossary} glossary entries`,
);

// Inspect actual bilingual records, not only source-code counts.
const {methods,templates,playbooks,glossary,knowledgeDomains,sources}=await import('../src/content/catalog.ts');
const {knowledgeGuides}=await import('../src/content/knowledge.ts');
const defects=[];
const sourceIds=new Set(sources.map(x=>x.id));
function bilingual(value,path) {
 if (!value || typeof value!=='object') return;
 if ('ru' in value && 'en' in value) for(const locale of ['ru','en']) {
   if(typeof value[locale]!=='string'||!value[locale].trim()) defects.push(`${path}.${locale}: empty translation`);
   else if(/\b(TODO|FIXME|TBD|lorem ipsum|Coming Soon)\b/i.test(value[locale])) defects.push(`${path}: placeholder`);
 }
 else for(const [key,child] of Object.entries(value)) bilingual(child,`${path}.${key}`);
}
for(const [kind,rows,field] of [['methods',methods,'summary'],['templates',templates,'purpose'],['playbooks',playbooks,'title'],['glossary',glossary,'definition'],['knowledge',Object.values(knowledgeGuides),'summary']]) {
 bilingual(rows,kind);
 for(const locale of ['ru','en']) {
  const texts=rows.map(x=>x[field][locale].trim());
  if(new Set(texts).size!==texts.length)defects.push(`${kind}: duplicate primary ${locale} descriptions`);
 }
}
for(const method of methods) for(const id of method.sourceIds) if(!sourceIds.has(id)) defects.push(`${method.slug}: broken source ${id}`);
for(const domain of knowledgeDomains) if(!knowledgeGuides[domain.en]) defects.push(`Missing practical guide: ${domain.en}`);
if(defects.length){console.error(defects.join('\n'));process.exit(1);}
console.log('Deep content audit: bilingual values, placeholders, duplicate primary descriptions, 26 practical guides and methodology source relations PASS');
