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

  it("uses only stored start evidence for cycle time and WIP aging", () => {
    const base = workspace.workItems.filter((x) => x.projectId === "atlas");
    const items = base.map((item, index) => {
      if (index === 0)
        return {
          ...item,
          status: "done" as const,
          done: true,
          createdAt: "2026-08-20T00:00:00.000Z",
          startedAt: "2026-09-01T00:00:00.000Z",
          completedAt: "2026-09-03T00:00:00.000Z",
          statusHistory: [
            { at: "2026-09-01T00:00:00.000Z", from: "ready" as const, to: "in-progress" as const },
            { at: "2026-09-03T00:00:00.000Z", from: "in-progress" as const, to: "done" as const },
          ],
        };
      if (index === 1)
        return {
          ...item,
          status: "in-progress" as const,
          done: false,
          startedAt: "2026-09-02T00:00:00.000Z",
          statusHistory: [
            { at: "2026-09-02T00:00:00.000Z", from: "ready" as const, to: "in-progress" as const },
          ],
        };
      return item;
    });
    const result = flowMetrics(items, "2026-09-05T00:00:00.000Z");
    expect(result.cycleSampleSize).toBe(1);
    expect(result.medianCycleDays).toBe(2);
    expect(result.cycleTimeDays).toBe(2);
    expect(result.cycleTimeReason).toBeNull();
    expect(result.p80CycleDays).toBeNull();
    expect(result.agingWip.some((entry) => entry.ageDays === 3)).toBe(true);
    expect(result.agingWipUnknown).toBeGreaterThanOrEqual(0);
  });

  it("does not publish cycle-time percentiles below the minimum evidence sample", () => {
    const seed = workspace.workItems[0]!;
    const items = Array.from({ length: 9 }, (_, index) => ({
      ...seed,
      id: `cycle-${index}`,
      status: "done" as const,
      done: true,
      createdAt: "2026-08-01T00:00:00.000Z",
      startedAt: `2026-08-${String(index + 2).padStart(2, "0")}T00:00:00.000Z`,
      completedAt: `2026-08-${String(index + 3).padStart(2, "0")}T00:00:00.000Z`,
    }));
    const result = flowMetrics(items, "2026-09-05T00:00:00.000Z");
    expect(result.cycleSampleSize).toBe(9);
    expect(result.p80CycleDays).toBeNull();
    expect(result.p90CycleDays).toBeNull();
  });
});
