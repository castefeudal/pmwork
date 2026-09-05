import { workspaceSchema, type Workspace } from "@/domain/schemas";
const DB = "pmwork-local",
  STORE = "workspace",
  KEY = "primary",
  SNAPSHOT_INDEX = "snapshot:index",
  LOCAL_KEY = "pmwork:workspace:v3",
  LEGACY_LOCAL_KEYS = ["pmwork:workspace:v2"],
  LOCAL_SNAPSHOTS = "pmwork:snapshots:v3";
const emptyV3 = {
  objectives: [],
  assumptions: [],
  dependencies: [],
  iterations: [],
  teamMembers: [],
  capacityAllocations: [],
  changes: [],
  vendors: [],
  meetings: [],
  statusReports: [],
  lessons: [],
  communications: [],
  qualityGates: [],
  closureRecords: [],
  activities: [],
  projectSettings: [],
};
function local() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    let settled = false;
    const finish = (fn: () => void) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn();
      },
      timer = setTimeout(
        () => finish(() => reject(new Error("Storage timed out"))),
        1800,
      ),
      req = indexedDB.open(DB, 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE))
        req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => { if (settled) req.result.close(); else finish(() => resolve(req.result)); };
    req.onerror = () => finish(() => reject(new Error("Storage unavailable")));
    req.onblocked = () => finish(() => reject(new Error("Storage blocked")));
  });
}
export function migrateWorkspace(value: unknown): Workspace {
  if (!value || typeof value !== "object") throw new Error("Invalid workspace");
  const record = value as Record<string, unknown>;
  const migrated = record.schemaVersion === 1 || record.schemaVersion === 2 || record.schemaVersion === 3 || record.schemaVersion === 4
    ? workspaceSchema.parse({ ...emptyV3, ...record, schemaVersion: 5 })
    : workspaceSchema.parse(value);
  if (record.schemaVersion === 4 || record.schemaVersion === 5) return migrated;
  return { ...migrated, workItems: migrated.workItems.map(item => {
    const matches = migrated.teamMembers.filter(member => member.projectId === item.projectId && member.name === item.owner);
    return matches.length === 1 ? { ...item, ownerId: matches[0].id, ownerLabel: item.owner } : item;
  }) };
}
type Stored = { value: unknown; at: number };
function unpack(value: unknown): Stored {
  if (value && typeof value === "object" && "savedAt" in value && "workspace" in value) {
    const envelope = value as { savedAt: number; workspace: unknown };
    return { value: envelope.workspace, at: envelope.savedAt };
  }
  return { value, at: 0 };
}
export async function loadWorkspace() {
  const candidates: Stored[] = [];
  let corrupt = false;
  let readable = false;
  try {
    const storage = local();
    if (storage) {
      readable = true;
      const raw = storage.getItem(LOCAL_KEY) ?? LEGACY_LOCAL_KEYS.map(key => storage.getItem(key)).find(Boolean);
      if (raw) { try { candidates.push(unpack(JSON.parse(raw))); } catch { corrupt = true; } }
    }
  } catch { /* IndexedDB may still be usable. */ }
  try {
    const db = await open();
    const value = await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const timeout = setTimeout(() => { tx.abort(); reject(new Error("Storage read timed out")); }, 1800);
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => { clearTimeout(timeout); resolve(req.result); };
      req.onerror = () => { clearTimeout(timeout); reject(new Error("Storage unavailable")); };
      tx.oncomplete = () => db.close();
      tx.onabort = () => { db.close(); reject(new Error("Storage unavailable")); };
    });
    readable = true;
    if (value) candidates.push(unpack(value));
  } catch { /* Preserve and use a valid local mirror. */ }
  for (const candidate of candidates.sort((a, b) => b.at - a.at)) {
    try { return migrateWorkspace(candidate.value); } catch { corrupt = true; }
  }
  if (corrupt || !readable) throw new Error("Stored data requires recovery");
  return null;
}
export async function saveWorkspace(workspace: Workspace, forceSnapshot = false) {
  const valid = workspaceSchema.parse(workspace);
  const envelope = { savedAt: Date.now(), workspace: valid };
  let mirrored = false;
  try {
    const fallback = local();
    if (fallback) {
      fallback.setItem(LOCAL_KEY, JSON.stringify(envelope));
      mirrored = true;
      let snapshots: { at: string; workspace: Workspace }[] = [];
      try {
        const parsed = JSON.parse(fallback.getItem(LOCAL_SNAPSHOTS) ?? "[]");
        if (Array.isArray(parsed)) snapshots = parsed;
      } catch { /* A corrupt snapshot index must not prevent primary saving. */ }
      const now = new Date().toISOString();
      if (forceSnapshot || snapshots[0]?.at?.slice(0, 10) !== now.slice(0, 10))
        fallback.setItem(LOCAL_SNAPSHOTS, JSON.stringify([{ at: now, workspace: valid }, ...snapshots].slice(0, 5)));
    }
  } catch { /* Quota may allow IndexedDB even when localStorage is full. */ }
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite"), store = tx.objectStore(STORE);
      store.put(envelope, KEY);
      const indexReq = store.get(SNAPSHOT_INDEX);
      indexReq.onsuccess = () => {
        const previous: string[] = Array.isArray(indexReq.result) ? indexReq.result : [];
        const now = new Date().toISOString();
        if (forceSnapshot || previous[0]?.slice(9, 19) !== now.slice(0, 10)) {
          const key = `snapshot:${now}`;
          store.put(valid, key);
          store.put([key, ...previous].slice(0, 5), SNAPSHOT_INDEX);
          previous.slice(4).forEach(key => store.delete(key));
        }
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = tx.onabort = () => { db.close(); reject(new Error("Could not save workspace")); };
    });
  } catch { if (!mirrored) throw new Error("Could not save workspace"); }
}
export async function listSnapshots() {
  const snapshots: {key: string; at: string}[] = [];
  try {
    const parsed = JSON.parse(local()?.getItem(LOCAL_SNAPSHOTS) ?? "[]");
    if (Array.isArray(parsed)) for (const item of parsed) {
      if (item && typeof item.at === "string" && workspaceSchema.safeParse(item.workspace).success)
        snapshots.push({key:`local:${item.at}`, at:item.at});
    }
  } catch { /* The other store may contain healthy recovery points. */ }
  try {
    const db = await open();
    const keys = await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE,"readonly");
      const timer = setTimeout(() => { tx.abort(); reject(new Error("Storage timed out")); },1800);
      const req = tx.objectStore(STORE).get(SNAPSHOT_INDEX);
      req.onsuccess = () => { clearTimeout(timer); resolve(Array.isArray(req.result) ? req.result.filter((key:unknown) => typeof key === "string" && key.startsWith("snapshot:")) : []); };
      req.onerror = () => { clearTimeout(timer); reject(new Error("Storage unavailable")); };
      tx.oncomplete = () => db.close();
      tx.onabort = () => { clearTimeout(timer); db.close(); reject(new Error("Storage unavailable")); };
    });
    for (const key of keys) if (!snapshots.some(x => x.at === key.slice(9))) snapshots.push({key,at:key.slice(9)});
  } catch { /* Local mirror remains available. */ }
  return snapshots.sort((a,b) => b.at.localeCompare(a.at)).slice(0,5);
}
export async function restoreSnapshot(key: string) {
  if (key.startsWith("local:")) {
    const at = key.slice(6),
      snapshots = JSON.parse(local()?.getItem(LOCAL_SNAPSHOTS) ?? "[]") as {
        at: string;
        workspace: unknown;
      }[],
      snapshot = snapshots.find((x) => x.at === at);
    if (!snapshot) throw new Error("Snapshot is invalid");
    return migrateWorkspace(snapshot.workspace);
  }
  if (!key.startsWith("snapshot:")) throw new Error("Invalid snapshot");
  const db = await open();
  return new Promise<Workspace>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    tx.oncomplete = () => db.close();
    tx.onabort = () => { db.close(); reject(new Error("Storage unavailable")); };
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => {
      try {
        resolve(migrateWorkspace(req.result));
      } catch {
        reject(new Error("Snapshot is invalid"));
      }
    };
    req.onerror = () => reject(new Error("Storage unavailable"));
  });
}
export function exportWorkspace(workspace: Workspace) {
  const blob = new Blob(
    [
      JSON.stringify(
        { product: "PMWORK", exportedAt: new Date().toISOString(), workspace },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pmwork-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
export async function importWorkspace(file: File) {
  if (file.size > 10000000) throw new Error("Backup is too large");
  const parsed = JSON.parse(await file.text()) as unknown;
  const payload =
    parsed && typeof parsed === "object" && "workspace" in parsed
      ? (
          parsed as {
            workspace: unknown;
          }
        ).workspace
      : parsed;
  return migrateWorkspace(payload);
}
