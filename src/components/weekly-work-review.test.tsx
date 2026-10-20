// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { demoWorkspace } from "@/data/demo";
import { WeeklyWorkReview } from "./weekly-work-review";

afterEach(()=>{cleanup();vi.useRealTimers();});
it("counts recorded completions and links only current project updates in the seven calendar days",()=>{
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
  const workspace=demoWorkspace("en"),project=workspace.projects[0],base=workspace.workItems[0];
  workspace.workItems=[
    {...base,id:"current",projectId:project.id,title:"Current evidence",updatedAt:"2026-10-21T09:00:00Z",status:"done",done:true,completedAt:"2026-10-20T09:00:00Z"},
    {...base,id:"old",projectId:project.id,title:"Old evidence",updatedAt:"2026-10-14T09:00:00Z",done:true,completedAt:undefined},
    {...base,id:"archived",projectId:project.id,title:"Archived evidence",updatedAt:"2026-10-21T09:00:00Z",archived:true},
    {...base,id:"other",projectId:workspace.projects[1].id,title:"Other project",updatedAt:"2026-10-21T09:00:00Z"},
  ];
  const onEdit=vi.fn();
  const {container}=render(<WeeklyWorkReview workspace={workspace} project={project} locale="en" onEdit={onEdit} onChange={vi.fn()} onCreate={vi.fn()} onView={vi.fn()} onProject={vi.fn()}/>);
  fireEvent.click(container.querySelector("summary")!);
  expect(screen.queryByRole("button",{name:"Old evidence"})).toBeNull();
  expect(screen.queryByText("Other project")).toBeNull();
  expect([...container.querySelectorAll("dd")].slice(0,2).map(node=>node.textContent)).toEqual(["1","1"]);
  fireEvent.click(screen.getByRole("button",{name:"Current evidence"}));
  expect(onEdit).toHaveBeenCalledWith("work","current");
});
