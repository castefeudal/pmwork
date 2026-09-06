import {notFound} from 'next/navigation';
import Link from 'next/link';
import {templates} from '@/content/catalog';
import {templateExamples} from '@/content/template-examples';
import {templatePractice} from '@/content/template-practice';
import {PublicHeader} from '@/components/public-header';
import {Footer} from '@/components/footer';
import {TemplateApply} from '@/components/template-apply';
import type {Locale} from '@/domain/schemas';

export function generateStaticParams(){return ['ru','en'].flatMap(locale=>templates.map(t=>({locale,slug:t.slug})))}

export default async function Page({params}:{params:Promise<{locale:string;slug:string}>}){
 const {locale,slug}=await params;if(locale!=='ru'&&locale!=='en')notFound();
 const t=templates.find(x=>x.slug===slug);if(!t)notFound();
 const l=locale as Locale,ru=l==='ru',practice=templatePractice[t.slug],example=templateExamples[t.slug]?.[l];
 return <div className="catalog-layout"><PublicHeader locale={l}/><main id="main">
  <header className="catalog-hero"><p className="eyebrow">PMWORK · {ru?'шаблон':'template'}</p><h1>{t.title[l]}</h1><p className="lead">{t.purpose[l]}</p><div className="button-row"><TemplateApply template={t} locale={l}/><Link className="button" href={`/${l}/templates/`}>{ru?'Все шаблоны':'All templates'}</Link></div></header>
  <div className="public-container article-layout"><article className="article-body">
   <section><h2>{ru?'Что получится':'Expected output'}</h2><p>{t.purpose[l]}</p></section>
   <section><h2>{ru?'Когда использовать':'When to use'}</h2><p>{t.when[l]}</p></section>
   <section><h2>{ru?'Сколько времени':'Time guide'}</h2><p>{practice?.[4]} {ru?'минут — ориентир при подготовленных входных данных.':'minutes as a guide when inputs are ready.'}</p></section>
   <section><h2>{ru?'Что подготовить и заполнить':'Inputs and fields'}</h2><ol>{t.fields.map(f=><li key={f[l]}>{f[l]}</li>)}</ol></section>
   <section><h2>{ru?'Как заполнять':'Guidance'}</h2><p>{t.guidance[l]}</p></section>
   <section><h2>{ru?'Типичная ошибка':'Common mistake'}</h2><p>{t.antiPattern[l]}</p></section>
   {example&&<section><h2>{ru?'Заполненный пример':'Completed example'}</h2><p>{example}</p><p className="muted">{ru?'Пример использует вымышленные данные.':'Example uses fictional data.'}</p></section>}
  </article><aside className="article-aside panel"><h2>{ru?'Следующий шаг':'Next step'}</h2><p>{ru?'Примените шаблон к конкретному проекту: PMWORK создаст документ, который можно открыть, изменить и экспортировать.':'Apply the template to a specific project. PMWORK creates an editable, exportable document.'}</p><TemplateApply template={t} locale={l}/></aside></div>
 </main><Footer locale={l}/></div>
}
