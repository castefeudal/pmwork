import type {WorkItem} from "./schemas";
export function deliveryEvidence(items:WorkItem[],asOf:string) {
  const now=Date.parse(asOf);if(!Number.isFinite(now))throw Error("Invalid observation timestamp");
  let blockedMs=0,observedItems=0,reworkCount=0;
  for(const item of items) {
    if(item.blockedIntervals?.length)observedItems++;
    for(const interval of item.blockedIntervals??[]) {
      const from=Date.parse(interval.from),to=interval.to?Math.min(now,Date.parse(interval.to)):now;
      if(from<=now)blockedMs+=Math.max(0,to-from);
    }
    reworkCount+=(item.reworkEvidence??[]).filter(entry=>Date.parse(entry.at)<=now).length;
  }
  return {blockedHours:observedItems?blockedMs/3600000:null,observedItems,unobservedItems:items.length-observedItems,reworkCount};
}
