// @vitest-environment jsdom
import {afterEach,describe,it,expect,vi} from "vitest";
import {demoWorkspace} from "./demo";
import {loadWorkspace,saveWorkspace,listSnapshots,restoreSnapshot} from "./storage";
afterEach(()=>{localStorage.clear();vi.unstubAllGlobals();});
describe("storage recovery",()=>{
  it("rejects corrupt data and leaves its raw bytes untouched",async()=>{
    vi.stubGlobal("indexedDB",undefined);localStorage.setItem("pmwork:workspace:v3","{broken");
    await expect(loadWorkspace()).rejects.toThrow();
    expect(localStorage.getItem("pmwork:workspace:v3")).toBe("{broken");
  });
  it("saves through a corrupt snapshot index and loads the local envelope",async()=>{
    vi.stubGlobal("indexedDB",undefined);localStorage.setItem("pmwork:snapshots:v3","broken");
    const w=demoWorkspace("en");await saveWorkspace(w);
    expect(await loadWorkspace()).toEqual(w);
  });
  it("uses fallback data when IndexedDB has no record",async()=>{
    const w=demoWorkspace("en");localStorage.setItem("pmwork:workspace:v3",JSON.stringify(w));
    vi.stubGlobal("indexedDB",{open:()=>{const req:Record<string,unknown>={};queueMicrotask(()=>{req.result={close:()=>{},transaction:()=>({objectStore:()=>({get:()=>{const read:Record<string,unknown>={};queueMicrotask(()=>{(read.onsuccess as ()=>void)();});return read;}})})};(req.onsuccess as ()=>void)();});return req;}});
    expect(await loadWorkspace()).toEqual(w);
  });
  it("retains a forced snapshot before same-day replacement",async()=>{
    vi.stubGlobal("indexedDB",undefined);const w=demoWorkspace("en");await saveWorkspace(w);w.name="Before replacement";await saveWorkspace(w,true);
    const snapshots=JSON.parse(localStorage.getItem("pmwork:snapshots:v3")!);expect(snapshots[0].workspace.name).toBe("Before replacement");
  });
});

it("lists and restores healthy local snapshots when the other store is unavailable",async()=>{
 vi.stubGlobal("indexedDB",undefined);const w=demoWorkspace("en");await saveWorkspace(w);
 const snapshots=await listSnapshots();expect(snapshots).toHaveLength(1);
 expect(await restoreSnapshot(snapshots[0].key)).toEqual(w);
 localStorage.setItem("pmwork:snapshots:v3","{bad");expect(await listSnapshots()).toEqual([]);
});
