"use client";
import {useState} from "react";
import {managementRoles,roleLabels,roleQuestions,type ManagementRole} from "@/domain/management-role";
import type {Locale} from "@/domain/schemas";
const examples={
  ru:{project:["Прогноз контрольной точки позже базового срока","Согласовать восстановление срока с владельцем","Обновить план и назначить следующий шаг"],program:["Передача между двумя проектами заблокирована","Определить приоритет общего ресурса","Согласовать работу компонентов вокруг общей цели"],delivery:["Обязательство поставки заблокировано","Снять блокер и перепроверить прогноз","Обновить обязательство по фактическим данным"],operations:["Метрика процесса вышла за допустимую границу","Назначить корректирующее действие","Проверить отклонение на следующем обзоре"]},
  en:{project:["Milestone forecast is later than baseline","Agree schedule recovery with the owner","Update the plan and assign a next step"],program:["A handoff between two projects is blocked","Set the shared resource priority","Agree how components will support the shared goal"],delivery:["A delivery commitment is blocked","Resolve the blocker and review the forecast","Update the commitment using observed data"],operations:["A process metric exceeds its operating limit","Assign a corrective action","Review the deviation at the next check"]},
};
export function RoleShowcase({locale}:{locale:Locale}) {
  const [role,setRole]=useState<ManagementRole>("project"),ru=locale==="ru",example=examples[locale][role];
  return <section className="section"><h2>{ru?"Примеры по типам работы":"Examples by work type"}</h2><div className="button-row" role="group" aria-label={ru?"Типы работы":"Work types"}>{managementRoles.map(value=><button className="button" key={value} aria-pressed={role===value} onClick={()=>setRole(value)}>{roleLabels[locale][value]}</button>)}</div><div className="panel" aria-live="polite"><p className="eyebrow">{ru?"Возможный сценарий":"Example scenario"}</p><h3>{roleQuestions[locale][role]}</h3><dl><dt>{ru?"Сигнал":"Signal"}</dt><dd>{example[0]}</dd><dt>{ru?"Действие":"Next step"}</dt><dd>{example[1]}</dd><dt>{ru?"Что проверить дальше":"What to check next"}</dt><dd>{example[2]}</dd></dl></div></section>;
}
