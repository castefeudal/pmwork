"use client";
import { useSyncExternalStore } from 'react';
import type { Locale } from '@/domain/schemas';

function subscribe(notify:()=>void) {
  const storage=(event:StorageEvent)=>{
    if(event.key==='pmwork-contrast'){
      document.documentElement.dataset.contrast=event.newValue==='more'?'more':'standard';
      notify();
    }
  };
  window.addEventListener('pmwork-contrast',notify);
  window.addEventListener('storage',storage);
  return ()=>{window.removeEventListener('pmwork-contrast',notify);window.removeEventListener('storage',storage);};
}
export function ContrastSetting({locale}:{locale:Locale}) {
  const enhanced=useSyncExternalStore(subscribe,()=>document.documentElement.dataset.contrast==='more',()=>false);
  return <label className="checkbox"><input type="checkbox" checked={enhanced} onChange={event=>{
    const value=event.target.checked?'more':'standard';
    document.documentElement.dataset.contrast=value;
    try{localStorage.setItem('pmwork-contrast',value);}catch{/* Preference still applies for this session. */}
    window.dispatchEvent(new Event('pmwork-contrast'));
  }}/>{locale==='ru'?'Повышенный контраст':'Enhanced contrast'}</label>;
}
