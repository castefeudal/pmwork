import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const failures=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(tsx?|mjs)$/.test(file)&&!file.includes('.test.')){const text=fs.readFileSync(file,'utf8');const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);function check(node){if((ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))&&/\b(lorem ipsum|coming soon|TBD|FIXME)\b/i.test(node.text))failures.push(`${file}:${ast.getLineAndCharacterOfPosition(node.pos).line+1}: placeholder`);ts.forEachChild(node,check)}check(ast);const lines=text.split('\n');for(let i=0;i<lines.length;i++){if(/без магии|no magic|not merely|не просто|не маскируется|это не [^.,;:]{2,60}, а /i.test(lines[i]))failures.push(`${file}:${i+1}: formulaic contrast`);}}}}
walk('src/content');walk('src/components');walk('app');
const {methods,templates,playbooks}=await import('../src/content/catalog.ts');
// Report exact repeated secondary prose separately from hard failures: the retained
// catalog still has editorial debt. This gate must not claim that debt is cleared.
let duplicateGroups=0;
for(const [kind,records,fields] of [['methods',methods,['tailoring','combinations','prerequisites']],['templates',templates,['when','guidance','antiPattern']],['playbooks',playbooks,['next','stabilize','prevent']]])for(const field of fields){const groups=new Map();for(const r of records){const value=Array.isArray(r[field])?r[field][0]:r[field];const text=value?.en?.trim();if(!text||text.length<80)continue;groups.set(text,[...(groups.get(text)??[]),r.slug]);}for(const ids of groups.values())if(ids.length>=3){duplicateGroups++;console.warn(`${kind}.${field}: repeated prose in ${ids.join(', ')}`);}}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`Copy pattern gate PASS; ${duplicateGroups} secondary-prose groups require editorial review (not certified complete).`);
