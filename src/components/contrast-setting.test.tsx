// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ContrastSetting } from './contrast-setting';
afterEach(()=>{cleanup();localStorage.clear();delete document.documentElement.dataset.contrast;delete document.documentElement.dataset.theme;});
it('keeps contrast independent of the theme and syncs external preference changes',()=>{
  document.documentElement.dataset.theme='dark';
  render(<ContrastSetting locale="en"/>);
  const checkbox=screen.getByRole('checkbox',{name:'Enhanced contrast'});
  fireEvent.click(checkbox);
  expect(localStorage.getItem('pmwork-contrast')).toBe('more');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.documentElement.dataset.contrast).toBe('more');
  fireEvent(window,new StorageEvent('storage',{key:'pmwork-contrast',newValue:'standard'}));
  expect((checkbox as HTMLInputElement).checked).toBe(false);
});
