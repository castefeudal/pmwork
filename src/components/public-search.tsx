"use client";
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { methods,templates,playbooks,knowledgeDomains } from '@/content/catalog';
import { glossaryTerms } from '@/content/glossary';
import type { Locale } from '@/domain/schemas';
import { useDialogFocus } from './use-dialog-focus';
export default function PublicSearch({locale,onClose}:{locale:Locale;onClose:()=>void}) {
 const ref=useDialogFocus(),ru=locale==='ru';const [query,setQuery]=useState(''),[active,setActive]=useState(0);
 const entries=useMemo(()=>[
  ...glossaryTerms.map(t=>({id:`glossary-${t.slug}`,label:ru?t.ruTerm:t.term,search:[t.term,t.ruTerm,...t.aliases].join(' '),group:ru?'ГЛОССАРИЙ':'GLOSSARY',url:`/${locale}/glossary/${t.slug}/`})),
  ...([['methods',methods],['templates',templates],['playbooks',playbooks]] as const).flatMap(([kind,items])=>items.map(t=>({id:`${kind}-${t.slug}`,label:t.title[locale],search:t.title.ru+' '+t.title.en,group:kind.toUpperCase(),url:`/${locale}/${kind}/?q=${encodeURIComponent(t.title[locale])}`}))),
  ...knowledgeDomains.map(t=>({id:t.en,label:t[locale],search:t.ru+' '+t.en,group:ru?'ЗНАНИЯ':'KNOWLEDGE',url:`/${locale}/knowledge/?q=${encodeURIComponent(t[locale])}`})),
  ...['fit','cpm','pert','evm','forecast','priority','flow'].map(tool=>({id:tool,label:tool.toUpperCase(),search:tool==='evm'?'EVM earned value освоенный объём':tool,group:'TOOLS',url:`/${locale}/tools/?tool=${tool}`})),
 ],[locale,ru]);
 const index=useMemo(()=>new Fuse(entries,{keys:['label','search'],threshold:.35,ignoreLocation:true}),[entries]);
 const results=(query?index.search(query).map(r=>r.item).sort((a,b)=>Number(b.search.toLowerCase().split(' ').includes(query.toLowerCase()))-Number(a.search.toLowerCase().split(' ').includes(query.toLowerCase()))):entries).slice(0,30);const selected=Math.min(active,Math.max(0,results.length-1));
 return <div className="dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={ref} className="command-palette" role="dialog" aria-modal="true" aria-label={ru?'Общий поиск':'Global search'} tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape')onClose();if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setActive((selected+(e.key==='ArrowDown'?1:-1)+results.length)%Math.max(1,results.length));}if(e.key==='Enter'&&results[selected]&&(e.target as HTMLElement).tagName==='INPUT'){e.preventDefault();document.getElementById(`public-result-${selected}`)?.click();}}}>
 <div className="search-input"><input className="input" type="search" aria-label={ru?'Поиск по PMWORK':'Search PMWORK'} value={query} onChange={e=>{setQuery(e.target.value);setActive(0);}} placeholder={ru?'Метод, проблема, термин, инструмент…':'Method, problem, term, tool…'}/><button className="button" onClick={onClose}>{ru?'Закрыть':'Close'}</button></div>
 <div className="command-results">{results.map((item,i)=><Link id={`public-result-${i}`} className={`public-search-result ${i===selected?'active':''}`} key={item.id} href={item.url} onClick={onClose}><small>{item.group}</small><strong>{item.label}</strong></Link>)}{!results.length&&<p role="status">{ru?'Ничего не найдено':'No results'}</p>}</div>
 </section></div>;
}
