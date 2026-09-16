import type { Workspace } from "./schemas";

export type WorkspaceIntegrityIssue = {
  code: string;
  path: string;
  message: string;
};

const parseDate = (value: string | undefined) => {
  if (!value) return null;
  const timestamp = Date.parse(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isFinite(timestamp) ? timestamp : null;
};

const entityId = (value: unknown) =>
  value && typeof value === "object" && "id" in value && typeof (value as { id?: unknown }).id === "string"
    ? (value as { id: string }).id
    : undefined;

export function validateWorkspaceGraph(workspace: Workspace): WorkspaceIntegrityIssue[] {
  const issues: WorkspaceIntegrityIssue[] = [];
  const add = (code: string, path: string, message: string) => issues.push({ code, path, message });

  const projectById = new Map(workspace.projects.map((project) => [project.id, project]));
  const workById = new Map(workspace.workItems.map((item) => [item.id, item]));
  const riskById = new Map(workspace.risks.map((item) => [item.id, item]));
  const objectiveById = new Map(workspace.objectives.map((item) => [item.id, item]));
  const milestoneById = new Map(workspace.milestones.map((item) => [item.id, item]));
  const iterationById = new Map(workspace.iterations.map((item) => [item.id, item]));
  const memberById = new Map(workspace.teamMembers.map((item) => [item.id, item]));
  const dependencyById = new Map(workspace.dependencies.map((item) => [item.id, item]));

  const idCollections: Array<[string, readonly unknown[]]> = [
    ["projects", workspace.projects],
    ["workItems", workspace.workItems],
    ["risks", workspace.risks],
    ["decisions", workspace.decisions],
    ["stakeholders", workspace.stakeholders],
    ["budgets", workspace.budgets],
    ["documents", workspace.documents],
    ["milestones", workspace.milestones],
    ["issues", workspace.issues],
    ["objectives", workspace.objectives],
    ["assumptions", workspace.assumptions],
    ["dependencies", workspace.dependencies],
    ["iterations", workspace.iterations],
    ["teamMembers", workspace.teamMembers],
    ["capacityAllocations", workspace.capacityAllocations],
    ["changes", workspace.changes],
    ["vendors", workspace.vendors],
    ["meetings", workspace.meetings],
    ["statusReports", workspace.statusReports],
    ["lessons", workspace.lessons],
    ["communications", workspace.communications],
    ["qualityGates", workspace.qualityGates],
    ["activities", workspace.activities],
    ["toolRuns", workspace.toolRuns],
    ["savedWorkViews", workspace.savedWorkViews],
  ];

  for (const [name, rows] of idCollections) {
    const seen = new Set<string>();
    rows.forEach((row, index) => {
      const id = entityId(row);
      if (!id) return;
      if (seen.has(id)) add("duplicate-id", `${name}[${index}].id`, `Duplicate ${name} id: ${id}`);
      seen.add(id);
    });
  }

  const scopedRows: Array<[string, readonly { projectId: string }[]]> = [
    ["workItems", workspace.workItems],
    ["risks", workspace.risks],
    ["decisions", workspace.decisions],
    ["stakeholders", workspace.stakeholders],
    ["budgets", workspace.budgets],
    ["documents", workspace.documents],
    ["milestones", workspace.milestones],
    ["issues", workspace.issues],
    ["objectives", workspace.objectives],
    ["assumptions", workspace.assumptions],
    ["dependencies", workspace.dependencies],
    ["iterations", workspace.iterations],
    ["teamMembers", workspace.teamMembers],
    ["capacityAllocations", workspace.capacityAllocations],
    ["changes", workspace.changes],
    ["vendors", workspace.vendors],
    ["meetings", workspace.meetings],
    ["statusReports", workspace.statusReports],
    ["lessons", workspace.lessons],
    ["communications", workspace.communications],
    ["qualityGates", workspace.qualityGates],
    ["activities", workspace.activities],
    ["toolRuns", workspace.toolRuns],
    ["projectSettings", workspace.projectSettings],
    ["savedWorkViews", workspace.savedWorkViews],
    ["workViewPreferences", workspace.workViewPreferences],
    ["closureRecords", workspace.closureRecords],
  ];
  for (const [name, rows] of scopedRows) {
    rows.forEach((row, index) => {
      if (!projectById.has(row.projectId)) add("missing-project", `${name}[${index}].projectId`, `Unknown project: ${row.projectId}`);
    });
  }

  const sameProject = <T extends { projectId: string }>(
    map: Map<string, T>,
    id: string | undefined,
    projectId: string,
    path: string,
    label: string,
  ) => {
    if (!id) return;
    const target = map.get(id);
    if (!target) add(`missing-${label}`, path, `Unknown ${label}: ${id}`);
    else if (target.projectId !== projectId) add(`cross-project-${label}`, path, `${label} ${id} belongs to another project`);
  };

  workspace.workItems.forEach((item, index) => {
    sameProject(workById, item.parentId, item.projectId, `workItems[${index}].parentId`, "work");
    sameProject(milestoneById, item.milestoneId, item.projectId, `workItems[${index}].milestoneId`, "milestone");
    sameProject(iterationById, item.iterationId, item.projectId, `workItems[${index}].iterationId`, "iteration");
    sameProject(memberById, item.ownerId, item.projectId, `workItems[${index}].ownerId`, "owner");
    item.dependencies.forEach((id, refIndex) => sameProject(workById, id, item.projectId, `workItems[${index}].dependencies[${refIndex}]`, "work"));
    item.riskIds.forEach((id, refIndex) => sameProject(riskById, id, item.projectId, `workItems[${index}].riskIds[${refIndex}]`, "risk"));
    item.objectiveIds.forEach((id, refIndex) => sameProject(objectiveById, id, item.projectId, `workItems[${index}].objectiveIds[${refIndex}]`, "objective"));
    if (item.estimate !== undefined && item.currentEstimate !== undefined && item.estimate !== item.currentEstimate)
      add("estimate-mirror", `workItems[${index}].estimate`, "Legacy estimate must mirror currentEstimate");
    if (item.done !== (item.status === "done")) add("work-state-mirror", `workItems[${index}].done`, "done must mirror status=done");
    const start = parseDate(item.startDate), due = parseDate(item.dueDate);
    if (item.startDate && start === null) add("invalid-date", `workItems[${index}].startDate`, `Invalid date: ${item.startDate}`);
    if (item.dueDate && due === null) add("invalid-date", `workItems[${index}].dueDate`, `Invalid date: ${item.dueDate}`);
    if (start !== null && due !== null && start > due) add("date-order", `workItems[${index}]`, "Work startDate is after dueDate");
    const createdAt=parseDate(item.createdAt),updatedAt=parseDate(item.updatedAt),startedAt=parseDate(item.startedAt),completedAt=parseDate(item.completedAt);
    if(createdAt===null)add("invalid-date",`workItems[${index}].createdAt`,`Invalid date: ${item.createdAt}`);
    if(updatedAt===null)add("invalid-date",`workItems[${index}].updatedAt`,`Invalid date: ${item.updatedAt}`);
    if(item.startedAt&&startedAt===null)add("invalid-date",`workItems[${index}].startedAt`,`Invalid date: ${item.startedAt}`);
    if(item.completedAt&&completedAt===null)add("invalid-date",`workItems[${index}].completedAt`,`Invalid date: ${item.completedAt}`);
    if(createdAt!==null&&startedAt!==null&&startedAt<createdAt)add("flow-date-order",`workItems[${index}].startedAt`,"startedAt is before createdAt");
    if(startedAt!==null&&completedAt!==null&&completedAt<startedAt)add("flow-date-order",`workItems[${index}].completedAt`,"completedAt is before startedAt");
    let previousHistoryAt:number|null=null;
    item.statusHistory?.forEach((entry,historyIndex)=>{
      const at=parseDate(entry.at);
      if(at===null)add("invalid-date",`workItems[${index}].statusHistory[${historyIndex}].at`,`Invalid date: ${entry.at}`);
      else if(previousHistoryAt!==null&&at<previousHistoryAt)add("status-history-order",`workItems[${index}].statusHistory[${historyIndex}]`,"Status history must be chronological");
      if(at!==null)previousHistoryAt=at;
    });
    const lastTransition=item.statusHistory?.at(-1);
    if(lastTransition&&lastTransition.to!==item.status)add("status-history-state",`workItems[${index}].statusHistory`,"Last status transition must match current status");
  });

  const adjacency = new Map<string, string[]>();
  workspace.dependencies.forEach((dependency, index) => {
    sameProject(workById, dependency.predecessorId, dependency.projectId, `dependencies[${index}].predecessorId`, "work");
    sameProject(workById, dependency.successorId, dependency.projectId, `dependencies[${index}].successorId`, "work");
    if (dependency.predecessorId === dependency.successorId)
      add("self-dependency", `dependencies[${index}]`, "A dependency cannot reference the same work item twice");
    adjacency.set(dependency.predecessorId, [...(adjacency.get(dependency.predecessorId) ?? []), dependency.successorId]);
  });
  workspace.workItems.forEach((item) => {
    for (const predecessor of item.dependencies)
      adjacency.set(predecessor, [...(adjacency.get(predecessor) ?? []), item.id]);
  });
  const visiting = new Set<string>(), visited = new Set<string>();
  const walk = (id: string, trail: string[]) => {
    if (visiting.has(id)) {
      add("dependency-cycle", `dependencies`, `Dependency cycle: ${[...trail, id].join(" -> ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of adjacency.get(id) ?? []) walk(next, [...trail, id]);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of adjacency.keys()) walk(id, []);

  workspace.issues.forEach((issue, index) => {
    sameProject(riskById, issue.relatedRiskId, issue.projectId, `issues[${index}].relatedRiskId`, "risk");
    issue.relatedWorkIds.forEach((id, refIndex) => sameProject(workById, id, issue.projectId, `issues[${index}].relatedWorkIds[${refIndex}]`, "work"));
  });
  workspace.objectives.forEach((objective, index) => objective.deliverableIds.forEach((id, refIndex) => sameProject(workById, id, objective.projectId, `objectives[${index}].deliverableIds[${refIndex}]`, "work")));
  workspace.iterations.forEach((iteration, index) => {
    iteration.workItemIds.forEach((id, refIndex) => sameProject(workById, id, iteration.projectId, `iterations[${index}].workItemIds[${refIndex}]`, "work"));
    const start = parseDate(iteration.startDate), end = parseDate(iteration.endDate);
    if (start === null) add("invalid-date", `iterations[${index}].startDate`, `Invalid date: ${iteration.startDate}`);
    if (end === null) add("invalid-date", `iterations[${index}].endDate`, `Invalid date: ${iteration.endDate}`);
    if (start !== null && end !== null && start > end) add("date-order", `iterations[${index}]`, "Iteration startDate is after endDate");
  });
  workspace.capacityAllocations.forEach((allocation, index) => sameProject(memberById, allocation.memberId, allocation.projectId, `capacityAllocations[${index}].memberId`, "owner"));
  workspace.vendors.forEach((vendor, index) => {
    vendor.milestones.forEach((id, refIndex) => sameProject(milestoneById, id, vendor.projectId, `vendors[${index}].milestones[${refIndex}]`, "milestone"));
    vendor.riskIds.forEach((id, refIndex) => sameProject(riskById, id, vendor.projectId, `vendors[${index}].riskIds[${refIndex}]`, "risk"));
    vendor.dependencyIds.forEach((id, refIndex) => sameProject(dependencyById, id, vendor.projectId, `vendors[${index}].dependencyIds[${refIndex}]`, "dependency"));
  });
  workspace.projectSettings.forEach((settings, index) => sameProject(memberById, settings.localMemberId, settings.projectId, `projectSettings[${index}].localMemberId`, "owner"));

  const projectEntities = new Map<string, Set<string>>();
  const addProjectEntities = (rows: readonly { id: string; projectId: string }[]) => {
    for (const row of rows) {
      const set = projectEntities.get(row.projectId) ?? new Set<string>();
      set.add(row.id);
      projectEntities.set(row.projectId, set);
    }
  };
  [workspace.workItems, workspace.risks, workspace.decisions, workspace.stakeholders, workspace.budgets, workspace.documents, workspace.milestones, workspace.issues, workspace.objectives, workspace.assumptions, workspace.dependencies, workspace.iterations, workspace.teamMembers, workspace.capacityAllocations, workspace.changes, workspace.vendors, workspace.meetings, workspace.statusReports, workspace.lessons, workspace.communications, workspace.qualityGates, workspace.activities, workspace.toolRuns].forEach(addProjectEntities);
  workspace.documents.forEach((document, index) => document.relatedIds.forEach((id, refIndex) => {
    if (!(projectEntities.get(document.projectId)?.has(id))) add("missing-related-entity", `documents[${index}].relatedIds[${refIndex}]`, `Unknown related entity: ${id}`);
  }));
  workspace.toolRuns.forEach((run, index) => run.appliedRecordIds.forEach((id, refIndex) => {
    if (!(projectEntities.get(run.projectId)?.has(id))) add("missing-applied-entity", `toolRuns[${index}].appliedRecordIds[${refIndex}]`, `Unknown applied record: ${id}`);
  }));

  workspace.projects.forEach((project, index) => {
    const start = parseDate(project.startDate), target = parseDate(project.targetDate);
    if (project.startDate && start === null) add("invalid-date", `projects[${index}].startDate`, `Invalid date: ${project.startDate}`);
    if (project.targetDate && target === null) add("invalid-date", `projects[${index}].targetDate`, `Invalid date: ${project.targetDate}`);
    if (start !== null && target !== null && start > target) add("date-order", `projects[${index}]`, "Project startDate is after targetDate");
  });
  workspace.milestones.forEach((milestone, index) => {
    if (milestone.date !== milestone.forecastDate) add("milestone-mirror", `milestones[${index}].date`, "Legacy milestone date must mirror forecastDate");
    for (const [field, value] of [["baselineDate", milestone.baselineDate], ["forecastDate", milestone.forecastDate], ["actualDate", milestone.actualDate]] as const)
      if (value && parseDate(value) === null) add("invalid-date", `milestones[${index}].${field}`, `Invalid date: ${value}`);
  });

  const duplicateProjectScoped = (name: string, ids: readonly string[]) => {
    const seen = new Set<string>();
    ids.forEach((id, index) => {
      if (seen.has(id)) add("duplicate-project-record", `${name}[${index}]`, `Duplicate project-scoped record for project: ${id}`);
      seen.add(id);
    });
  };
  duplicateProjectScoped("projectSettings", workspace.projectSettings.map((item) => item.projectId));
  duplicateProjectScoped("workViewPreferences", workspace.workViewPreferences.map((item) => item.projectId));
  duplicateProjectScoped("closureRecords", workspace.closureRecords.map((item) => item.projectId));

  return issues;
}

export function assertWorkspaceGraph(workspace: Workspace): Workspace {
  const issues = validateWorkspaceGraph(workspace);
  if (issues.length) {
    const summary = issues.slice(0, 6).map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Workspace integrity failed (${issues.length}): ${summary}`);
  }
  return workspace;
}
