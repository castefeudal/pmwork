"use client";
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {BookOpen,Search} from 'lucide-react';
import {useUrlValue} from './use-url-state';
import {PlaybookAction} from './playbook-action';
import {knowledgeGuides} from '@/content/knowledge';
import type {Locale} from '@/domain/schemas';
import type {Bi,Playbook} from '@/content/catalog';
const pick=(value:Bi,locale:Locale)=>value[locale];
export function CatalogPage({kind,locale,records}:{kind:'playbooks'|'knowledge';locale:Locale;records:{playbooks?:Playbook[];knowledgeDomains?:Bi[]}}){
 const {playbooks=[],knowledgeDomains=[]}=records,ru=locale==='ru';
 const [query,setQuery]=useUrlValue('q'),[limit,setLimit]=useState(12);
 const data=useMemo(()=>{const q=query.toLowerCase();return kind==='playbooks'?playbooks.filter(x=>`${x.title[locale]} ${x.diagnose[0][locale]}`.toLowerCase().includes(q)):knowledgeDomains.filter(x=>`${x[locale]} ${knowledgeGuides[x.en]?.summary[locale]}`.toLowerCase().includes(q))},[kind,query,locale,playbooks,knowledgeDomains]);
 const visible=data.slice(0,query?Math.max(limit,12):limit);
 return <><header className="catalog-hero"><p className="eyebrow">PMWORK · {kind==='playbooks'?(ru?'сценарии':'playbooks'):(ru?'знания':'knowledge')}</p><h1>{kind==='playbooks'?(ru?'Практические сценарии руководителя проекта':'PM playbooks'):(ru?'База знаний':'Knowledge base')}</h1><p className="lead">{kind==='playbooks'?(ru?'Найдите наблюдаемую проблему, проверьте причины и выберите ближайшее действие.':'Find the observed problem, check its causes and choose the next action.'):(ru?'Практические объяснения: что проверить, какой результат получить и где продолжить работу.':'Practical explanations: what to check, what output to produce and where to continue working.')}</p><div className="catalog-controls"><label className="search-input"><Search size={18}/><span className="sr-only">{ru?'Поиск':'Search'}</span><input className="input" value={query} onChange={e=>{setQuery(e.target.value);setLimit(12)}} placeholder={ru?'Найти по названию или смыслу…':'Search by title or meaning…'}/></label><span className="pill">{data.length} {ru?'материалов':'items'}</span></div></header>
      {kind === "knowledge" && <section className="public-container"><h2>{ru ? "Основы: путь от цели до закрытия" : "Foundation: from purpose to closure"}</h2><ol className="learning-path">{["Fundamentals","Value","Scope","Requirements","Schedule","Risk","Stakeholders","Governance","Closure"].map(domain => <li key={domain}><button className="button" onClick={() => setQuery(knowledgeDomains.find(d => d.en === domain)?.[locale] ?? domain)}>{knowledgeDomains.find(d => d.en === domain)?.[locale]}</button></li>)}</ol></section>}
<section id="catalog-results" className="catalog-grid" aria-live="polite">        {kind === "playbooks" &&
          (visible as typeof playbooks).map((x) => (
            <article className="catalog-card" key={x.slug}>
              <span className="pill">
                {ru
                  ? "Диагностика → действие → стабилизация"
                  : "Diagnose → Act → Stabilize"}
              </span>
              <h2>{pick(x.title, locale)}</h2>
              <PlaybookAction playbook={x} locale={locale}/>
              <p>
                <strong>{ru ? "Диагностика" : "Diagnose"}:</strong>{" "}
                {pick(x.diagnose[0]!, locale)}
              </p>
              <details>
                <summary>
                  {ru ? "Открыть практический сценарий" : "Open playbook"}
                </summary>
                <h3>{ru ? "Сразу" : "Immediate"}</h3>
                <ol>
                  {x.immediate.map((y) => (
                    <li key={pick(y, locale)}>{pick(y, locale)}</li>
                  ))}
                </ol>
                <h3>{ru ? "Следующий цикл" : "Next working cycle"}</h3>
                <p>{pick(x.next[0]!, locale)}</p>
                <h3>{ru ? "Стабилизировать" : "Stabilize"}</h3>
                <p>{pick(x.stabilize[0]!, locale)}</p>
                <h3>{ru ? "Предотвратить" : "Prevent recurrence"}</h3>
                <p>{pick(x.prevent[0]!, locale)}</p>
                <h3>{ru ? "Метрики" : "Metrics"}</h3>
                <ul>
                  {x.metrics.map((y) => (
                    <li key={pick(y, locale)}>{pick(y, locale)}</li>
                  ))}
                </ul>
                <h3>{ru ? "Типичные ошибки" : "Anti-patterns"}</h3>
                <ul>
                  {x.antiPatterns.map((y) => (
                    <li key={pick(y, locale)}>{pick(y, locale)}</li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        {kind === "knowledge" &&
          (visible as typeof knowledgeDomains).map((x) => {
            const guide = knowledgeGuides[x.en];
            return <article className="catalog-card" key={x.en}>
              <BookOpen size={22} />
              <h2>{pick(x, locale)}</h2>
              <p>{pick(guide.summary, locale)}</p>
              <details>
                <summary>{ru ? "Применить на практике" : "Put into practice"}</summary>
                <h3>{ru ? "Порядок действий" : "Steps"}</h3>
                <p>{pick(guide.steps, locale)}</p>
                <h3>{ru ? "Результат" : "Output"}</h3>
                <p>{pick(guide.output, locale)}</p>
                <h3>{ru ? "Типичная ошибка" : "Failure mode"}</h3>
                <p>{pick(guide.mistake, locale)}</p>
                <p className="muted compact">{ru ? "Практическая рекомендация PMWORK. Адаптируйте к масштабу проекта и обязательным правилам вашей организации." : "PMWORK practical guidance. Adapt to project scale and your organization’s mandatory rules."}</p>
              </details>
              <div className="button-row">
                <Link className="button small" href={`/${locale}/workspace/?view=${guide.view}`}>{ru ? "Открыть рабочий модуль" : "Open working module"}</Link>
                <Link className="button small" href={`/${locale}/templates/`}>{ru ? "Шаблоны" : "Templates"}</Link>
              </div>
            </article>;
          })}
{!data.length&&<div className="empty-state"><h2>{ru?'Ничего не найдено':'No matches'}</h2><p>{ru?'Для этого запроса нет материалов. Попробуйте более короткое описание проблемы.':'No material matches this query. Try a shorter problem description.'}</p><button className="button" onClick={()=>setQuery('')}>{ru?'Очистить поиск':'Clear search'}</button></div>}</section>{visible.length<data.length&&<div className="public-container button-row"><button className="button" onClick={()=>setLimit(n=>n+12)}>{ru?`Показать ещё · осталось ${data.length-visible.length}`:`Show more · ${data.length-visible.length} remaining`}</button></div>}</>;
}
