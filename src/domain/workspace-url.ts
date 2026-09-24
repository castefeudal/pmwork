import type { Workspace } from './schemas';
import type { WorkspaceView } from '@/components/workspace-types';
import type { EditableKind } from '@/components/record-editor';
const recordCollections = {
 project:'projects',work:'workItems',dependency:'dependencies',milestone:'milestones',iteration:'iterations',
 risk:'risks',issue:'issues',assumption:'assumptions',decision:'decisions',stakeholder:'stakeholders',team:'teamMembers',
 communication:'communications',vendor:'vendors',budget:'budgets',change:'changes',quality:'qualityGates',document:'documents',
} as const satisfies Record<EditableKind,keyof Workspace>;
export function readWorkspaceRecord(search: string, workspace: Workspace, projectId: string): {kind:EditableKind;id:string}|null {
 const params=new URLSearchParams(search),id=params.get('item'),kind=params.get('kind');
 if(!id)return null;
 for(const [recordKind,collection] of Object.entries(recordCollections)) {
  if(kind&&kind!==recordKind)continue;
  if(workspace[collection].some(row=>row.id===id&&('projectId' in row?row.projectId===projectId:row.id===projectId)))return {kind:recordKind as EditableKind,id};
 }
 return null;
}
export function workspaceRecordUrl(url: string, record: {kind:EditableKind;id:string}|null) {
 const next=new URL(url);
 if(record){next.searchParams.set('item',record.id);next.searchParams.set('kind',record.kind);}
 else {next.searchParams.delete('item');next.searchParams.delete('kind');}
 return next;
}
const views: WorkspaceView[] = ['portfolio','overview','guide','work','board','planning','raid','people','finance','control','documents','setup'];
export function readWorkspaceUrl(search: string, workspace: Workspace) {
  const params = new URLSearchParams(search);
  const requested = params.get('view') as WorkspaceView;
  const view = views.includes(requested) ? requested : 'overview';
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
