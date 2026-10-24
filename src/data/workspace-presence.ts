import { DB, STORE, LOCAL_KEY, LEGACY_LOCAL_KEYS, LOCAL_SNAPSHOTS } from "./storage-keys";

/** Presence only: all existing, corrupt or unreadable data uses the full recovery path. */
export async function hasWorkspaceData(): Promise<boolean> {
  try {
    if ([LOCAL_KEY, ...LEGACY_LOCAL_KEYS, LOCAL_SNAPSHOTS].some(key => localStorage.getItem(key) !== null)) return true;
  } catch { return true; }
  if (typeof indexedDB === "undefined") return true;
  return new Promise(resolve => {
    let settled = false, absent = false;
    const finish = (present: boolean) => {
      if (settled) return;
      settled = true; clearTimeout(timer); resolve(present);
    };
    const timer = setTimeout(() => finish(true), 1800);
    let request: IDBOpenDBRequest;
    try { request = indexedDB.open(DB); } catch { finish(true); return; }
    request.onupgradeneeded = () => {
      // A presence check must not create a version-1 database without stores.
      absent = true; request.transaction?.abort();
    };
    request.onerror = () => finish(!absent);
    request.onblocked = () => finish(true);
    request.onsuccess = () => {
      const db = request.result;
      if (settled || !db.objectStoreNames.contains(STORE)) { db.close(); finish(true); return; }
      try {
        const tx = db.transaction(STORE, "readonly");
        const count = tx.objectStore(STORE).count();
        let present = true;
        count.onsuccess = () => { present = count.result > 0; };
        tx.oncomplete = () => { db.close(); finish(present); };
        tx.onerror = tx.onabort = () => { db.close(); finish(true); };
      } catch { db.close(); finish(true); }
    };
  });
}
