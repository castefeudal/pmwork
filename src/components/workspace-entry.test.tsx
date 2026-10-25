// @vitest-environment jsdom
import {cleanup,render,screen,waitFor} from "@testing-library/react";
import {renderToString} from "react-dom/server";
import {afterEach,expect,it,vi} from "vitest";
vi.mock("@/data/workspace-presence",()=>({hasWorkspaceData:vi.fn()}));
vi.mock("./workspace-app",()=>({WorkspaceApp:()=> <main>Validated runtime</main>}));
import {hasWorkspaceData} from "@/data/workspace-presence";
import {WorkspaceEntry} from "./workspace-entry";
afterEach(()=>{cleanup();vi.clearAllMocks();});
it("renders meaningful entry HTML without accessing browser storage on the server",()=>{
  const html=renderToString(<WorkspaceEntry locale="en"/>);
  expect(html).toContain("Create a project or open the example");
  expect(html).toContain('aria-busy="true"');
  expect(html).toContain('disabled=""');
  expect(hasWorkspaceData).not.toHaveBeenCalled();
});
it("enables creation only after absence is confirmed",async()=>{
  let finish!:(value:boolean)=>void;
  vi.mocked(hasWorkspaceData).mockReturnValue(new Promise(resolve=>{finish=resolve;}));
  render(<WorkspaceEntry locale="en"/>);
  const group=screen.getByRole("group",{name:"Getting started"}) as HTMLFieldSetElement;
  expect(group.disabled).toBe(true);
  finish(false);
  await waitFor(()=>expect(group.disabled).toBe(false));
  expect(screen.getByRole("main").getAttribute("aria-busy")).toBe("false");
});
it("delegates an unexpected storage error to the validated recovery runtime",async()=>{
  vi.mocked(hasWorkspaceData).mockRejectedValue(Error("Storage denied"));
  render(<WorkspaceEntry locale="en"/>);
  expect(await screen.findByText("Validated runtime")).toBeTruthy();
});
