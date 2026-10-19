// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { OperationMetricTrend } from "./operation-metric-trend";
const base = {id:"response", name:"Response time",unit:"h",target:4,direction:"at-most" as const,owner:""};
afterEach(cleanup);
it("does not draw a trend from one observation or future evidence", () => {
  render(<OperationMetricTrend metric={{...base,observations:[{at:"2026-10-01",value:3},{at:"2026-11-01",value:9}]}} locale="en" asOf="2026-10-20"/>);
  expect(screen.queryByRole("img")).toBeNull();
  expect(screen.getByText("3 h · 2026-10-01")).toBeTruthy();
  expect(screen.queryByText(/9 h/)).toBeNull();
});
it("places observations according to their actual dates", () => {
  const {container}=render(<OperationMetricTrend metric={{...base,observations:[{at:"2026-10-11",value:5},{at:"2026-10-01",value:3},{at:"2026-10-02",value:4}]}} locale="en" asOf="2026-10-20"/>);
  expect(screen.getByRole("img").getAttribute("aria-label")).toContain("2026-10-01: 3 h; 2026-10-02: 4 h; 2026-10-11: 5 h");
  const xs=Array.from(container.querySelectorAll("circle")).map(el=>Number(el.getAttribute("cx")));
  expect(xs[1]-xs[0]).toBeCloseTo((xs[2]-xs[0])/10);
});
