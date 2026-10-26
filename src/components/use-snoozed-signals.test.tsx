// @vitest-environment jsdom
import {act,cleanup,renderHook} from "@testing-library/react";
import {afterEach,expect,it} from "vitest";
import {demoWorkspace} from "@/data/demo";
import {projectActions} from "@/domain/action-signals";
import {signalFingerprint,useSnoozedSignals} from "./use-snoozed-signals";
afterEach(()=>{cleanup();localStorage.clear();});
it("snoozes only an unchanged signal for its project and can restore it",()=>{
  const workspace=demoWorkspace("en"), signals=projectActions(workspace,"atlas","en"), signal=signals[0]!;
  const {result,rerender,unmount}=renderHook(({project,rows})=>useSnoozedSignals(project,rows),{initialProps:{project:"atlas",rows:signals}});
  act(()=>result.current.snooze(signal));
  expect(result.current.visible.some(row=>row.id===signal.id)).toBe(false);
  expect(result.current.hiddenCount).toBe(1);
  rerender({project:"other",rows:signals}); expect(result.current.hiddenCount).toBe(0);
  rerender({project:"atlas",rows:[{...signal,severity:signal.severity==="critical"?"medium":"critical"}]}); expect(result.current.hiddenCount).toBe(0);
  rerender({project:"atlas",rows:signals});expect(result.current.hiddenCount).toBe(1);
  unmount();
  const reopened=renderHook(()=>useSnoozedSignals("atlas",signals));expect(reopened.result.current.hiddenCount).toBe(1);
  act(()=>reopened.result.current.restore());expect(reopened.result.current.hiddenCount).toBe(0);
});
it("keeps a snooze across interface languages and ignores an expired day",()=>{
  const workspace=demoWorkspace("en"),en=projectActions(workspace,"atlas","en"),ru=projectActions(workspace,"atlas","ru");
  expect(signalFingerprint(en[0])).toBe(signalFingerprint(ru.find(row=>row.id===en[0].id)!));
  localStorage.setItem("pmwork:today-snoozes:v1",JSON.stringify([{projectId:"atlas",id:en[0].id,fingerprint:signalFingerprint(en[0]),day:"2000-01-01"}]));
  const {result}=renderHook(()=>useSnoozedSignals("atlas",en));
  expect(result.current.hiddenCount).toBe(0);
});
it("changes the fingerprint when the underlying record changes",()=>{
  const workspace=demoWorkspace("en"),signal=projectActions(workspace,"atlas","en").find(row=>row.source?.kind==="risk")!;
  const updated={...workspace,risks:workspace.risks.map(row=>row.id===signal.source?.id?{...row,description:row.description+" updated"}:row)};
  expect(signalFingerprint(signal,workspace)).not.toBe(signalFingerprint(signal,updated));
});
