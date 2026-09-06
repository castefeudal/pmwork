"use client";
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Search} from 'lucide-react';
import {methods} from '@/content/catalog';
import type {Locale} from '@/domain/schemas';

export function MethodHub({locale}:{locale:Locale}){
 const ru=locale==='ru',[query,setQuery]=useState('');
 const data=useMemo(()=>{const q=query.trim().toLowerCase();return methods.filter(m=>!q||`${m.title.ru} ${m.title.en} ${m.summary.ru} ${m.summary.en} ${m.bestFit.ru} ${m.bestFit.en}`.toLowerCase().includes(q))},[query]);
 return <>
  <header className="catalog-hero"><p className="eyebrow">PMWORK · {ru?'методы':'methods'}</p><h1>{ru?'Выберите способ работы по контексту':'Choose an approach by context'}</h1><p className="lead">{ru?'Метод — не знак зрелости. Сравнивайте его допущения с изменчивостью требований, сроками, зависимостями и доступностью обратной связи.':'A method is not a maturity badge. Compare its assumptions with volatility, deadlines, dependencies and feedback access.'}</p><div className="catalog-controls"><label className="field"><span className="sr-only">{ru?'Поиск':'Search'}</span><span className="search-input"><Search size={18}/><input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder={ru?'Например: Scrum, Kanban, жёсткий срок…':'For example: Scrum, Kanban, fixed deadline…'}/></span></label><span className="pill">{data.length} {ru?'методов':'methods'}</span></div></header>
  <section className="public-container panel"><h2>{ru?'Не знаете, что выбрать?':'Not sure what fits?'}</h2><p>{ru?'Используйте сравнение контекста: результат — это совместимость профиля, а не вероятность успеха.':'Use the context-fit tool. Its score represents profile compatibility, not probability of success.'}</p><Link className="button primary" href={`/${locale}/tools/?tool=fit`}>{ru?'Сравнить подходы по проекту':'Compare approaches for a project'}</Link></section>
  <section className="catalog-grid">{data.map(m=><article className="catalog-card" key={m.slug}><span className="pill">{m.version}</span><h2>{m.title[locale]}</h2><p>{m.summary[locale]}</p><p><strong>{ru?'Лучший контекст':'Best fit'}:</strong> {m.bestFit[locale]}</p><p className="muted compact"><strong>{ru?'Ограничение':'Limitation'}:</strong> {m.limitations[locale]}</p><Link className="button primary small" href={`/${locale}/methods/${m.slug}/`}>{ru?'Разобрать метод':'Open method'}</Link></article>)}</section>
 </>;
}
