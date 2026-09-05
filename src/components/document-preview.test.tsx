// @vitest-environment jsdom
import {render,screen} from '@testing-library/react';
import {describe,it,expect} from 'vitest';
import {DocumentPreview} from './document-preview';
describe('document reading',()=>{
 it('renders headings and tables without executing user markup',()=>{
  const {container}=render(<DocumentPreview body={'# Decision\n\n<script>alert(1)</script>\n\n| Option | Score |\n| --- | --- |\n| A | **8** |'}/>);
  expect(screen.getByRole('heading',{name:'Decision'})).toBeTruthy();expect(screen.getByRole('columnheader',{name:'Option'})).toBeTruthy();expect(container.querySelector('script')).toBeNull();expect(screen.getByText('<script>alert(1)</script>')).toBeTruthy();
 });
});
