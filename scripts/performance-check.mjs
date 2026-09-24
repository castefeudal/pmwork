import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';

const routes=['','glossary','methods','tools','workspace'];
const budgets={
 '/en/':{js:240000,html:50000},
 '/en/glossary':{js:430000,html:90000},
 '/en/methods':{js:430000,html:90000},
 '/en/tools':{js:300000,html:70000},
 '/en/workspace':{js:400000,html:70000},
};

const report=routes.map(route=>{
 const html=fs.readFileSync(path.join('out/en',route,'index.html'),'utf8');
 const scripts=[...new Set([...html.matchAll(/src="([^"?]+\.js)(?:\?[^"]*)?"/g)].map(m=>m[1]))];
 const js=scripts.reduce((sum,url)=>{
  const filename=path.join('out',url.replace(/^\/pmwork\//,'/').replace(/^\//,''));
  return sum+(fs.existsSync(filename)?gzipSync(fs.readFileSync(filename)).length:0);
 },0);
 return {route:`/en/${route}`,htmlGzipBytes:gzipSync(html).length,initialJsGzipBytes:js,scriptCount:scripts.length};
});

fs.mkdirSync('test-results',{recursive:true});
const baseline=JSON.parse(fs.readFileSync('scripts/performance-baseline.json','utf8'));
const comparison=report.map(row=>({route:row.route,baselineJs:baseline.initialJs[row.route],currentJs:row.initialJsGzipBytes,changePercent:100*(row.initialJsGzipBytes/baseline.initialJs[row.route]-1)}));
fs.writeFileSync('test-results/performance-bundles.json',JSON.stringify({report,budgets,baseline,comparison},null,2));
console.table(report);

const failures=[];
for(const row of report){
 const budget=budgets[row.route];
 if(!budget)continue;
 if(row.initialJsGzipBytes>budget.js)failures.push(`${row.route}: JS ${row.initialJsGzipBytes} > ${budget.js}`);
 if(row.htmlGzipBytes>budget.html)failures.push(`${row.route}: HTML ${row.htmlGzipBytes} > ${budget.html}`);
 const previous=baseline.initialJs[row.route];
 if(!Number.isFinite(previous))failures.push(`${row.route}: missing measured baseline`);
 else if(row.initialJsGzipBytes>previous*(1+baseline.maximumRegression))failures.push(`${row.route}: JS regressed more than ${baseline.maximumRegression*100}% from ${baseline.commit}`);
}
if(failures.length)throw Error(`Route transfer budget exceeded:\n${failures.join('\n')}`);
console.log('Static route-specific transfer budgets PASS. These are not field Core Web Vitals.');
