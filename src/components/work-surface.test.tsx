// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoWorkspace } from "@/data/demo";
import { WorkSurface } from "./work-surface";
import type { ViewProps } from "./workspace-views";

afterEach(cleanup);
function setup() {
  const workspace=demoWorkspace("en");
  const props:ViewProps={workspace,project:workspace.projects[0],locale:"en",onChange:vi.fn(),onCreate:vi.fn(),onEdit:vi.fn(),onView:vi.fn(),onProject:vi.fn()};
  return props;
}
describe("work selection boundaries",()=>{
  it("clears selection when changing filters and returning to the original view",()=>{
    const props=setup();
    const view=render(<WorkSurface {...props}/>);
    fireEvent.click(screen.getByRole("checkbox",{name:"Select current page"}));
    expect(screen.getByRole("group",{name:"Selected work actions"})).toBeTruthy();
    fireEvent.click(screen.getByRole("button",{name:"Blocked"}));
    const next=vi.mocked(props.onChange).mock.calls.at(-1)![0];
    view.rerender(<WorkSurface {...props} workspace={next}/>);
    expect(screen.queryByRole("group",{name:"Selected work actions"})).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"All work"}));
    view.rerender(<WorkSurface {...props} workspace={vi.mocked(props.onChange).mock.calls.at(-1)![0]}/>);
    expect(screen.queryByRole("group",{name:"Selected work actions"})).toBeNull();
  });
  it("clears drafts and selection across project switches",()=>{
    const props=setup();
    const view=render(<WorkSurface {...props}/>);
    fireEvent.change(screen.getByLabelText("Task title"),{target:{value:"Private draft"}});
    fireEvent.click(screen.getByRole("checkbox",{name:"Select current page"}));
    view.rerender(<WorkSurface {...props} project={props.workspace.projects[1]}/>);
    expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("group",{name:"Selected work actions"})).toBeNull();
    expect(props.onChange).not.toHaveBeenCalled();
  });
  it("quick creates a real backlog task and opens its details",()=>{
    const props=setup();
    const view=render(<WorkSurface {...props}/>);
    fireEvent.change(screen.getByLabelText("Task title"),{target:{value:"  Prepare acceptance evidence  "}});
    fireEvent.submit(screen.getByLabelText("Task title").closest("form")!);
    const next=vi.mocked(props.onChange).mock.calls[0][0];
    const item=next.workItems.at(-1)!;
    expect(item).toMatchObject({title:"Prepare acceptance evidence",status:"backlog",projectId:props.project.id,done:false});
    expect(next.activities.length).toBeGreaterThan(props.workspace.activities.length);
    view.rerender(<WorkSurface {...props} workspace={next}/>);
    const result=screen.getByText("Task added.").closest("div")!;
    fireEvent.click(within(result).getByRole("button",{name:"Add details"}));
    expect(props.onEdit).toHaveBeenCalledWith("work",item.id);
  });
});
