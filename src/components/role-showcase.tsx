"use client";
import {useState} from "react";
import {managementRoles,roleLabels,roleQuestions,type ManagementRole} from "@/domain/management-role";
import type {Locale} from "@/domain/schemas";
const examples={
  ru:{project:["Прогноз контрольной точки позже базового срока","Согласовать восстановление срока с владельцем","Обновлённый план и проверяемый следующий шаг"],program:["Передача между двумя проектами заблокирована","Определить приоритет общего ресурса","Компоненты снова работают на общий результат"],delivery:["Обязательство поставки заблокировано","Снять блокер и перепроверить прогноз","Обещание связано с наблюдаемыми данными"],operations:["Метрика процесса вышла за допустимую границу","Назначить корректирующее действие","Отклонение проверяется на следующем обзоре"]},
  en:{project:["Milestone forecast is later than baseline","Agree schedule recovery with the owner","An updated plan and a verifiable next step"],program:["A handoff between two projects is blocked","Set the shared resource priority","Components work toward the shared outcome again"],delivery:["A delivery commitment is blocked","Resolve the blocker and review the forecast","The commitment is grounded in observed evidence"],operations:["A process metric exceeds its operating limit","Assign a corrective action","The deviation is checked at the next review"]},
};
export function RoleShowcase({locale}:{locale:Locale}) {
  const [role,setRole]=useState<ManagementRole>("project"),ru=locale==="ru",example=examples[locale][role];
  return <section className="section"><h2>{ru?"Одна система, четыре рабочих ракурса":"One system, four working lenses"}</h2><div className="button-row" role="group" aria-label={ru?"Профессиональные роли":"Management roles"}>{managementRoles.map(value=><button className="button" key={value} aria-pressed={role===value} onClick={()=>setRole(value)}>{roleLabels[locale][value]}</button>)}</div><div className="panel" aria-live="polite"><p className="eyebrow">{ru?"Пример рабочего сценария":"Illustrative workflow"}</p><h3>{roleQuestions[locale][role]}</h3><dl><dt>{ru?"Сигнал":"Signal"}</dt><dd>{example[0]}</dd><dt>{ru?"Решение":"Decision"}</dt><dd>{example[1]}</dd><dt>{ru?"Результат":"Result"}</dt><dd>{example[2]}</dd></dl></div></section>;
}
