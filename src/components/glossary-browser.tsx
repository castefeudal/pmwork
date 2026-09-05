"use client";
import Link from 'next/link';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import type { Locale } from '@/domain/schemas';
import { glossaryCategories, type GlossaryTerm } from '@/content/glossary';
import { WorkspaceMore } from './workspace-more';
export function GlossaryDetail({term, terms, locale}: {term:GlossaryTerm; terms:GlossaryTerm[]; locale:Locale}) {
 const ru=locale==='ru';
 return <article className="glossary-detail">
  <p className="eyebrow">{term.acronym} · {ru?({foundation:'Основы',practitioner:'Практик',advanced:'Продвинутый'})[term.level]:term.level}</p><h1>{term.term}</h1><h2>{term.ruTerm}</h2>
  <p className="lead">{term.definition[locale]}</p>
  <h3>{ru?'Пример':'Example'}</h3><p>{term.example[locale]}</p>
  <h3>{ru?'Почему важно':'Why it matters'}</h3><p>{term.whyItMatters[locale]}</p>
  <h3>{ru?'Когда применяется':'When used'}</h3><p>{term.whenUsed[locale]}</p>
  {term.aliases.length>0&&<p><strong>{ru?'Также ищут: ':'Also known as: '}</strong>{term.aliases.join(' · ')}</p>}
  {(['confusedWith','related'] as const).map(key=>term[key].length>0&&<section key={key}><h3>{key==='confusedWith'?(ru?'Не путать с':'Do not confuse with'):(ru?'Связанные термины':'Related terms')}</h3><div className="button-row">{term[key].map(id=><Link className="button small" key={id} href={`/${locale}/glossary/${id}/`}>{terms.find(t=>t.slug===id)?.[ru?'ruTerm':'term']}</Link>)}</div></section>)}
  <h3>{ru?'Применить в проекте':'Use in your project'}</h3><div className="button-row">{term.workspaceLinks.map(view=><Link className="button" key={view} href={`/${locale}/workspace/?view=${view}`}>{ru?'Открыть рабочий раздел':'Open workspace section'}</Link>)}</div>
  <div className="button-row">{term.templateLinks.map(id=><Link key={id} className="button small" href={`/${locale}/templates/?q=${id.split('-').join(' ')}`}>{ru?'Связанный шаблон':'Related template'}</Link>)}{term.toolLinks.map(id=><Link key={id} className="button small" href={`/${locale}/tools/?tool=${id}`}>{ru?'Открыть инструмент':'Open tool'}</Link>)}</div>
  <p className="muted">{ru?'Оригинальное объяснение PMWORK. Проверено: ':'Original PMWORK explanation. Reviewed: '}{new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(term.reviewedAt))}</p>
 </article>;
}
export function GlossaryBrowser({terms,locale}: {terms:GlossaryTerm[];locale:Locale}) {
 const ru=locale==='ru';const [query,setQuery]=useState(''),[category,setCategory]=useState('all'),[level,setLevel]=useState('all'),[letter,setLetter]=useState(''),[selected,setSelected]=useState<GlossaryTerm|null>(null);
 const index=useMemo(()=>new Fuse(terms,{keys:[{name:'term',weight:3},{name:'ruTerm',weight:3},'acronym','aliases'],threshold:.32,ignoreLocation:true}),[terms]);
 const results=(query.trim()?index.search(query).map(x=>x.item):terms).filter(t=>(category==='all'||t.category===category)&&(level==='all'||t.level===level)&&(!letter||t.term.startsWith(letter))).sort((a,b)=>query?0:a.term.localeCompare(b.term));
 return <section className="public-container glossary-browser">
  <p className="eyebrow">PMWORK · {terms.length}</p><h1>{ru?'Глоссарий управления проектами':'Project management glossary'}</h1>
  <label className="glossary-search">{ru?'Найти термин':'Find a term'}<input className="input" type="search" placeholder="WBS, ИСР, critical path…" value={query} onChange={e=>{setQuery(e.target.value);setLetter('');}}/></label>
  <div className="glossary-layout"><aside className="glossary-categories" aria-label={ru?'Категории':'Categories'}><button className="button" aria-pressed={category==='all'} onClick={()=>setCategory('all')}>{ru?'Все категории':'All categories'}</button>{glossaryCategories.map(c=><button className="button" key={c[0]} aria-pressed={category===c[0]} onClick={()=>setCategory(c[0])}>{c[ru?1:2]}</button>)}</aside>
   <div><label>{ru?'Уровень применения':'Guidance level'}<select className="input" value={level} onChange={e=>setLevel(e.target.value)}>{[['all','Все','All'],['foundation','Основы','Foundation'],['practitioner','Практик','Practitioner'],['advanced','Продвинутый','Advanced']].map(l=><option value={l[0]} key={l[0]}>{l[ru?1:2]}</option>)}</select></label>
    <nav className="alphabet" aria-label="A–Z"><button aria-pressed={!letter} onClick={()=>setLetter('')}>{ru?'Все':'All'}</button>{'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=><button key={l} aria-pressed={letter===l} onClick={()=>setLetter(l)}>{l}</button>)}</nav>
    <p role="status">{ru?'Найдено':'Results'}: {results.length}</p>
    <div className="glossary-results">{results.map(t=><button className="glossary-row" key={t.slug} onClick={()=>setSelected(t)} aria-haspopup="dialog"><strong>{t.term}</strong><span>{t.ruTerm}</span><span>{t.plainLanguage[locale]}</span>{t.acronym&&<small>{t.aliases.find(a=>/[a-z]/i.test(a)&&a.includes(' '))}</small>}<small>{glossaryCategories.find(c=>c[0]===t.category)?.[ru?1:2]} · {ru?({foundation:"Основы",practitioner:"Практик",advanced:"Продвинутый"})[t.level]:t.level}</small></button>)}</div>
    {!results.length&&<p>{ru?'Попробуйте другой термин или сбросьте фильтры.':'Try another term or clear the filters.'}</p>}
   </div>
  </div>
  {selected&&<WorkspaceMore title={selected.term} onClose={()=>setSelected(null)}><GlossaryDetail term={selected} terms={terms} locale={locale}/><Link className="button" href={`/${locale}/glossary/${selected.slug}/`}>{ru?'Открыть страницу термина':'Open term page'}</Link></WorkspaceMore>}
 </section>;
}
