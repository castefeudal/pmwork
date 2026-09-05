"use client";
import {useSyncExternalStore} from 'react';
function subscribe(callback:()=>void){addEventListener('popstate',callback);addEventListener('pmwork-url',callback);return()=>{removeEventListener('popstate',callback);removeEventListener('pmwork-url',callback);};}
export function useUrlValue(key:string,fallback='') {
 const search=useSyncExternalStore(subscribe,()=>window.location.search,()=> '');
 const value=new URLSearchParams(search).get(key)??fallback;
 const set=(next:string)=>{const url=new URL(window.location.href);url.searchParams.set(key,next);history.pushState(null,'',url);dispatchEvent(new Event('pmwork-url'));};
 return [value,set] as const;
}
export function useUrlChoice<T extends string>(key:string,choices:readonly T[],fallback:T){
 const [value,set]=useUrlValue(key,fallback);
 return [choices.includes(value as T)?value as T:fallback,set] as const;
}
