import type { Workspace } from './schemas';
const finite=(values:number[])=>values.every(Number.isFinite);
export function riskEMV(rows:{probability:number;impact:number;residualProbability:number;residualImpact:number}[]){
 if(rows.some(r=>!finite(Object.values(r))||r.probability<0||r.probability>100||r.residualProbability<0||r.residualProbability>100||r.impact<0||r.residualImpact<0))throw Error('Invalid risk input');
 const risks=rows.map(r=>({...r,emv:r.probability/100*r.impact,residual:r.residualProbability/100*r.residualImpact}));
 return {risks,total:risks.reduce((s,r)=>s+r.emv,0),residual:risks.reduce((s,r)=>s+r.residual,0),allOccur:rows.reduce((s,r)=>s+r.impact,0)};
}
export function decisionMatrix(weights:number[],scores:number[][]){
 if(!weights.length||!scores.length||!finite(weights)||weights.some(w=>w<0)||weights.reduce((a,b)=>a+b,0)<=0||scores.some(r=>r.length!==weights.length||!finite(r)||r.some(s=>s<0||s>10)))throw Error('Invalid matrix');
 const rank=(w:number[])=>scores.map((r,index)=>({index,score:r.reduce((sum,s,j)=>sum+s*w[j],0)/w.reduce((a,b)=>a+b,0),contributions:r.map((s,j)=>s*w[j]/w.reduce((a,b)=>a+b,0))})).sort((a,b)=>b.score-a.score||a.index-b.index);
 const ranking=rank(weights),sensitivity=weights.flatMap((w,criterion)=>[.8,1.2].map(factor=>{const changed=weights.map((v,j)=>j===criterion?v*factor:v);return {criterion,factor,winner:rank(changed)[0].index};}));
 return {ranking,sensitivity,close:ranking.length>1&&ranking[0].score-ranking[1].score<=.5};
}
export function deadlineConfidence(samples:number[],remaining:number,start:string,target:string,iterations=2000){
 const startMs=Date.parse(start+'T00:00:00Z'),targetMs=Date.parse(target+'T00:00:00Z');
 if(!Number.isFinite(startMs)||!Number.isFinite(targetMs)||targetMs<startMs||!Number.isInteger(remaining)||remaining<0||remaining>10000||!Number.isInteger(iterations)||iterations<100||iterations>10000||samples.length<14||samples.length>366||!finite(samples)||samples.some(s=>s<0||!Number.isInteger(s))||!samples.some(s=>s>0))throw Error('Need 14–366 complete daily observations, including zero days, and valid dates/counts');
 let seed=16777619;for(const s of samples)seed=Math.imul(seed^s,16777619)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const durations:number[]=[];const horizon=Math.floor((targetMs-startMs)/86400000);
 for(let i=0;i<iterations;i++){let done=0,days=0;while(done<remaining&&days<3650){done+=samples[Math.floor(random()*samples.length)];days++;}if(done<remaining)throw Error('Forecast exceeds ten-year simulation horizon');durations.push(days);}
 durations.sort((a,b)=>a-b);const date=(q:number)=>new Date(startMs+durations[Math.min(iterations-1,Math.ceil(q*iterations)-1)]*86400000).toISOString().slice(0,10);
 return {durations,p50:date(.5),p80:date(.8),p90:date(.9),proportion:durations.filter(d=>d<=horizon).length/iterations,sampleSize:samples.length,iterations};
}
export function dailyHistory(w:Workspace,projectId:string,asOf:string,days=28){
 const end=Date.parse(asOf+'T00:00:00Z');if(!Number.isFinite(end)||!Number.isInteger(days)||days<14||days>366)throw Error('Invalid history window');
 const project=w.projects.find(p=>p.id===projectId);if(!project||!project.startDate||Date.parse(project.startDate+'T00:00:00Z')>end-days*86400000)return null;
 const complete=w.workItems.filter(x=>x.projectId===projectId&&x.done&&!x.archived);
 if(complete.filter(x=>x.completedAt&&Date.parse(x.completedAt)>=end-days*86400000&&Date.parse(x.completedAt)<end).length<10)return null;
 return Array.from({length:days},(_,i)=>{const a=end-(days-i)*86400000,b=a+86400000;return complete.filter(x=>x.completedAt&&Date.parse(x.completedAt)>=a&&Date.parse(x.completedAt)<b).length;});
}
export function estimateCalibration(w:Workspace,projectId:string){
 const sample=w.workItems.filter(x=>x.projectId===projectId&&x.done&&!x.archived&&x.originalEstimate!==undefined&&x.originalEstimate>0&&x.actualEffort!==undefined&&Number.isFinite(x.actualEffort));
 if(sample.length<10)return {count:sample.length,minimum:10,medianRatio:null,medianAbsoluteError:null};
 const ratios=sample.map(x=>x.actualEffort!/x.originalEstimate!).sort((a,b)=>a-b),errors=ratios.map(v=>Math.abs(v-1)).sort((a,b)=>a-b);const median=(a:number[])=>a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;
 return {count:sample.length,minimum:10,medianRatio:median(ratios),medianAbsoluteError:median(errors)};
}
export function ownershipCoverage(w:Workspace,projectId:string){
 const active=w.workItems.filter(x=>x.projectId===projectId&&!x.archived&&!x.done),members=w.teamMembers.filter(x=>x.projectId===projectId);
 const issues:{id:string;kind:string;title:string;reason:'unassigned'|'external'|'ambiguous'|'concentration'}[]=[];
 const inspect=(id:string,kind:string,title:string,owner:string,ownerId?:string)=>{if(!owner&&!ownerId)issues.push({id,kind,title,reason:'unassigned'});else if(!ownerId){const matches=members.filter(m=>m.name===owner);if(matches.length!==1)issues.push({id,kind,title,reason:matches.length?'ambiguous':'external'});}};
 active.forEach(x=>inspect(x.id,'work',x.title,x.owner,x.ownerId));
 w.milestones.filter(x=>x.projectId===projectId&&x.status!=='done').forEach(x=>inspect(x.id,'milestone',x.title,x.ownerLabel??'',x.ownerId));
 w.risks.filter(x=>x.projectId===projectId&&x.status!=='closed').forEach(x=>inspect(x.id,'risk',x.title,x.owner));
 w.decisions.filter(x=>x.projectId===projectId&&x.status==='pending').forEach(x=>inspect(x.id,'decision',x.question,x.owner));
 const critical=active.filter(x=>x.priority==='critical');for(const m of members){const count=critical.filter(x=>x.ownerId===m.id||(!x.ownerId&&x.owner===m.name)).length;if(critical.length>=3&&count/critical.length>.5)issues.push({id:m.id,kind:'team',title:m.name,reason:'concentration'});}
 return issues;
}
export function capacityPlan(capacity:number,planned:number,wip:number,throughput:number,desiredDays:number){
 if(!finite([capacity,planned,wip,throughput,desiredDays])||[capacity,planned,wip,throughput].some(v=>v<0)||desiredDays<=0)throw Error('Invalid capacity inputs');
 return {overload:Math.max(0,planned-capacity),utilization:capacity>0?planned/capacity:null,impliedDays:throughput>0?wip/throughput:null,wipTarget:throughput>0?throughput*desiredDays:null};
}
