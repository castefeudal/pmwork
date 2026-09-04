import { workspaceSchema,type Workspace } from "@/domain/schemas";

const DB="pmwork-local", STORE="workspace", KEY="primary", SNAPSHOT_INDEX="snapshot:index";
const emptyV2={objectives:[],assumptions:[],dependencies:[],iterations:[],teamMembers:[],capacityAllocations:[],changes:[],vendors:[],meetings:[],statusReports:[],lessons:[],communications:[],qualityGates:[],activities:[],projectSettings:[]};

function open(){return new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open(DB,2);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(new Error("Storage unavailable"));});}

export function migrateWorkspace(value:unknown):Workspace{
  if(!value||typeof value!=="object")throw new Error("Invalid workspace");
  const record=value as Record<string,unknown>;
  if(record.schemaVersion===1)return workspaceSchema.parse({...emptyV2,...record,schemaVersion:2});
  return workspaceSchema.parse(value);
}

export async function loadWorkspace(){const db=await open();return new Promise<Workspace|null>((resolve,reject)=>{const req=db.transaction(STORE,"readonly").objectStore(STORE).get(KEY);req.onsuccess=()=>{if(!req.result){resolve(null);return}try{resolve(migrateWorkspace(req.result));}catch{reject(new Error("Stored data is corrupted"));}};req.onerror=()=>reject(new Error("Storage unavailable"));});}

export async function saveWorkspace(workspace:Workspace){
  const valid=workspaceSchema.parse(workspace);const db=await open();
  return new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);store.put(valid,KEY);
    const indexReq=store.get(SNAPSHOT_INDEX);indexReq.onsuccess=()=>{const previous=Array.isArray(indexReq.result)?indexReq.result as string[]:[];const last=previous[0];const lastDay=last?.split(":")[1]?.slice(0,10);const today=new Date().toISOString().slice(0,10);if(lastDay!==today){const snapshotKey=`snapshot:${new Date().toISOString()}`;store.put(valid,snapshotKey);const next=[snapshotKey,...previous].slice(0,5);store.put(next,SNAPSHOT_INDEX);previous.slice(5).forEach(key=>store.delete(key));}};
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error("Could not save workspace"));
  });
}

export async function listSnapshots(){const db=await open();return new Promise<{key:string;at:string}[]>((resolve,reject)=>{const store=db.transaction(STORE,"readonly").objectStore(STORE),req=store.get(SNAPSHOT_INDEX);req.onsuccess=()=>resolve((Array.isArray(req.result)?req.result:[]).map((key:string)=>({key,at:key.slice("snapshot:".length)})));req.onerror=()=>reject(new Error("Storage unavailable"));});}
export async function restoreSnapshot(key:string){if(!key.startsWith("snapshot:"))throw new Error("Invalid snapshot");const db=await open();return new Promise<Workspace>((resolve,reject)=>{const req=db.transaction(STORE,"readonly").objectStore(STORE).get(key);req.onsuccess=()=>{try{resolve(migrateWorkspace(req.result));}catch{reject(new Error("Snapshot is invalid"));}};req.onerror=()=>reject(new Error("Storage unavailable"));});}

export function exportWorkspace(workspace:Workspace){const blob=new Blob([JSON.stringify({product:"PMWORK",exportedAt:new Date().toISOString(),workspace},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`pmwork-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);}
export async function importWorkspace(file:File){if(file.size>10_000_000)throw new Error("Backup is too large");const parsed=JSON.parse(await file.text()) as unknown;const payload=parsed&&typeof parsed==="object"&&"workspace" in parsed?(parsed as {workspace:unknown}).workspace:parsed;return migrateWorkspace(payload);}
