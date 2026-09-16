import { describe, expect, it } from "vitest";
import { demoWorkspace } from "@/data/demo";
import { assertWorkspaceGraph, validateWorkspaceGraph } from "./workspace-integrity";

describe("workspace graph integrity", () => {
  it("accepts the bundled demo in both locales", () => {
    expect(validateWorkspaceGraph(demoWorkspace("ru"))).toEqual([]);
    expect(validateWorkspaceGraph(demoWorkspace("en"))).toEqual([]);
  });

  it("accepts an intentionally unscheduled project", () => {
    const workspace = demoWorkspace("en");
    workspace.projects[0] = { ...workspace.projects[0]!, targetDate: "" };
    expect(validateWorkspaceGraph(workspace)).toEqual([]);
  });

  it("rejects a structurally valid cross-project work reference", () => {
    const workspace = demoWorkspace("en");
    workspace.workItems[0] = { ...workspace.workItems[0]!, milestoneId: "M-1", projectId: "campaign" };
    const issues = validateWorkspaceGraph(workspace);
    expect(issues.some((issue) => issue.code === "cross-project-milestone")).toBe(true);
    expect(() => assertWorkspaceGraph(workspace)).toThrow(/Workspace integrity failed/);
  });

  it("rejects missing related records", () => {
    const workspace = demoWorkspace("en");
    workspace.documents[0] = { ...workspace.documents[0]!, relatedIds: ["missing-record"] };
    expect(validateWorkspaceGraph(workspace).some((issue) => issue.code === "missing-related-entity")).toBe(true);
  });

  it("rejects dependency cycles", () => {
    const workspace = demoWorkspace("en");
    workspace.dependencies.push({
      id: "DEP-CYCLE",
      projectId: "atlas",
      predecessorId: "PW-106",
      successorId: "PW-103",
      type: "FS",
      lag: 0,
      owner: "",
      dueDate: "",
      status: "open",
    });
    expect(validateWorkspaceGraph(workspace).some((issue) => issue.code === "dependency-cycle")).toBe(true);
  });

  it("rejects legacy mirrors that disagree with canonical fields", () => {
    const workspace = demoWorkspace("en");
    workspace.workItems[0] = { ...workspace.workItems[0]!, estimate: 999 };
    workspace.milestones[0] = { ...workspace.milestones[0]!, date: "2030-01-01" };
    const codes = validateWorkspaceGraph(workspace).map((issue) => issue.code);
    expect(codes).toContain("estimate-mirror");
    expect(codes).toContain("milestone-mirror");
  });
});
