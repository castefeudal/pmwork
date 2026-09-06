import {workspaceSchema,type Workspace,type Locale} from './schemas';
/** Decision evidence uses the existing portable document contract, not another database. */
export function saveScenario(workspace:Workspace,projectId:string,tool:string,result:string,inputs:Record<string,unknown>,locale:Locale){
 if(!workspace.projects.some(p=>p.id===projectId)||!result.trim())throw Error('Scenario requires a project and result');
 const at=new Date().toISOString();
 const names:Record<string,[string,string]>={deadline:['Прогноз срока','Deadline forecast'],emv:['Денежная экспозиция риска','Monetary risk exposure'],capacity:['Сценарий мощности','Capacity scenario'],cpm:['Сетевой план','Network schedule'],evm:['Анализ освоенного объёма','Earned value analysis'],forecast:['Прогноз объёма поставки','Delivery volume forecast'],priority:['Сравнение приоритетов','Priority comparison'],flow:['Сценарий потока','Flow scenario'],ownership:['Покрытие ответственности','Ownership coverage'],calibration:['Калибровка оценок','Estimate calibration']};
 const title=names[tool]?.[locale==='ru'?0:1];if(!title)throw Error('Unsupported scenario');
 const body=`# ${title}\n\n${locale==='ru'?'Дата расчёта':'Calculated at'}: ${at}\n\n## ${locale==='ru'?'Результат':'Result'}\n${result}\n\n## ${locale==='ru'?'Входные данные и допущения':'Inputs and assumptions'}\n\n${JSON.stringify(inputs,null,2)}`;
 return workspaceSchema.parse({...workspace,documents:[...workspace.documents,{id:crypto.randomUUID(),projectId,title,type:`scenario:${tool}`,body,relatedIds:[],updatedAt:at}]});
}
