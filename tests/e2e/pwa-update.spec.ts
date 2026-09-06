import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {demoWorkspace} from '../../src/data/demo';
test('waiting worker activates on request and preserves local workspace',async({page})=>{
 test.setTimeout(90000);
 const root=resolve('out'),release=JSON.parse(readFileSync(resolve(root,'release.json'),'utf8'));
 let updated=false;
 const mime:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml'};
 // Isolate two release versions on a separate origin; other parallel tests keep their server.
 const server=createServer((req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url!,'http://localhost').pathname).replace(/^\/pmwork(?=\/)/,'');
   let file=resolve(root,'.'+pathname);if(!file.startsWith(root+'/')&&file!==root){res.writeHead(403).end();return;}
   if(statSync(file).isDirectory())file=resolve(file,'index.html');
   let body=readFileSync(file);
   if(file.endsWith('/sw.js')&&updated)body=Buffer.from(body.toString().replace(`pmwork-${release.version}`,`pmwork-${release.version}-update`));
   res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404).end();}
 });
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
 const address=server.address() as {port:number},base=process.env.PMWORK_BASE_PATH==='github'?'/pmwork':'';
 try{
  await page.addInitScript(w=>{if(!localStorage.getItem('pmwork:workspace:v3'))localStorage.setItem('pmwork:workspace:v3',JSON.stringify(w))},demoWorkspace('en'));
  await page.goto(`http://127.0.0.1:${address.port}${base}/en/workspace/`);await expect(page.locator('.workspace-shell')).toBeVisible();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  updated=true;await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r!.update()});
  await expect(page.getByText('A new PMWORK version is available')).toBeVisible({timeout:30000});
  expect(await page.evaluate(()=>caches.keys())).toContain(`pmwork-${release.version}`);
  page.once('dialog',d=>d.accept());const reload=page.waitForEvent('domcontentloaded');await page.getByRole('button',{name:'Update',exact:true}).click();await reload;
  await expect(page.locator('.workspace-shell')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>caches.keys())).toEqual([`pmwork-${release.version}-update`]);
  await expect(page.getByText('A new PMWORK version is available')).toBeHidden();
  const count=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('pmwork:workspace:v3')!);return (s.workspace??s).projects.length});expect(count).toBe(demoWorkspace('en').projects.length);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
