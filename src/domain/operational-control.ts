import type {Operation} from "./management-entities";
/** Advance the scheduled occurrence, preserving missed dates and completion evidence. */
export function completeControl(control:Operation["controls"][number],at:string):Operation["controls"][number] {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(at)||!Number.isFinite(Date.parse(at))||new Date(at).toISOString().slice(0,10)!==at)throw Error("Invalid completion date");
  if(control.completedAt)return control;
  const completions=[...control.completions,{dueDate:control.dueDate,completedAt:at}];
  if(control.recurrence==="once")return {...control,completedAt:at,completions};
  const date=new Date(control.dueDate+"T00:00:00Z");
  if(control.recurrence==="monthly") {
    const day=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+1);
    const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));
  } else date.setUTCDate(date.getUTCDate()+(control.recurrence==="weekly"?7:1));
  return {...control,dueDate:date.toISOString().slice(0,10),completedAt:undefined,completions};
}
