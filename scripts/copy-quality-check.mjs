import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const failures=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(tsx?|mjs)$/.test(file)&&!file.includes('.test.')){const text=fs.readFileSync(file,'utf8');const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);function check(node){if((ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))&&/\b(lorem ipsum|coming soon|TBD|FIXME)\b/i.test(node.text))failures.push(`${file}:${ast.getLineAndCharacterOfPosition(node.pos).line+1}: placeholder`);ts.forEachChild(node,check)}check(ast);const lines=text.split('\n');for(let i=0;i<lines.length;i++){if(/без магии|no magic|not merely|не просто|не маскируется|это не [^.,;:]{2,60}, а /i.test(lines[i]))failures.push(`${file}:${i+1}: formulaic contrast`);}}}}
walk('src/content');walk('src/components');walk('app');
const {methods,templates,playbooks}=await import('../src/content/catalog.ts');
// Every long secondary paragraph in both locales is part of the release contract.
let duplicateGroups=0;
for(const [kind,records,fields] of [['methods',methods,['tailoring','combinations','prerequisites']],['templates',templates,['when','guidance','antiPattern']],['playbooks',playbooks,['next','stabilize','prevent']]])for(const locale of ['ru','en']){
 const groups=new Map();
 for(const field of fields)for(const r of records)for(const value of (Array.isArray(r[field])?r[field]:[r[field]])){
  const prose=value?.[locale]?.trim().replace(/\s+/g,' ');if(!prose||prose.length<80)continue;
  groups.set(prose,[...(groups.get(prose)??[]),`${r.slug}.${field}`]);
 }
 for(const ids of groups.values())if(ids.length>1){duplicateGroups++;failures.push(`${kind}.${locale}: duplicated long prose in ${ids.join(', ')}`);}
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`Copy gate PASS; ${duplicateGroups} duplicated long secondary-prose groups across RU/EN.`);
