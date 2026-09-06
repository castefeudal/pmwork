export const searchIntents=[
 {phrases:['проект опаздывает','срыв сроков','не успеваем','как оценить срок','критический путь','project late','project is late','slipping project','miss deadline','estimate deadline'],tokens:['project-late','cpm','forecast','deadline','critical-path','milestone','change-request']},
 {phrases:['заказчик меняет требования','меняются требования','изменилась область проекта','scope creep','requirements change','customer changes','scope changed'],tokens:['scope-creep','change-request','scope-statement','hybrid','agile','stakeholder','decision']},
 {phrases:['команда перегружена','слишком много задач','слишком много работы','team overload','too much work','too many tasks'],tokens:['capacity','wip','flow','kanban','overload','ownership']},
 {phrases:['кто отвечает','нет владельца','никто не отвечает','who owns','no owner','unassigned'],tokens:['ownership','raci','stakeholder','decision']},
 {phrases:['превышение бюджета','денег не хватает','растёт стоимость','budget overrun','over budget','cost growing'],tokens:['budget','evm','emv','change-request','cost']},
 {phrases:['риск поставщика','поставщик задерживает','vendor risk','supplier delay'],tokens:['vendor','risk','emv','dependency','procurement','issue']},
 {phrases:['что показать руководителю','подготовить статус','статус проекта','status report','executive update','what to show management'],tokens:['status','communication','decision','milestone','risk','project-health']},
 {phrases:['есть блокер','заблокировано','блокировка','blocked','blocker'],tokens:['block','issue','dependency','capacity','work']},
 {phrases:['никто не принимает решение','решение зависло','decision stuck','no decision','approval delay'],tokens:['decision','governance','raci','stakeholder','change-request']},
];
export function intentRank(query:string,id:string){const q=query.toLowerCase().trim();return searchIntents.filter(i=>i.phrases.some(p=>q.includes(p))).reduce((score,i)=>score+i.tokens.filter(t=>id.includes(t)).length,0)}
