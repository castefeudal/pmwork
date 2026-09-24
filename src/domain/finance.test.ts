import { expect, it } from 'vitest';
import { demoWorkspace } from '@/data/demo';
import { projectFinancials } from './finance';

it('does not substitute actual plus commitments for missing forecast evidence',()=>{
  const w=demoWorkspace('en');
  w.budgets=[{id:'one',projectId:'atlas',category:'Recorded',planned:100,actual:10,committed:20,forecast:75},{id:'two',projectId:'atlas',category:'Unknown',planned:100,actual:0,committed:0}];
  expect(projectFinancials(w,'atlas')).toMatchObject({planned:200,actual:10,committed:20,forecast:null,variance:null,missingForecast:1});
  w.budgets[1].forecast=0;
  expect(projectFinancials(w,'atlas')).toMatchObject({forecast:75,variance:125,missingForecast:0});
  expect(projectFinancials(w,'missing')).toMatchObject({planned:null,actual:null,committed:null,forecast:null,variance:null});
});
