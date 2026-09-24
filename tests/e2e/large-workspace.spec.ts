import {test,expect} from '@playwright/test';
import {demoWorkspace,emptyWorkspace} from '../../src/data/demo';
import {assertWorkspaceGraph} from '../../src/domain/workspace-integrity';
import {route} from './support';

for(const [projects,count] of [[1,20],[10,1000],[50,10000]])test(`bounded work UI: ${projects} projects and ${count} records`,async({page},info)=>{
  const w=emptyWorkspace('en'),demo=demoWorkspace('en'),seed=demo.workItems[0];
  w.projects=Array.from({length:projects},(_,i)=>({...demo.projects[0],id:`scale-${i}`,name:`Scale project ${i}`,demo:false}));
  w.workItems=Array.from({length:count},(_,i)=>({...seed,id:`scale-work-${i}`,projectId:`scale-${i%projects}`,title:`Scale item ${i}`,description:'',blocked:false,done:false,status:'ready' as const,parentId:undefined,ownerId:undefined,ownerLabel:undefined,startDate:'2026-09-01',dueDate:'2026-09-30',dependencies:[],riskIds:[],objectiveIds:[],milestoneId:undefined,iterationId:undefined,startedAt:undefined,completedAt:undefined,statusHistory:undefined}));
  assertWorkspaceGraph(w);
  await page.goto(route('/en/'));
  await page.evaluate(w=>new Promise<void>((resolve,reject)=>{
    const request=indexedDB.open('pmwork-local',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('workspace');
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{
      const db=request.result,tx=db.transaction('workspace','readwrite');
      tx.objectStore('workspace').put({workspace:w,savedAt:Date.now()},'primary');
      tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
    };
  }),w);
  await page.goto(route('/en/workspace/?project=scale-0&view=work'));
  await expect(page.locator('.workspace-shell')).toBeVisible();
  await expect(page.locator('.recovery-banner')).toHaveCount(0);
  const perProject=count/projects;
  await expect(page.locator('.work-table tbody tr')).toHaveCount(Math.min(perProject,100));
  const target=`Scale item ${count-projects}`;
  const started=Date.now();
  await page.getByRole('textbox',{name:'Search work',exact:true}).fill(target);
  await expect(page.locator('.work-table tbody tr')).toHaveCount(1);
  const elapsed=Date.now()-started;
  await info.attach('large-workspace-lab',{body:JSON.stringify({projects,workItems:count,filterInteractionMs:elapsed,note:'Unthrottled lab interaction; not field INP.'}),contentType:'application/json'});
  expect(elapsed).toBeLessThan(3000);
  await expect(page.locator('.work-title-button:visible, .mobile-work-card strong:visible')).toHaveText(target);
});
