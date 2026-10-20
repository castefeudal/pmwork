// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { demoWorkspace } from '@/data/demo';
import { TodayAcrossWork } from './today-across-work';
import { TodayView } from './today-view';

afterEach(()=>{cleanup();history.replaceState(null,'','/');});

describe('daily decision center',()=>{
  it('makes signals beyond the first ten accessible and opens their source',()=>{
    const workspace=demoWorkspace('en');
    workspace.workItems=Array.from({length:24},(_,index)=>({...workspace.workItems[0],id:`bulk-${index.toString().padStart(2,'0')}`,title:`Blocked work ${index}`,projectId:'atlas',blocked:true,done:false,status:'in-progress' as const,dueDate:'2000-01-01'}));
    const onEdit=vi.fn();
    render(<TodayAcrossWork workspace={workspace} locale="en" onView={vi.fn()} onProject={vi.fn()} onEdit={onEdit}/>);
    const group=document.getElementById('today-act')!;
    const first=within(group as HTMLElement).getAllByRole('button',{name:/Blocked work/}).map(button=>button.textContent);
    fireEvent.click(within(group as HTMLElement).getByRole('button',{name:'Next'}));
    fireEvent.click(within(group as HTMLElement).getByRole('button',{name:'Next'}));
    const next=within(group as HTMLElement).getAllByRole('button',{name:/Blocked work/});
    expect(next.some(button=>!first.includes(button.textContent))).toBe(true);
    fireEvent.click(next[0]);
    expect(onEdit).toHaveBeenCalledWith('work',expect.stringMatching(/^bulk-/));
  });

  it('retains the review scope through remount and browser navigation',()=>{
    const workspace=demoWorkspace('en');
    const props={workspace,project:workspace.projects[0],locale:'en' as const,onView:vi.fn(),onProject:vi.fn(),onEdit:vi.fn(),onCreate:vi.fn(),onChange:vi.fn()};
    const mounted=render(<TodayView {...props}/>);
    fireEvent.click(within(screen.getByRole('group',{name:'Review scope'})).getByRole('button',{name:'All work'}));
    expect(new URLSearchParams(location.search).get('todayScope')).toBe('all');
    mounted.unmount();
    render(<TodayView {...props}/>);
    expect(screen.getByRole('button',{name:'All work'}).getAttribute('aria-pressed')).toBe('true');
    history.replaceState(null,'','/?todayScope=project');
    fireEvent(window,new PopStateEvent('popstate'));
    expect(screen.getByRole('button',{name:'Current project'}).getAttribute('aria-pressed')).toBe('true');
  });
});
