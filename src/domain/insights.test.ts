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

  it("calculates management coverage from observable records", () => {
    const result = projectCompleteness(workspace, "atlas");
    expect(result.score).toBeGreaterThan(80);
    expect(result.gaps).not.toContain("outcome");
  });

  it("does not treat empty work collections as ownership or acceptance coverage", () => {
    const empty = demoWorkspace("en");
    empty.workItems = empty.workItems.filter((item) => item.projectId !== "atlas");
    const result = projectCompleteness(empty, "atlas");
    expect(result.gaps).toContain("work breakdown");
    expect(result.gaps).toContain("work ownership");
    expect(result.gaps).toContain("acceptance criteria");
  });

  it("summarizes portfolio without hidden state", () => {
    const summary = portfolioSummary(workspace, workspace.projects[0]!);
    expect(summary.open).toBeGreaterThan(0);
    expect(summary.forecast).toBe(149500);
  });

  it("derives windowed throughput and calls created-to-completed lead time", () => {
    const items = workspace.workItems
      .filter((x) => x.projectId === "atlas")
      .map((item, index) =>
        index === 0
          ? {
              ...item,
              status: "done" as const,
              done: true,
              createdAt: "2026-08-20T00:00:00.000Z",
              completedAt: "2026-09-03T00:00:00.000Z",
            }
          : item,
      );
    const result = flowMetrics(items, "2026-09-05T00:00:00.000Z");
    expect(result.wip).toBe(2);
    expect(result.blocked).toBe(1);
    expect(result.completed7).toBeGreaterThanOrEqual(1);
    expect(result.throughput7).toBeGreaterThan(0);
    expect(result.averageLeadDays).toBe(14);
    expect(result.cycleTimeDays).toBeNull();
    expect(result.cycleTimeReason).toMatch(/startedAt/);
  });
});
