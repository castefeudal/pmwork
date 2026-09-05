import type { WorkItem, WorkViewConfig } from "./schemas";
export const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
export function localDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function selectWork(items: WorkItem[], config: WorkViewConfig, now = new Date(), localOwnerId?: string) {
  const today = localDay(now), next = new Date(now);
  next.setDate(next.getDate() + 7);
  const soon = localDay(next), recent = now.getTime() - 7 * 86400000;
  return items.filter(x => {
    if (x.archived || (config.status !== "all" && x.status !== config.status)) return false;
    if (config.preset === "my" && localOwnerId && x.ownerId) {
      if(x.ownerId !== localOwnerId) return false;
    } else if (config.owner && x.owner !== config.owner) return false;
    if (!`${x.id} ${x.title} ${x.owner} ${x.labels.join(" ")}`.toLocaleLowerCase().includes(config.query.toLocaleLowerCase())) return false;
    const open = x.status !== "done", overdue = open && !!x.dueDate && x.dueDate < today;
    switch (config.preset) {
      case "my": return !!(localOwnerId || config.owner) && open;
      case "attention": return open && (overdue || x.blocked || (x.priority === "critical" && !x.owner));
      case "soon": return open && !!x.dueDate && x.dueDate >= today && x.dueDate <= soon;
      case "overdue": return overdue;
      case "blocked": return open && x.blocked;
      case "priority": return open && priorityOrder[x.priority] <= 1;
      case "unassigned": return open && !x.owner.trim();
      case "recent": return Date.parse(x.updatedAt) >= recent;
      default: return true;
    }
  }).sort((a, b) => {
    const delta = config.sort === "priority" ? priorityOrder[a.priority] - priorityOrder[b.priority]
      : config.sort === "due" ? (a.dueDate || "9999").localeCompare(b.dueDate || "9999")
      : config.sort === "updated" ? b.updatedAt.localeCompare(a.updatedAt)
      : a.title.localeCompare(b.title);
    return delta || a.order - b.order || a.id.localeCompare(b.id);
  });
}
