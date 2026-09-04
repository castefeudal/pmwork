export type CPMTask = { id:string; duration:number; predecessors:string[] };
export type CPMResult = CPMTask & { es:number; ef:number; ls:number; lf:number; float:number; critical:boolean };

export function calculateCPM(tasks:CPMTask[]):CPMResult[] {
  if (!tasks.length) return [];
  const map = new Map(tasks.map(t=>[t.id,t]));
  for (const t of tasks) {
    if (!t.id || !Number.isFinite(t.duration) || t.duration < 0) throw new Error("Invalid CPM task");
    for (const p of t.predecessors) if (!map.has(p)) throw new Error(`Unknown predecessor: ${p}`);
  }
  const order:string[]=[]; const visiting=new Set<string>(); const visited=new Set<string>();
  const visit=(id:string)=>{ if(visiting.has(id)) throw new Error("Dependency cycle"); if(visited.has(id)) return; visiting.add(id); for(const p of map.get(id)!.predecessors) visit(p); visiting.delete(id); visited.add(id); order.push(id); };
  tasks.forEach(t=>visit(t.id));
  const forward=new Map<string,{es:number;ef:number}>();
  for(const id of order){ const t=map.get(id)!; const es=Math.max(0,...t.predecessors.map(p=>forward.get(p)!.ef)); forward.set(id,{es,ef:es+t.duration}); }
  const projectDuration=Math.max(...[...forward.values()].map(v=>v.ef));
  const successors=new Map(tasks.map(t=>[t.id,[] as string[]]));
  tasks.forEach(t=>t.predecessors.forEach(p=>successors.get(p)!.push(t.id)));
  const backward=new Map<string,{ls:number;lf:number}>();
  for(const id of [...order].reverse()){ const t=map.get(id)!; const succ=successors.get(id)!; const lf=succ.length?Math.min(...succ.map(s=>backward.get(s)!.ls)):projectDuration; backward.set(id,{lf,ls:lf-t.duration}); }
  return order.map(id=>{ const t=map.get(id)!; const f=forward.get(id)!; const b=backward.get(id)!; const float=b.ls-f.es; return {...t,...f,...b,float,critical:Math.abs(float)<1e-9}; });
}

export function calculatePERT(optimistic:number, mostLikely:number, pessimistic:number){
  if([optimistic,mostLikely,pessimistic].some(v=>!Number.isFinite(v)||v<0)||optimistic>mostLikely||mostLikely>pessimistic) throw new Error("Expected O ≤ M ≤ P");
  const expected=(optimistic+4*mostLikely+pessimistic)/6; const standardDeviation=(pessimistic-optimistic)/6;
  return { expected, standardDeviation, variance:standardDeviation**2 };
}

export function calculateEVM(pv:number,ev:number,ac:number,bac:number){
  if([pv,ev,ac,bac].some(v=>!Number.isFinite(v)||v<0)) throw new Error("Values must be non-negative");
  const spi=pv===0?null:ev/pv; const cpi=ac===0?null:ev/ac; const eac=cpi&&cpi>0?bac/cpi:null;
  return { sv:ev-pv, cv:ev-ac, spi, cpi, eac, etc:eac===null?null:Math.max(0,eac-ac), vac:eac===null?null:bac-eac };
}

export function littleLaw(wip:number,throughput:number){ if(wip<0||throughput<=0) throw new Error("Throughput must be positive"); return {cycleTime:wip/throughput}; }
export function rice(reach:number,impact:number,confidence:number,effort:number){ if(effort<=0||[reach,impact,confidence].some(v=>v<0)) throw new Error("Invalid RICE input"); return reach*impact*(confidence/100)/effort; }
export function wsjf(value:number,timeCriticality:number,riskReduction:number,jobSize:number){ if(jobSize<=0) throw new Error("Job size must be positive"); return (value+timeCriticality+riskReduction)/jobSize; }

export type MonteCarloMode = "itemsByDate"|"dateForItems";
export function monteCarlo(samples:number[], horizonOrItems:number, iterations=5000, random:()=>number=Math.random, mode:MonteCarloMode="itemsByDate"){
  if(samples.length<3||samples.some(v=>!Number.isFinite(v)||v<0)||horizonOrItems<=0||iterations<100) throw new Error("Insufficient forecasting data");
  const results:number[]=[];
  for(let i=0;i<iterations;i++){
    if(mode==="itemsByDate"){ let total=0; for(let d=0;d<horizonOrItems;d++) total+=samples[Math.floor(random()*samples.length)]!; results.push(total); }
    else { let total=0,days=0; while(total<horizonOrItems&&days<3650){ total+=samples[Math.floor(random()*samples.length)]!; days++; } results.push(days); }
  }
  results.sort((a,b)=>a-b); const pick=(p:number)=>results[Math.min(results.length-1,Math.floor((p/100)*results.length))]!;
  return { p50:pick(mode==="itemsByDate"?50:50), p70:pick(mode==="itemsByDate"?30:70), p85:pick(mode==="itemsByDate"?15:85), p95:pick(mode==="itemsByDate"?5:95), iterations };
}
