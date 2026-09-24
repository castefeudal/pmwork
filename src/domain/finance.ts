import type { Workspace } from './schemas';

/** A project has one recorded currency. No cross-currency conversion is inferred. */
export function projectFinancials(workspace:Workspace,projectId:string) {
  const rows=workspace.budgets.filter(x=>x.projectId===projectId);
  const missingForecast=rows.filter(x=>x.forecast===undefined).length;
  const planned=rows.length?rows.reduce((sum,x)=>sum+x.planned,0):null;
  const actual=rows.length?rows.reduce((sum,x)=>sum+x.actual,0):null;
  const committed=rows.length?rows.reduce((sum,x)=>sum+x.committed,0):null;
  const forecast=rows.length&&!missingForecast?rows.reduce((sum,x)=>sum+x.forecast!,0):null;
  return {planned,actual,committed,forecast,missingForecast,lines:rows.length,
    variance:planned!==null&&forecast!==null?planned-forecast:null,
  };
}
