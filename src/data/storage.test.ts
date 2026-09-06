import { describe, expect, it } from "vitest";
import { workspaceSchema } from "@/domain/schemas";
import { demoWorkspace, localizeBundledDemo } from "./demo";
import { migrateWorkspace } from "./storage";
describe("workspace data", () => {
  it("validates linked demo data in both locales", () => {
    for (const l of ["ru", "en"] as const) {
      const w = workspaceSchema.parse(demoWorkspace(l));
      expect(w.projects).toHaveLength(3);
      expect(
        w.workItems.every((x) => w.projects.some((p) => p.id === x.projectId)),
      ).toBe(true);
      expect(w.schemaVersion).toBe(6);
    }
  });
  it("round trips JSON with persisted closure", () => {
    const w = demoWorkspace("ru");
    expect(workspaceSchema.parse(JSON.parse(JSON.stringify(w)))).toEqual(w);
    expect(w.closureRecords[0]?.benefitsOwner).toBeTruthy();
  });
  it("migrates v1, v2 and v3 workspaces without losing core records", () => {
    for (const version of [1, 2, 3]) {
      const current = demoWorkspace("en"),
        legacy = { ...current, schemaVersion: version };
      delete (legacy as Record<string, unknown>).closureRecords;
      if (version === 1)
        for (const key of [
          "objectives",
          "assumptions",
          "dependencies",
          "iterations",
          "teamMembers",
          "capacityAllocations",
          "changes",
          "vendors",
          "meetings",
          "statusReports",
          "lessons",
          "communications",
          "qualityGates",
          "activities",
          "projectSettings",
        ])
          delete (legacy as Record<string, unknown>)[key];
      const migrated = migrateWorkspace(legacy);
      expect(migrated.schemaVersion).toBe(6);
      expect(migrated.projects).toHaveLength(3);
      expect(migrated.closureRecords).toEqual([]);
    }
  });
  it("localizes untouched demo values and preserves edited text", () => {
    const ru = demoWorkspace("ru"),
      edited = {
        ...ru,
        projects: ru.projects.map((project) =>
          project.id === "atlas"
            ? { ...project, objective: "Моя неизменяемая цель" }
            : project,
        ),
      };
    const en = localizeBundledDemo(edited, "en");
    expect(en.projects.find((project) => project.id === "atlas")?.name).toBe(
      "MARKOVMADE Digital Product Launch",
    );
    expect(
      en.projects.find((project) => project.id === "atlas")?.objective,
    ).toBe("Моя неизменяемая цель");
  });
});

it('renames only the original explicitly labelled demo, retaining IDs and user titles',()=>{
 const w=demoWorkspace('en');w.projects[0].name='Atlas Digital Product Launch';
 const renamed=migrateWorkspace(w);expect(renamed.projects[0].name).toBe('MARKOVMADE Digital Product Launch');expect(renamed.projects[0].id).toBe('atlas');
 w.projects[0].name='Atlas customer delivery';expect(migrateWorkspace(w).projects[0].name).toBe('Atlas customer delivery');
 w.projects[0].name='Atlas Digital Product Launch';w.projects[0].demo=false;expect(migrateWorkspace(w).projects[0].name).toBe('Atlas Digital Product Launch');
});
