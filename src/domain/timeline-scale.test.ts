import { describe, expect, it } from "vitest";
import { timelineTicks } from "./timeline-scale";

describe("timeline calendar scale", () => {
  it("aligns weeks to Monday across a year boundary", () => {
    const start = Date.parse("2025-12-31");
    const ticks = timelineTicks(start, Date.parse("2026-01-31"), "week", "en", 1200);
    expect(ticks[0].label).toBe("Jan 5");
    expect(ticks.every(tick => new Date(Number(tick.key.slice(4))).getUTCDay() === 1)).toBe(true);
  });
  it("bounds all scales for a century-long plan without changing the range", () => {
    for (const unit of ["day", "week", "month"] as const) {
      const ticks = timelineTicks(Date.parse("2000-01-01"), Date.parse("2100-01-01"), unit, "ru", 920);
      expect(ticks.length).toBeGreaterThan(0);
      expect(ticks.length).toBeLessThanOrEqual(14);
      expect(ticks.every(tick => Number.isFinite(tick.pos) && tick.pos >= 0 && tick.pos <= 100)).toBe(true);
      expect(ticks.every((tick, index) => !index || tick.pos > ticks[index - 1].pos)).toBe(true);
    }
  });
  it("retains daily precision when the selected scale has enough space", () => {
    const ticks = timelineTicks(Date.parse("2024-02-28"), Date.parse("2024-03-01"), "day", "en", 920);
    expect(ticks.map(tick => tick.label)).toEqual(["Feb 28", "Feb 29", "Mar 1"]);
  });
  it("reserves room for month and year labels on multi-year plans", () => {
    const width = 920;
    const ticks = timelineTicks(Date.parse("2000-01-01"), Date.parse("2100-01-01"), "month", "en", width);
    for (let index = 1; index < ticks.length; index++) {
      expect((ticks[index].pos - ticks[index - 1].pos) * width / 100).toBeGreaterThanOrEqual(120);
    }
  });
  it("rejects missing or inverted ranges", () => {
    expect(timelineTicks(Infinity, Infinity, "day", "en", 920)).toEqual([]);
    expect(timelineTicks(2, 1, "month", "ru", 920)).toEqual([]);
  });
});
