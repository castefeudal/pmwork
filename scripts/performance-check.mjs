import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const routes=['','glossary','methods','tools','workspace'];
const report=routes.map(route=>{
 const html=fs.readFileSync(path.join('out/en',route,'index.html'),'utf8');
 const scripts=[...new Set([...html.matchAll(/src="([^"?]+\.js)(?:\?[^"]*)?"/g)].map(m=>m[1]))];
 const js=scripts.reduce((sum,url)=>{const filename=path.join('out',url.replace(/^\/pmwork\//,'/').replace(/^\//,''));return sum+(fs.existsSync(filename)?gzipSync(fs.readFileSync(filename)).length:0);},0);
 return {route:`/en/${route}`,htmlGzipBytes:gzipSync(html).length,initialJsGzipBytes:js,scriptCount:scripts.length};
});
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/performance-bundles.json',JSON.stringify(report,null,2));
console.table(report);
if(report.some(r=>r.initialJsGzipBytes>700000||r.htmlGzipBytes>400000))throw Error('Route transfer budget exceeded');
console.log('Static transfer budgets PASS. These are not field Core Web Vitals.');
