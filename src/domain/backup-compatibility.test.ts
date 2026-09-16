import { describe, expect, it } from "vitest";
import { demoWorkspace } from "@/data/demo";
import { assertNoUnknownBackupFields, findUnknownBackupFields } from "./backup-compatibility";
import { workspaceSchema } from "./schemas";

describe("backup compatibility", () => {
  it("detects fields that Zod would otherwise strip", () => {
    const raw = demoWorkspace("en") as unknown as Record<string, unknown>;
    raw.futureFeature = { enabled: true };
    const parsed = workspaceSchema.parse(raw);
    expect(findUnknownBackupFields(raw, parsed)).toContain("$.futureFeature");
    expect(() => assertNoUnknownBackupFields(raw, parsed)).toThrow(/cannot preserve/);
  });

  it("detects unknown nested fields", () => {
    const raw = demoWorkspace("en") as unknown as Record<string, unknown>;
    const projects = raw.projects as Array<Record<string, unknown>>;
    projects[0] = { ...projects[0], futureBudgetPolicy: "keep-me" };
    const parsed = workspaceSchema.parse(raw);
    expect(findUnknownBackupFields(raw, parsed)).toContain("$.projects[0].futureBudgetPolicy");
  });

  it("accepts a known current payload", () => {
    const raw = demoWorkspace("en");
    const parsed = workspaceSchema.parse(raw);
    expect(findUnknownBackupFields(raw, parsed)).toEqual([]);
  });
});
