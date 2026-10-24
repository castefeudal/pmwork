import {afterEach,expect,it,vi} from "vitest";
import {hasWorkspaceData} from "./workspace-presence";

afterEach(()=>vi.unstubAllGlobals());
for(const key of ["pmwork:workspace:v3","pmwork:workspace:v2","pmwork:snapshots:v3"]) {
  it(`delegates ${key} to full validation, including corrupt values`,async()=>{
    const open=vi.fn();
    vi.stubGlobal("localStorage",{getItem:(name:string)=>name===key?"{invalid":null});
    vi.stubGlobal("indexedDB",{open});
    expect(await hasWorkspaceData()).toBe(true);
    expect(open).not.toHaveBeenCalled();
  });
}
it("never treats inaccessible storage as an empty workspace",async()=>{
  vi.stubGlobal("localStorage",{getItem:()=>{throw Error("Storage denied");}});
  expect(await hasWorkspaceData()).toBe(true);
});
it("delegates unavailable IndexedDB to the existing fallback and recovery path",async()=>{
  vi.stubGlobal("localStorage",{getItem:()=>null});
  vi.stubGlobal("indexedDB",undefined);
  expect(await hasWorkspaceData()).toBe(true);
});
