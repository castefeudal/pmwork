"use client";
import { useEffect,useState } from "react";
import { ConfirmationDialog } from "./confirmation-dialog";
export function PwaRegister() {
 const [notice,setNotice]=useState(''),[waiting,setWaiting]=useState<ServiceWorker|null>(null),[confirmUpdate,setConfirmUpdate]=useState(false);
 useEffect(() => {
  let idle:number|undefined,delay:number|undefined;
  const ru=location.pathname.includes('/ru/');
  const offline=()=>setNotice(ru?'Нет сети · изменения сохраняются локально':'Offline · changes save locally');
  const online=()=>setNotice(ru?'Подключение восстановлено':'Back online');
  addEventListener('offline',offline);addEventListener('online',online);
  if(!navigator.onLine)offline();
  const register=()=>{if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator){
   const base=location.pathname.startsWith('/pmwork/')?'/pmwork':'';
   navigator.serviceWorker.register(`${base}/sw.js`).then(reg=>{
    if(reg.waiting)setWaiting(reg.waiting);
    reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)setWaiting(worker);});});
   }).catch(()=>undefined);
  }};
  // Keep first installation and its precache requests out of initial rendering.
  const schedule=()=>{
   if('requestIdleCallback' in window)idle=window.requestIdleCallback(register,{timeout:3000});
   else delay=window.setTimeout(register,0);
  };
  if(document.readyState==='complete')schedule();
  else window.addEventListener('load',schedule,{once:true});
  return()=>{
   removeEventListener('offline',offline);removeEventListener('online',online);
   window.removeEventListener('load',schedule);
   if(idle!==undefined)window.cancelIdleCallback(idle);
   if(delay!==undefined)window.clearTimeout(delay);
  };
 },[]);
 const ru=typeof location!=='undefined'&&location.pathname.includes('/ru/');
 if(!notice&&!waiting)return null;
 const update=()=>{if(!waiting)return; navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});waiting.postMessage({type:'SKIP_WAITING'});setConfirmUpdate(false);};
 return <>{<aside className="pwa-notice" role="status">{notice}{waiting&&<><span>{ru?'Доступна новая версия PMWORK':'A new PMWORK version is available'}</span><button className="button small" onClick={()=>setConfirmUpdate(true)}>{ru?'Обновить':'Update'}</button></>}</aside>}{confirmUpdate&&<ConfirmationDialog locale={ru?'ru':'en'} title={ru?'Обновить PMWORK?':'Update PMWORK?'} message={ru?'Сохраните открытые изменения перед обновлением. После обновления страница перезагрузится.':'Save open edits before updating. The page will reload after the update.'} confirmLabel={ru?'Обновить':'Update'} onCancel={()=>setConfirmUpdate(false)} onConfirm={update}/>}</>;
}
