import { z } from "zod";

const id = z.string().min(1);
const date = z.iso.date();
const history = z.array(z.object({ at: z.iso.datetime(), summary: z.string().min(1) })).default([]);
export const programSchema = z.object({
  id, name: z.string().min(2), currency:z.string().regex(/^[A-Z]{3}$/).optional(), owner: z.string().default(""), sponsor: z.string().default(""),
  outcome: z.string().min(2), projectIds: z.array(id).default([]),
  status:z.enum(["planned","active","on-hold","completed"]).default("active"),
  governanceCadence: z.string().default(""), strategicObjectives: z.array(z.string()).default([]),
  benefits: z.array(z.object({
    id, name: z.string().min(2), currency:z.string().regex(/^[A-Z]{3}$/).optional(), owner: z.string().default(""), unit: z.string().default(""),
    baseline: z.number().finite().optional(), target: z.number().finite().optional(), actual: z.number().finite().optional(),
    measurementPlan: z.string().default(""), measuredAt: date.optional(), reviewDate: date.optional(), projectIds: z.array(id).default([]),
  })).default([]),
  milestones: z.array(z.object({ id, name: z.string().min(2), currency:z.string().regex(/^[A-Z]{3}$/).optional(), owner: z.string().default(""), baseline: date.optional(), forecast: date.optional(), actual: date.optional() })).default([]),
  dependencies: z.array(z.object({ id, fromProjectId: id, toProjectId: id, description: z.string().min(2), owner: z.string().default(""), dueDate: date.optional(), status: z.enum(["open", "blocked", "resolved"]) })).default([]),
  resourceConflicts: z.array(z.object({ id, resource: z.string().min(1), projectIds: z.array(id), owner: z.string().default(""), resolution: z.string().default("") })).default([]),
  history,
});
export const operationSchema = z.object({
  id, name: z.string().min(2), currency:z.string().regex(/^[A-Z]{3}$/).optional(), purpose: z.string().min(2), owner: z.string().default(""),
  customer: z.string().default(""), scope: z.string().default(""), inputs: z.string().default(""), outputs: z.string().default(""),
  reviewCadence: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
  demand: z.number().nonnegative().finite().optional(), capacity: z.number().nonnegative().finite().optional(), demandUnit: z.string().default(""),
  metrics: z.array(z.object({
    id, name: z.string().min(2), currency:z.string().regex(/^[A-Z]{3}$/).optional(), unit: z.string().min(1), target: z.number().finite(), direction: z.enum(["at-least", "at-most"]),
    observations: z.array(z.object({ at: date, value: z.number().finite() })).default([]), owner: z.string().default(""),
  })).default([]),
  controls: z.array(z.object({ id, name: z.string().min(2), currency:z.string().regex(/^[A-Z]{3}$/).optional(), owner: z.string().default(""), dueDate: date, completedAt: date.optional(), runbook: z.string().default(""), recurrence:z.enum(["once","daily","weekly","monthly"]).default("once"), completions:z.array(z.object({dueDate:date,completedAt:date})).default([]),anchorDay:z.number().int().min(1).max(31).optional() })).default([]),
  incidents: z.array(z.object({ id, title: z.string().min(2), owner: z.string().default(""), openedAt: date, resolvedAt: date.optional(), recurring: z.boolean().default(false), correctiveAction: z.string().default("") })).default([]),
  improvements: z.array(z.object({ id, title: z.string().min(2), owner: z.string().default(""), status: z.enum(["open", "active", "done"]), expectedOutcome: z.string().default("") })).default([]),
  reviews: z.array(z.object({ id, at: date, cadence: z.enum(["daily", "weekly", "monthly"]), findings: z.string().min(2), decision: z.string().default(""), nextAction: z.string().default(""), owner: z.string().default(""),workItemId:id.optional(),decisionId:id.optional() })).default([]),
  history,
});
export type Program = z.infer<typeof programSchema>;
export type Operation = z.infer<typeof operationSchema>;
