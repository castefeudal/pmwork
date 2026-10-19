// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { emptyWorkspace } from '@/data/demo';
import { programSchema, operationSchema } from '@/domain/management-entities';
import { ContextWorkspaceShell } from './context-workspace-shell';

afterEach(()=>{cleanup();history.replaceState(null,'','/');});

it('shows the active operation name when switching away from a selected program',()=>{
  const workspace=emptyWorkspace('en');
  workspace.managementRole='program';
  workspace.programs=[programSchema.parse({id:'program-one',name:'Program outcome',outcome:'Shared outcome'})];
  workspace.operations=[operationSchema.parse({id:'operation-one',name:'Service operations',purpose:'Ongoing service'})];
  history.replaceState(null,'','/?view=program&context=program-one');
  render(<ContextWorkspaceShell workspace={workspace} locale="en" onChange={vi.fn()} onExport={vi.fn()} onRestore={vi.fn()} onCreateProject={vi.fn()} palette={false} onClosePalette={vi.fn()}/>);
  expect(screen.getByRole('heading',{level:1}).textContent).toBe('Program outcome');
  fireEvent.click(screen.getByRole('button',{name:'Operations'}));
  expect(screen.getByRole('heading',{level:1}).textContent).toBe('Service operations');
});
