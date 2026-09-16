import type { Workspace } from "./schemas";

/**
 * Legacy schemas did not own every collection that exists in v6. Some old fixtures and
 * backups can therefore contain compatibility reference fields whose target collection
 * did not exist yet. Repair only legacy payloads; current v6 corruption must fail closed.
 */
export function repairLegacyReferences(workspace: Workspace, sourceVersion: number): Workspace {
  if (!Number.isInteger(sourceVersion) || sourceVersion < 1 || sourceVersion > 5) return workspace;

  const workById = new Map(workspace.workItems.map((item) => [item.id, item]));
  const riskById = new Map(workspace.risks.map((item) => [item.id, item]));
  const objectiveById = new Map(workspace.objectives.map((item) => [item.id, item]));
  const milestoneById = new Map(workspace.milestones.map((item) => [item.id, item]));
  const iterationById = new Map(workspace.iterations.map((item) => [item.id, item]));
  const memberById = new Map(workspace.teamMembers.map((item) => [item.id, item]));
  const dependencyById = new Map(workspace.dependencies.map((item) => [item.id, item]));

  const sameProject = <T extends { projectId: string }>(
    map: Map<string, T>,
    id: string | undefined,
    projectId: string,
  ) => Boolean(id && map.get(id)?.projectId === projectId);

  const relatedProjectById = new Map<string, string>();
  const registerRelated = (rows: Array<{ id: string; projectId: string }>) => {
    for (const row of rows) relatedProjectById.set(row.id, row.projectId);
  };
  registerRelated(workspace.workItems);
  registerRelated(workspace.risks);
  registerRelated(workspace.issues);
  registerRelated(workspace.decisions);
  registerRelated(workspace.stakeholders);
  registerRelated(workspace.budgets);
  registerRelated(workspace.documents);
  registerRelated(workspace.milestones);
  registerRelated(workspace.objectives);
  registerRelated(workspace.assumptions);
  registerRelated(workspace.dependencies);
  registerRelated(workspace.iterations);
  registerRelated(workspace.teamMembers);
  registerRelated(workspace.changes);
  registerRelated(workspace.vendors);
  registerRelated(workspace.meetings);
  registerRelated(workspace.statusReports);
  registerRelated(workspace.lessons);
  registerRelated(workspace.communications);
  registerRelated(workspace.qualityGates);

  return {
    ...workspace,
    workItems: workspace.workItems.map((item) => ({
      ...item,
      parentId: sameProject(workById, item.parentId, item.projectId) ? item.parentId : undefined,
      milestoneId: sameProject(milestoneById, item.milestoneId, item.projectId)
        ? item.milestoneId
        : undefined,
      iterationId: sameProject(iterationById, item.iterationId, item.projectId)
        ? item.iterationId
        : undefined,
      ownerId: sameProject(memberById, item.ownerId, item.projectId) ? item.ownerId : undefined,
      dependencies: item.dependencies.filter((id) => sameProject(workById, id, item.projectId)),
      riskIds: item.riskIds.filter((id) => sameProject(riskById, id, item.projectId)),
      objectiveIds: item.objectiveIds.filter((id) => sameProject(objectiveById, id, item.projectId)),
    })),
    issues: workspace.issues.map((issue) => ({
      ...issue,
      relatedRiskId: sameProject(riskById, issue.relatedRiskId, issue.projectId)
        ? issue.relatedRiskId
        : undefined,
      relatedWorkIds: issue.relatedWorkIds.filter((id) => sameProject(workById, id, issue.projectId)),
    })),
    objectives: workspace.objectives.map((objective) => ({
      ...objective,
      deliverableIds: objective.deliverableIds.filter((id) => sameProject(workById, id, objective.projectId)),
    })),
    iterations: workspace.iterations.map((iteration) => ({
      ...iteration,
      workItemIds: iteration.workItemIds.filter((id) => sameProject(workById, id, iteration.projectId)),
    })),
    documents: workspace.documents.map((document) => ({
      ...document,
      relatedIds: document.relatedIds.filter((id) => relatedProjectById.get(id) === document.projectId),
    })),
    capacityAllocations: workspace.capacityAllocations.filter((allocation) =>
      sameProject(memberById, allocation.memberId, allocation.projectId),
    ),
    vendors: workspace.vendors.map((vendor) => ({
      ...vendor,
      milestones: vendor.milestones.filter((id) => sameProject(milestoneById, id, vendor.projectId)),
      riskIds: vendor.riskIds.filter((id) => sameProject(riskById, id, vendor.projectId)),
      dependencyIds: vendor.dependencyIds.filter((id) => sameProject(dependencyById, id, vendor.projectId)),
    })),
    projectSettings: workspace.projectSettings.map((settings) => ({
      ...settings,
      localMemberId: sameProject(memberById, settings.localMemberId, settings.projectId)
        ? settings.localMemberId
        : undefined,
    })),
  };
}
