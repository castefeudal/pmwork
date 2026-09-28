import { expect, it } from "vitest";
import { demoWorkspace } from "@/data/demo";
import { projectCalendarEvents } from "./calendar";

it("uses only real project start, due, forecast and review dates", () => {
  const workspace = demoWorkspace("en");
  const work = workspace.workItems.find(x => x.projectId === "atlas")!;
  work.startDate = "2026-10-02";
  work.dueDate = "2026-10-04";
  const events = projectCalendarEvents(workspace, "atlas", "en");
  expect(events).toContainEqual(expect.objectContaining({ id: `${work.id}:start`, date: "2026-10-02", detail: "Work start" }));
  expect(events).toContainEqual(expect.objectContaining({ id: `${work.id}:due`, date: "2026-10-04", detail: "Work deadline" }));
  expect(events.every(x => x.date.length === 10 && x.date.includes("-") )).toBe(true);
  work.dueDate = "2026-02-30";
  expect(projectCalendarEvents(workspace, "atlas", "en").some(event => event.id === `${work.id}:due`)).toBe(false);
  expect(projectCalendarEvents(workspace, "missing", "en")).toEqual([]);
});
