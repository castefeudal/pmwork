"use client";
import {useState} from 'react';
import {useDialogFocus} from './use-dialog-focus';
import {ContextFields} from './context-fields';
import {defaultContext,contextQuestions} from '@/content/project-context';
import {starterPacks,starterText} from '@/content/starter-packs';
import {scoreApproaches,governanceLevel,type Context} from '@/domain/method-fit';
import {displayLabel} from '@/content/workspace-i18n';
import type {Locale} from '@/domain/schemas';

const coreContextKeys:(keyof Context)[]=['volatility','deadlineRigidity','dependencies','compliance'];
const extraContextKeys=(Object.keys(contextQuestions) as (keyof Context)[]).filter(k=>!coreContextKeys.includes(k));

export function ProjectSetup({locale,onClose,onSubmit}:{locale:Locale;onClose:()=>void;onSubmit:(fd:FormData)=>void}){
 const ru=locale==='ru',ref=useDialogFocus(),[step,setStep]=useState(1),[context,setContext]=useState(defaultContext),[pack,setPack]=useState(''),[objective,setObjective]=useState(''),[advancedBasics,setAdvancedBasics]=useState(false),[advancedContext,setAdvancedContext]=useState(false);
 const example=starterText(pack,locale),fit=scoreApproaches(context)[0],reasons=fit.reasons.slice(0,3);
 const planning=context.volatility>=4?(ru?'Планируйте подробно на 1–2 недели, дальше — крупными контрольными точками.':'Plan 1–2 weeks in detail, then use broader milestones.'):(ru?'Детализируйте план до следующей контрольной точки.':'Plan in detail to the next milestone.');
 const control=context.dependencies>=4?(ru?'Проверяйте межкомандные передачи минимум дважды в неделю.':'Review cross-team handoffs at least twice a week.'):(ru?'Проводите еженедельный обзор сроков, рисков и решений.':'Review schedule, risks and decisions weekly.');
 return <div className="dialog-backdrop"><section className="dialog" ref={ref} role="dialog" aria-modal="true" aria-label={ru?'Создать проект':'Create project'} tabIndex={-1}>
  <div className="page-title"><div><h2>{ru?'Создать проект':'Create project'}</h2><p className="muted">{ru?'Три шага до рабочего контура проекта.':'Three steps to a usable project setup.'}</p></div><button className="button" onClick={onClose}>{ru?'Закрыть':'Close'}</button></div>
  <p role="status" className="setup-progress">{step}/3 · {step===1?(ru?'Результат':'Outcome'):step===2?(ru?'Как устроен проект':'Project context'):(ru?'Рабочий режим':'Operating mode')}</p>
  <form action={onSubmit} onKeyDown={e=>{if(e.key==='Enter'&&step<3&&(e.target as HTMLElement).tagName!=='TEXTAREA')e.preventDefault()}}>
   <fieldset hidden={step!==1} className="setup-fields"><legend>{ru?'Что должно измениться благодаря проекту?':'What should change because of this project?'}</legend><div className="form-grid">
    <label className="field">{ru?'Название проекта':'Project title'}<input name="title" required minLength={2}/></label>
    <label className="field">{ru?'Тип / пример (необязательно)':'Type / example (optional)'}<select value={pack} onChange={e=>{setPack(e.target.value);const p=starterText(e.target.value,locale);if(p)setObjective(p[1])}}><option value="">{ru?'Свой проект':'Custom project'}</option>{starterPacks.map(p=><option key={p.id} value={p.id}>{p[locale][0]}</option>)}</select></label>
    <input type="hidden" name="projectType" value={starterPacks.find(p=>p.id===pack)?.type??'general'}/>
    <label className="field wide">{ru?'Измеримый результат':'Measurable outcome'}<textarea name="objective" value={objective} onChange={e=>setObjective(e.target.value)} required placeholder={ru?'Например: запустить новую версию к 30 сентября и перевести 80% активных пользователей':'Example: launch the new version by 30 September and migrate 80% of active users'}/></label>
    <label className="field">{ru?'Целевая дата (необязательно)':'Target date (optional)'}<input name="dueDate" type="date"/></label>
    <label className="field">{ru?'Моя роль / владелец':'My role / owner'}<input name="owner" placeholder={ru?'Например: Project Manager':'Example: Project Manager'}/></label>
   </div>
   <details open={advancedBasics} onToggle={e=>setAdvancedBasics((e.currentTarget as HTMLDetailsElement).open)}><summary>{ru?'Дополнительные параметры':'Additional parameters'}</summary><div className="form-grid"><label className="field">{ru?'Спонсор':'Sponsor'}<input name="sponsor"/></label><label className="field">{ru?'Валюта':'Currency'}<input name="currency" defaultValue="USD"/></label><label className="field wide">{ru?'Критерии успеха — по одному на строку':'Success measures — one per line'}<textarea name="successMeasures"/></label></div></details>
   {example&&<details><summary>{ru?'Посмотреть пример и адаптировать':'Inspect example and adapt'}</summary>{example.slice(2).map((line,i)=><p key={i}>{line}</p>)}</details>}
   </fieldset>
   <fieldset hidden={step!==2} className="setup-fields"><legend>{ru?'Как устроен проект?':'How is the project shaped?'}</legend><p>{ru?'Четырёх ответов достаточно для первой рекомендации. Среднее значение можно оставить и уточнить позже.':'Four answers are enough for a first recommendation. Midpoint values can be refined later.'}</p>
    <ContextFields value={context} onChange={setContext} locale={locale} keys={coreContextKeys}/>
    <details open={advancedContext} onToggle={e=>setAdvancedContext((e.currentTarget as HTMLDetailsElement).open)}><summary>{ru?'Уточнить ещё 6 параметров':'Refine 6 more dimensions'}</summary><ContextFields value={context} onChange={setContext} locale={locale} prefix="context-extra" keys={extraContextKeys}/></details>
    {(Object.keys(context) as (keyof Context)[]).filter(k=>!coreContextKeys.includes(k)&&!advancedContext).map(k=><input key={k} type="hidden" name={k} value={context[k]}/>)}
   </fieldset>
   <fieldset hidden={step!==3} className="setup-fields"><legend>{ru?'Рекомендуемый рабочий режим':'Recommended operating mode'}</legend>
    <div className="recommendation-card"><p className="eyebrow">{ru?'Совместимость контекста':'Context compatibility'} · {fit.score}/100</p><h3>{displayLabel(locale,'approach',fit.approach)}</h3><p>{displayLabel(locale,'governance',governanceLevel(context).toLowerCase())}</p></div>
    <h3>{ru?'Почему':'Why'}</h3><ul>{reasons.map(k=><li key={k}>{contextQuestions[k][locale][0]} — {context[k]}/5</li>)}</ul>
    <h3>{ru?'Как планировать':'How to plan'}</h3><p>{planning}</p>
    <h3>{ru?'Как контролировать':'How to control'}</h3><p>{control}</p>
    <h3>{ru?'С чего начать':'Start with'}</h3><ol><li>{ru?'Зафиксировать результат и критерий успеха.':'Confirm the outcome and success measure.'}</li><li>{ru?'Создать ближайшую контрольную точку.':'Create the next milestone.'}</li><li>{ru?'Добавить ближайшую работу и владельца.':'Add the next work item and owner.'}</li></ol>
    <p className="muted">{ru?'Совместимость — это соответствие контекста профилю подхода, а не вероятность успеха проекта.':'Compatibility measures fit to an approach profile, not probability of project success.'}</p>
   </fieldset>
   <div className="button-row">{step>1&&<button type="button" className="button" onClick={()=>setStep(step-1)}>{ru?'Назад':'Back'}</button>}{step<3?<button type="button" className="button primary" onClick={e=>{e.preventDefault();const form=e.currentTarget.form!;if(step===1&&!Array.from(form.querySelectorAll('fieldset')[0].querySelectorAll('input,textarea')).every(el=>(el as HTMLInputElement).reportValidity()))return;setStep(step+1);ref.current?.scrollTo({top:0})}}>{step===2?(ru?'Показать рекомендации':'Show recommendations'):(ru?'Далее':'Next')}</button>:<button key="create-project" className="button primary" type="submit">{ru?'Создать проект и начать':'Create project and start'}</button>}</div>
  </form>
 </section></div>;
}
