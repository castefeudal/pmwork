"use client";
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Search,ChevronDown} from 'lucide-react';
import {templates,type Template} from '@/content/catalog';
import {templatePractice} from '@/content/template-practice';
import type {Locale} from '@/domain/schemas';

const collection=(template:Template)=>{
 if(/closure|handover|lesson|benefit-review/.test(template.slug))return 'closure';
 if(/meeting/.test(template.slug))return 'meetings';
 if(/stakeholder|communication|team|raci|vendor|procurement/.test(template.slug))return 'people';
 if(/risk|issue|assumption|decision/.test(template.slug))return 'risk';
 if(/change/.test(template.slug))return 'change';
 if(/backlog|sprint|iteration|kanban|release|quality|acceptance/.test(template.slug))return 'delivery';
 return template.category==='strategy'?'start':template.category==='plan'?'plan':'control';
};
const groups=[
 ['all','Все','All'],['start','Запустить проект','Start'],['plan','Спланировать','Plan'],['control','Контролировать','Control'],['risk','Риски и решения','Risks'],['people','Люди','People'],['delivery','Выполнение','Delivery'],['meetings','Встречи','Meetings'],['change','Изменения','Changes'],['closure','Закрытие','Closure']
] as const;
const featured=['project-charter','project-plan','risk-register','status-report','stakeholder-register','decision-log'];

export function TemplateHub({locale}:{locale:Locale}){
 const ru=locale==='ru',[query,setQuery]=useState(''),[group,setGroup]=useState('all'),[limit,setLimit]=useState(12);
 const counts=useMemo(()=>Object.fromEntries(groups.map(([id])=>[id,id==='all'?templates.length:templates.filter(t=>collection(t)===id).length])),[]);
 const data=useMemo(()=>{
  const q=query.trim().toLowerCase();
  const filtered=templates.filter(t=>(group==='all'||collection(t)===group)&&(!q||`${t.title.ru} ${t.title.en} ${t.purpose.ru} ${t.purpose.en} ${t.slug}`.toLowerCase().includes(q)));
  if(!q&&group==='all')return [...filtered].sort((a,b)=>Number(featured.includes(b.slug))-Number(featured.includes(a.slug)));
  return filtered;
 },[query,group]);
 const visible=data.slice(0,limit);
 const choose=(id:string)=>{setGroup(id);setLimit(12)};
 return <>
  <header className="catalog-hero">
   <p className="eyebrow">PMWORK · {ru?'шаблоны':'templates'}</p>
   <h1>{ru?'Рабочие шаблоны · Что вы хотите подготовить?':'Practical templates · What do you need to prepare?'}</h1>
   <p className="lead">{ru?'Начните с результата, а не с списка из 47 документов. Выберите задачу, найдите шаблон и примените его к проекту.':'Start with the outcome, not a wall of 47 documents. Choose the job, find a template, and apply it to a project.'}</p>
   <div className="catalog-controls"><label className="field"><span className="sr-only">{ru?'Поиск':'Search'}</span><span className="search-input"><Search size={18}/><input className="input" value={query} onChange={e=>{setQuery(e.target.value);setLimit(12)}} placeholder={ru?'Например: статус, риск, устав, встреча…':'For example: status, risk, charter, meeting…'}/></span></label><span className="pill">{data.length} {ru?'шаблонов':'templates'}</span></div>
  </header>
  {!query&&group==='all'&&<section className="public-container"><h2>{ru?'Часто нужны в реальном проекте':'Common starting points'}</h2><div className="button-row">{featured.map(slug=>{const t=templates.find(x=>x.slug===slug);return t?<Link className="button" key={slug} href={`/${locale}/templates/${slug}/`}>{t.title[locale]}</Link>:null})}</div></section>}
  <nav className="public-container button-row" aria-label={ru?'Задача шаблона':'Template job'}>{groups.map(([id,r,e])=><button className="button small" aria-pressed={group===id} onClick={()=>choose(id)} key={id}>{ru?r:e} · {counts[id]}</button>)}</nav>
  <section id="catalog-results" className="catalog-grid" aria-live="polite">{visible.map(t=><article className="catalog-card" key={t.slug}>
   <span className="pill">{groups.find(([id])=>id===collection(t))?.[ru?1:2]}</span>
   <h2>{t.title[locale]}</h2><p>{t.purpose[locale]}</p>
   <p className="muted compact">{ru?'Когда использовать':'When to use'}: {t.when[locale]}</p>
   <small>{ru?'Ориентир заполнения':'Completion estimate'}: {templatePractice[t.slug]?.[4]} {ru?'мин':'min'}</small>
   <div className="button-row"><Link className="button primary small" href={`/${locale}/templates/${t.slug}/`}>{ru?'Открыть шаблон':'Open template'}</Link></div>
  </article>)}</section>
  {!data.length&&<section className="public-container panel"><h2>{ru?'Ничего не найдено':'No matches'}</h2><p>{ru?'Попробуйте другую формулировку или выберите другую задачу.':'Try another phrase or choose another job.'}</p></section>}
  {visible.length<data.length&&<div className="public-container button-row"><button className="button" onClick={()=>setLimit(v=>v+12)}><ChevronDown size={16}/>{ru?`Показать ещё · осталось ${data.length-visible.length}`:`Show more · ${data.length-visible.length} remaining`}</button></div>}
 </>;
}
