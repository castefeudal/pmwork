import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const budgets=JSON.parse(fs.readFileSync('docs/performance-budgets.json','utf8'));
const routes=Object.keys(budgets.routes);
const report=routes.map(route=>{
 const html=fs.readFileSync(path.join('out/en',route,'index.html'),'utf8');
 const scripts=[...new Set([...html.matchAll(/src="([^"?]+\.js)(?:\?[^"]*)?"/g)].map(m=>m[1]))];
 const js=scripts.reduce((sum,url)=>{const filename=path.join('out',url.replace(/^\/pmwork\//,'/').replace(/^\//,''));if(!fs.existsSync(filename))throw Error(`Missing script: ${url}`);return sum+gzipSync(fs.readFileSync(filename)).length;},0);
 return {route:`/en/${route}`,htmlGzipBytes:gzipSync(html).length,initialJsGzipBytes:js,scriptCount:scripts.length};
});
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/performance-bundles.json',JSON.stringify(report,null,2));
console.table(report);
for(const r of report){const budget=budgets.routes[r.route.replace('/en/','')];if(r.initialJsGzipBytes>budget.js||r.htmlGzipBytes>budget.html)throw Error(`Route transfer budget exceeded: ${r.route}`);}
console.log('Static transfer budgets PASS. These are not field Core Web Vitals.');
