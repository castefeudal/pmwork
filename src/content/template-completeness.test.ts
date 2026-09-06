import {it,expect} from 'vitest';
import {templates} from './catalog';
import {templateExamples} from './template-examples';
import {templateBoundaries} from './template-boundaries';
it('every template has a bilingual worked example, boundary and specific guidance',()=>{
 for(const locale of ['ru','en'] as const){
  const guidance=templates.map(t=>t.guidance[locale]);expect(new Set(guidance).size).toBe(templates.length);
  for(const t of templates){expect(templateExamples[t.slug]?.[locale]?.length,t.slug).toBeGreaterThan(80);expect(templateBoundaries[t.slug]?.[locale==='ru'?0:1]?.length,t.slug).toBeGreaterThan(30);}
 }
});
