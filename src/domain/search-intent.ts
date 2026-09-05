export const searchIntents=[
 {phrases:['проект опаздывает','срыв сроков','не успеваем','project late','project is late','slipping project','miss deadline'],tokens:['project-late','cpm','forecast','deadline','critical-path','milestone','change-request']},
 {phrases:['заказчик меняет требования','меняются требования','scope creep','requirements change','customer changes'],tokens:['scope-creep','change-request','scope-statement','hybrid','agile','stakeholder','decision']},
 {phrases:['команда перегружена','слишком много задач','team overload','too much work'],tokens:['capacity','wip','flow','kanban','overload','ownership']},
 {phrases:['кто отвечает','нет владельца','who owns','no owner'],tokens:['ownership','raci','stakeholder','decision']},
 {phrases:['превышение бюджета','денег не хватает','budget overrun','over budget'],tokens:['budget','evm','emv','change-request','cost']},
];
export function intentRank(query:string,id:string){const q=query.toLowerCase().trim();return searchIntents.filter(i=>i.phrases.some(p=>q.includes(p))).reduce((score,i)=>score+i.tokens.filter(t=>id.includes(t)).length,0)}
