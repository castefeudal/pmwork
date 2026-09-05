import { describe, expect, it } from 'vitest';
import { demoWorkspace } from '@/data/demo';
import { readWorkspaceUrl, workspaceUrl } from './workspace-url';
describe('workspace URL state', () => {
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
