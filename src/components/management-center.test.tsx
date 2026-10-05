// @vitest-environment jsdom
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import {afterEach,expect,it,vi} from "vitest";
import {ManagementCenter} from "./management-center";
import {demoWorkspace,emptyWorkspace} from "@/data/demo";
import {operationSchema,programSchema} from "@/domain/management-entities";
afterEach(cleanup);

it("records control evidence on an ongoing service without creating a project",()=>{
  const workspace=emptyWorkspace("en");workspace.operations=[operationSchema.parse({id:"service",name:"Customer support",purpose:"Restore service",controls:[{id:"control",name:"Queue review",dueDate:"2020-01-01"}]})];
  const onChange=vi.fn();render(<ManagementCenter workspace={workspace} locale="en" kind="operations" onChange={onChange}/>);
  fireEvent.click(screen.getByRole("button",{name:"Record completion"}));
  expect(onChange).toHaveBeenCalledOnce();
  const next=onChange.mock.calls[0][0];expect(next.projects).toEqual([]);expect(next.operations[0].controls[0].completedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);expect(next.operations[0].history).toHaveLength(1);
});
it("links shared project records to a program rather than copying work",()=>{
  const workspace=demoWorkspace("en");workspace.programs=[programSchema.parse({id:"program",name:"Service transformation",outcome:"Reduce waiting"})];
  const onChange=vi.fn();render(<ManagementCenter workspace={workspace} locale="en" kind="program" onChange={onChange}/>);
  fireEvent.click(screen.getByRole("checkbox",{name:workspace.projects[0].name}));
  const next=onChange.mock.calls[0][0];expect(next.programs[0].projectIds).toEqual([workspace.projects[0].id]);expect(next.projects).toEqual(workspace.projects);expect(next.workItems).toEqual(workspace.workItems);
});

it("bounds long benefit registers and navigates pages without truncating stored evidence",()=>{
 const workspace=emptyWorkspace("en");workspace.programs=[programSchema.parse({id:"long",name:"Long program",outcome:"Reduce waiting",benefits:Array.from({length:1000},(_,i)=>({id:`b${i}`,name:`Benefit ${i}`}))})];
 const onChange=vi.fn();const {container}=render(<ManagementCenter workspace={workspace} locale="en" kind="program" onChange={onChange}/>);
 expect(container.querySelectorAll('[id^="evidence-long-b"]')).toHaveLength(10);
 fireEvent.click(screen.getByRole("navigation",{name:"Benefit pages"}).querySelectorAll("button")[1]);
 expect(container.querySelector("#evidence-long-b10")).not.toBeNull();expect(container.querySelector("#evidence-long-b0")).toBeNull();expect(workspace.programs[0].benefits).toHaveLength(1000);expect(onChange).not.toHaveBeenCalled();
});

it("reveals an archived operations review through its native evidence URL",()=>{
 const workspace=emptyWorkspace("en");workspace.operations=[operationSchema.parse({id:"archive",name:"Review archive",purpose:"Restore service",reviews:Array.from({length:25},(_,i)=>({id:`review${i}`,at:"2026-10-06",cadence:"daily",findings:`Review finding ${i}`}))})];
 window.history.replaceState(null,"","/?context=archive&evidence=review0");
 try{const {container}=render(<ManagementCenter workspace={workspace} locale="en" kind="operations" onChange={vi.fn()}/>);expect(container.querySelector("#evidence-archive-review0")).not.toBeNull();expect(container.querySelectorAll('[id^="evidence-archive-review"]')).toHaveLength(5);expect(workspace.operations[0].reviews).toHaveLength(25);}finally{window.history.replaceState(null,"","/");}
});
