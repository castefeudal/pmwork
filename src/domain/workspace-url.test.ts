import { describe, expect, it } from 'vitest';
import { demoWorkspace } from '@/data/demo';
import { readWorkspaceUrl, workspaceUrl, readWorkspaceRecord, workspaceRecordUrl } from './workspace-url';
describe('workspace URL state', () => {
 it('preserves view context when opening and closing a typed record link',()=>{
  const w=demoWorkspace('en'),risk=w.risks[0]!;
  const original='https://example.com/pmwork/en/workspace/?view=raid&tab=risks&project='+risk.projectId;
  const opened=workspaceRecordUrl(original,{kind:'risk',id:risk.id});
  expect(readWorkspaceRecord(opened.search,w,risk.projectId)).toEqual({kind:'risk',id:risk.id});
  expect(workspaceRecordUrl(opened.href,null).href).toBe(original);
  expect(readWorkspaceRecord(opened.search,w,'other-project')).toBeNull();
  opened.searchParams.set('kind','work');
  expect(readWorkspaceRecord(opened.search,w,risk.projectId)).toBeNull();
 });
 it('round trips project and board layout without project records', () => {
  const workspace = demoWorkspace('en');
  const url = workspaceUrl('https://example.com/pmwork/en/workspace/?tab=dependencies', 'atlas', 'board');
  expect(readWorkspaceUrl(url.search, workspace)).toEqual({ project: 'atlas', view: 'board' });
  expect(url.searchParams.get('tab')).toBe('dependencies');
  expect(url.searchParams.get('view')).toBe('work');
 });
 it('falls back safely for invalid params and opens Today', () => {
  const workspace = {...demoWorkspace('ru'), experience: 'foundation' as const};
  expect(readWorkspaceUrl('?project=missing&view=bogus', workspace)).toEqual({ project: workspace.projects[0].id, view: 'overview' });
 });
});
