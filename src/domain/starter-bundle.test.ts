import {it,expect} from 'vitest';
import {demoWorkspace} from '@/data/demo';
import {starterPacks} from '@/content/starter-packs';
import {applyStarterBundle,undoStarterBundle} from './starter-bundle';
for(const locale of ['ru','en'] as const)for(const pack of starterPacks)it(`creates linked ${pack.id} starter atomically in ${locale}`,()=>{
 const before=demoWorkspace(locale);before.workItems=[];before.objectives=[];
 const w=applyStarterBundle(before,'atlas',pack.id,locale),work=w.workItems;
 expect(work.length).toBeGreaterThanOrEqual(3);expect(work.length).toBeLessThanOrEqual(5);
 expect(work.every(x=>w.milestones.some(m=>m.id===x.milestoneId))).toBe(true);
 expect(work.every(x=>x.dependencies.every(id=>work.some(other=>other.id===id)))).toBe(true);
 expect(undoStarterBundle(w,before,w)).toEqual(before);
 expect(()=>undoStarterBundle({...w,name:'Edited'},before,w)).toThrow();
 expect(()=>applyStarterBundle(w,'atlas',pack.id,locale)).toThrow();
});
