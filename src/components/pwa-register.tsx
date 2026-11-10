"use client";
import { useEffect,useRef,useState } from "react";
import {usePathname} from "next/navigation";
import { ConfirmationDialog } from "./confirmation-dialog";
export function PwaRegister() {
 const pathname=usePathname()??'/';
 const [notice,setNotice]=useState<'offline'|'online'|''>(''),[waiting,setWaiting]=useState<ServiceWorker|null>(null),[confirmUpdate,setConfirmUpdate]=useState(false);
 const registration=useRef<ServiceWorkerRegistration|null>(null);
 useEffect(() => {
  let idle:number|undefined,delay:number|undefined;
  const offline=()=>setNotice('offline');
  const online=()=>setNotice('online');
  addEventListener('offline',offline);addEventListener('online',online);
  if(!navigator.onLine)offline();
  // Activate an already-downloaded release and reload onto it once the new
  // worker takes control; the reload fetches fresh HTML and matching chunks.
  const applyUpdate=(worker:ServiceWorker)=>{navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});worker.postMessage({type:'SKIP_WAITING'});};
  const register=()=>{if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator){
   const base=location.pathname.startsWith('/pmwork/')?'/pmwork':'';
   // updateViaCache:'none' forces a network fetch of sw.js on every check,
   // bypassing the HTTP/CDN cache (Pages serves sw.js with max-age=600) so a
   // new release is detected immediately instead of after the cache expires.
   navigator.serviceWorker.register(`${base}/sw.js`,{updateViaCache:'none'}).then(reg=>{
    registration.current=reg;
    // A release downloaded on a previous visit is still waiting: apply it on
    // this fresh load so a normal reload always lands on the newest version.
    if(reg.waiting&&navigator.serviceWorker.controller){applyUpdate(reg.waiting);return;}
    if(reg.waiting)setWaiting(reg.waiting);
    reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)setWaiting(worker);});});
   }).catch(()=>undefined);
  }};
  // Keep first installation and its precache requests out of initial rendering.
  const schedule=()=>{
   if(typeof window.requestIdleCallback==='function')idle=window.requestIdleCallback(register,{timeout:3000});
   else delay=window.setTimeout(register,0);
  };
  if(document.readyState==='complete')schedule();
  else window.addEventListener('load',schedule,{once:true});
  // Long-lived tabs re-check for a release when refocused and once an hour.
  const recheck=()=>{if(document.visibilityState==='visible')registration.current?.update().catch(()=>undefined);};
  document.addEventListener('visibilitychange',recheck);
  const hourly=window.setInterval(()=>registration.current?.update().catch(()=>undefined),3600000);
  return()=>{
   removeEventListener('offline',offline);removeEventListener('online',online);
   window.removeEventListener('load',schedule);
   document.removeEventListener('visibilitychange',recheck);
   if(idle!==undefined)window.cancelIdleCallback(idle);
   if(delay!==undefined)window.clearTimeout(delay);
   if(hourly!==undefined)window.clearInterval(hourly);
  };
 },[]);
 const ru=/(^|\/)ru(\/|$)/.test(pathname);
 if(!notice&&!waiting)return null;
 const update=()=>{if(!waiting)return; navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});waiting.postMessage({type:'SKIP_WAITING'});setConfirmUpdate(false);};
 return <>{<aside className={`pwa-notice${waiting?' pwa-notice--update':''}`} role="status">{notice==='offline'?(ru?'Нет сети · изменения сохраняются локально':'Offline · changes save locally'):notice==='online'?(ru?'Подключение восстановлено':'Back online'):null}{waiting&&<><span>{ru?'Доступна новая версия PMWORK':'A new PMWORK version is available'}</span><button className="button small" onClick={()=>setConfirmUpdate(true)}>{ru?'Обновить':'Update'}</button></>}</aside>}{confirmUpdate&&<ConfirmationDialog locale={ru?'ru':'en'} title={ru?'Обновить PMWORK?':'Update PMWORK?'} message={ru?'Сохраните открытые изменения перед обновлением. После обновления страница перезагрузится.':'Save open edits before updating. The page will reload after the update.'} confirmLabel={ru?'Обновить':'Update'} onCancel={()=>setConfirmUpdate(false)} onConfirm={update}/>}</>;
}