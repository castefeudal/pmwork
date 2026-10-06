export type Recurrence="once"|"daily"|"weekly"|"monthly";
export function nextOccurrence(day:string,cadence:Recurrence,anchorDay?:number):string {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day)throw Error("Invalid schedule date");
  if(cadence==="once")return day;
  const date=new Date(day+"T00:00:00Z");
  if(cadence==="monthly") {
    const desired=anchorDay??date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+1);
    const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(desired,last));
  } else date.setUTCDate(date.getUTCDate()+(cadence==="weekly"?7:1));
  return date.toISOString().slice(0,10);
}
