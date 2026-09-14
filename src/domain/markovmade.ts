export type MarkovmadeInput={
  impact:number;frequency:number;evidence:number;riskReduction:number;strategicFit:number;
  effort:number;complexity:number;regressionRisk:number;
};
const benefitKeys=['impact','frequency','evidence','riskReduction','strategicFit'] as const;
const costKeys=['effort','complexity','regressionRisk'] as const;
const bounded=(value:number)=>Number.isFinite(value)&&value>=0&&value<=10;
export function scoreMarkovmade(input:MarkovmadeInput){
 if(![...benefitKeys,...costKeys].every(key=>bounded(input[key]))||input.effort<=0)throw Error('Scores must be 0–10 and effort must be above zero');
 const benefit=benefitKeys.reduce((sum,key)=>sum+input[key],0)/benefitKeys.length;
 const cost=costKeys.reduce((sum,key)=>sum+input[key],0)/costKeys.length;
 const score=Math.round(100*benefit/(benefit+Math.max(cost,.1)));
 const variants=[...benefitKeys,...costKeys].flatMap(key=>[.8,1.2].map(factor=>scoreMarkovmadeCore({...input,[key]:Math.max(0,Math.min(10,input[key]*factor))})));
 const range:[number,number]=[Math.min(...variants),Math.max(...variants)];
 const upside=benefitKeys.reduce((a,b)=>input[a]>=input[b]?a:b);
 const downside=costKeys.reduce((a,b)=>input[a]>=input[b]?a:b);
 return {score,benefit,cost,confidence:input.evidence>=8?'high':input.evidence>=5?'medium':'low',mainUpside:upside,mainDownside:downside,mainUncertainty:input.evidence<5?'evidence':range[1]-range[0]>=10?'sensitivity':'execution',sensitivity:{min:range[0],max:range[1],unstable:range[0]<60&&range[1]>=60},recommendedNextAction:score>=60?'run-reversible-test':input.evidence<5?'gather-evidence':'reduce-cost'} as const;
}
function scoreMarkovmadeCore(input:MarkovmadeInput){const benefit=benefitKeys.reduce((sum,key)=>sum+input[key],0)/benefitKeys.length,cost=costKeys.reduce((sum,key)=>sum+input[key],0)/costKeys.length;return Math.round(100*benefit/(benefit+Math.max(cost,.1)));}
