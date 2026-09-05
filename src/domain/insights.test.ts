import { describe, expect, it } from "vitest";
import { demoWorkspace } from "@/data/demo";
import {
  flowMetrics,
  portfolioSummary,
  projectActions,
  projectCompleteness,
} from "./insights";
describe("deterministic project control", () => {
  const workspace = demoWorkspace("ru");
  it("ranks blocked work and overdue issues as critical", () => {
    const actions = projectActions(workspace, "atlas", "ru");
    expect(actions[0]?.severity).toBe("critical");
    expect(actions.some((x) => x.id === "block-PW-103")).toBe(true);
  });
  it("calculates management completeness from observable records", () => {
    const result = projectCompleteness(workspace, "atlas");
    expect(result.score).toBeGreaterThan(80);
    expect(result.gaps).not.toContain("outcome");
  });
  it("summarizes portfolio without hidden state", () => {
    const summary = portfolioSummary(workspace, workspace.projects[0]!);
    expect(summary.open).toBeGreaterThan(0);
    expect(summary.forecast).toBe(149500);
  });
  it("derives flow metrics", () => {
    const result = flowMetrics(
      workspace.workItems.filter((x) => x.projectId === "atlas"),
    );
    expect(result.wip).toBe(2);
    expect(result.blocked).toBe(1);
  });
});
