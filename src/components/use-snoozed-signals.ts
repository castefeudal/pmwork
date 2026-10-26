"use client";
import {useSyncExternalStore} from "react";
import type {ActionSignal} from "@/domain/action-signals";
import {localDay} from "@/domain/work-views";

type Snooze = { projectId:string; id:string; fingerprint:string; day:string };
const key="pmwork:today-snoozes:v1";
let sessionValue="[]";
export function signalFingerprint(signal:ActionSignal) {
  return JSON.stringify([signal.severity,signal.category,signal.dueDate,signal.source,signal.affectedIds,signal.why.match(/\d+(?:[.,]\d+)?/g)??[],signal.evidence.missing.length]);
}
let storageUnavailable=false;
function snapshot() { if(storageUnavailable)return sessionValue;try{return localStorage.getItem(key)??"[]";}catch{return sessionValue;} }
function subscribe(notify:()=>void) {
  const storage=(event:StorageEvent)=>{if(event.key===key||event.key===null)notify();};
  window.addEventListener(key,notify);window.addEventListener("storage",storage);
  return ()=>{window.removeEventListener(key,notify);window.removeEventListener("storage",storage);};
}
function parse(raw:string):Snooze[] {
  try { const value=JSON.parse(raw); return Array.isArray(value)?value.filter((x):x is Snooze=>x && typeof x.projectId==="string" && typeof x.id==="string" && typeof x.fingerprint==="string" && typeof x.day==="string").slice(-500):[]; } catch { return []; }
}
export function useSnoozedSignals(projectId:string,signals:ActionSignal[]) {
  const raw=useSyncExternalStore(subscribe,snapshot,()=>"[]"),saved=parse(raw),day=localDay();
  const hiddenKeys=new Set(saved.filter(x=>x.projectId===projectId && x.day===day).map(x=>JSON.stringify([x.id,x.fingerprint])));
  const hidden=signals.filter(signal=>hiddenKeys.has(JSON.stringify([signal.id,signalFingerprint(signal)])));
  const hiddenIds=new Set(hidden.map(signal=>signal.id));
  const save=(next:Snooze[])=>{sessionValue=JSON.stringify(next);try{localStorage.setItem(key,sessionValue);storageUnavailable=false;}catch{storageUnavailable=true;}window.dispatchEvent(new Event(key));};
  return {visible:signals.filter(signal=>!hiddenIds.has(signal.id)),hiddenCount:hidden.length,
    snooze:(signal:ActionSignal)=>save([...saved.filter(x=>x.day===day && !(x.projectId===projectId && x.id===signal.id)),{projectId,id:signal.id,fingerprint:signalFingerprint(signal),day}].slice(-500)),
    restore:()=>save(saved.filter(x=>x.projectId!==projectId))};
}
