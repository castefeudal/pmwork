import { describe,expect,it } from 'vitest';
import Fuse from 'fuse.js';
import { glossaryTerms,validateGlossary } from './glossary';
import { sources } from './catalog';
describe('glossary integrity',()=>{
 it('validates all 172 concepts and relations',()=>{expect(glossaryTerms).toHaveLength(172);expect(validateGlossary(glossaryTerms,sources.map(s=>s.id))).toEqual([]);});
 it('finds English, Russian, acronym, alias and spelling variants',()=>{
 const index=new Fuse(glossaryTerms,{keys:['term','ruTerm','acronym','aliases'],threshold:.32,ignoreLocation:true});
 for(const query of ['WBS','ИСР','work breakdown','структура декомпозиции работ','work breakdwn'])expect(index.search(query)[0].item.slug).toBe('work-breakdown-structure');
 });
 it('rejects broken relations and duplicate slugs',()=>{const term=glossaryTerms[0];expect(validateGlossary([term,{...term,related:['missing']}],[]).join(' ')).toMatch(/duplicate slug.*relation/);});
});
