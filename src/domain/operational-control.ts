import {nextOccurrence} from "./recurrence";
import type {Operation} from "./management-entities";
/** Advance the scheduled occurrence, preserving missed dates and completion evidence. */
export function completeControl(control:Operation["controls"][number],at:string):Operation["controls"][number] {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(at)||!Number.isFinite(Date.parse(at))||new Date(at).toISOString().slice(0,10)!==at)throw Error("Invalid completion date");
  if(control.completedAt)return control;
  const completions=[...control.completions,{dueDate:control.dueDate,completedAt:at}];
  if(control.recurrence==="once")return {...control,completedAt:at,completions};
  const anchorDay=control.anchorDay??Number(control.dueDate.slice(-2));
  return {...control,dueDate:nextOccurrence(control.dueDate,control.recurrence,anchorDay),completedAt:undefined,completions,anchorDay};
}
