import { expect, it } from "vitest";
import { demoWorkspace } from "@/data/demo";
import { projectCalendarIcs, projectCsv } from "./exports";

it("exports complete project work without allowing user text to become a spreadsheet formula", () => {
  const workspace = demoWorkspace("en");
  workspace.workItems[0]!.title = '=HYPERLINK("https://example.invalid","open")';
  const csv = projectCsv(workspace, "atlas", "work", "en");
  expect(csv).toContain("Original estimate,Current estimate,Actual effort");
  expect(csv).toContain(`'=HYPERLINK(""https://example.invalid"",""open"")`);
  expect(csv).toContain("\r\n");
});

it("exports only real dated project deadlines, milestones and risk reviews as escaped calendar events", () => {
  const workspace = demoWorkspace("en");
  const projectId = "atlas";
  workspace.workItems = workspace.workItems.filter(x => x.projectId === projectId).slice(0, 1).map(x => ({ ...x, dueDate: "2026-10-04" }));
  workspace.milestones = workspace.milestones.filter(x => x.projectId === projectId).slice(0, 1).map(x => ({ ...x, title: "Gate,\nreview; \\ approve", forecastDate: "2026-10-05" }));
  workspace.risks = workspace.risks.filter(x => x.projectId === projectId).slice(0, 1).map(x => ({ ...x, reviewDate: "2026-10-06" }));
  const ics = projectCalendarIcs(workspace, projectId, "en");
  expect(ics).toContain("BEGIN:VCALENDAR\r\nVERSION:2.0");
  expect(ics).toContain("DTSTART;VALUE=DATE:20261004");
  expect(ics).toContain("DTSTART;VALUE=DATE:20261005");
  expect(ics).toContain("DTSTART;VALUE=DATE:20261006");
  expect(ics).toContain("SUMMARY:Milestone: Gate\\,\\nreview\\; \\\\ approve");
  expect(ics).not.toContain("DTSTART;VALUE=DATE:NaN");
});

it("keeps CSV headers and calendar export valid for an empty project", () => {
  const workspace = demoWorkspace("ru");
  expect(projectCsv(workspace, "missing", "decisions", "ru")).toBe("\uFEFFID,Вопрос,Контекст,Альтернативы,Критерии,Решение,Обоснование,Владелец,Дата,Последствия,Условие пересмотра,Статус\r\n");
  expect(projectCalendarIcs(workspace, "missing", "ru")).toContain("END:VCALENDAR\r\n");
});
