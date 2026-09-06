import {describe,it,expect} from 'vitest';
import {publicMetadata,publicBasePath} from './public-metadata';
import sitemap from '../../app/sitemap';
import robots from '../../app/robots';
import {metadata} from '../../app/[locale]/workspace/page';
describe('public discovery boundary',()=>{
 it('keeps local application records out of search indexing',()=>{
  expect(metadata.robots.index).toBe(false);
  expect(sitemap().some(x=>x.url.includes('/workspace'))).toBe(false);
  expect(robots().rules).toEqual([{userAgent:'*',allow:'/',disallow:[`${publicBasePath}/ru/workspace/`,`${publicBasePath}/en/workspace/`]}]);
 });
 it('gives each detail page its own canonical and both locales',()=>{
  const m=publicMetadata('ru','methods/scrum','Scrum','Описание Scrum');
  const t=publicMetadata('en','templates/status-report','Status report','Prepare a status report');
  expect(m.alternates?.canonical).toContain(`${publicBasePath}/ru/methods/scrum/`);
  expect(m.alternates?.languages?.en).toContain('/en/methods/scrum/');
  expect(m.title).not.toBe(t.title);
  expect(m.description).not.toBe(t.description);
 });
});
