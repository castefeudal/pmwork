import type { Workspace } from './schemas';
import type { WorkspaceView } from '@/components/workspace-types';
const views: WorkspaceView[] = ['portfolio','overview','guide','work','board','planning','raid','people','finance','control','documents','setup'];
export function readWorkspaceUrl(search: string, workspace: Workspace) {
  const params = new URLSearchParams(search);
  const requested = params.get('view') as WorkspaceView;
  const view = views.includes(requested) ? requested : workspace.experience === 'foundation' ? 'guide' : 'overview';
  return { project: workspace.projects.some(p => p.id === params.get('project')) ? params.get('project')! : workspace.projects[0]?.id ?? '', view: view === 'work' && params.get('layout') === 'board' ? 'board' as const : view };
}
export function workspaceUrl(url: string, project: string, view: WorkspaceView) {
  const next = new URL(url);
  next.searchParams.set('project', project);
  next.searchParams.set('view', view === 'board' ? 'work' : view);
  if (view === 'board' || view === 'work') next.searchParams.set('layout', view === 'board' ? 'board' : 'list');
  else next.searchParams.delete('layout');
  return next;
}
