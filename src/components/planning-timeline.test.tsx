// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PlanningTimeline } from "./planning-timeline";
import { demoWorkspace } from "@/data/demo";

afterEach(cleanup);

it("renders milestones when a project has no scheduled work items", () => {
  const workspace = demoWorkspace("en");
  workspace.workItems = workspace.workItems.filter(item => item.projectId !== "atlas");
  const project = workspace.projects.find(item => item.id === "atlas")!;
  const { container } = render(
    <PlanningTimeline
      workspace={workspace}
      project={project}
      locale="en"
      onEdit={vi.fn()}
      onCreate={vi.fn()}
    />
  );
  expect(container.querySelector(".date-timeline")).not.toBeNull();
  expect(container.querySelectorAll(".milestone-marker").length).toBeGreaterThan(0);
  expect(screen.queryByText("No scheduled work or milestones")).toBeNull();
});

it("shows the actual empty state when neither tasks nor milestones are scheduled", () => {
  const workspace = demoWorkspace("en");
  workspace.workItems = workspace.workItems.filter(item => item.projectId !== "atlas");
  workspace.milestones = workspace.milestones.filter(item => item.projectId !== "atlas");
  const project = workspace.projects.find(item => item.id === "atlas")!;
  const { container } = render(
    <PlanningTimeline workspace={workspace} project={project} locale="en" onEdit={vi.fn()} onCreate={vi.fn()} />
  );
  expect(container.querySelector(".date-timeline")).toBeNull();
  expect(screen.getByText("No scheduled work or milestones")).toBeTruthy();
});
