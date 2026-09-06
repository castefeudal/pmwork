import { publicMetadata } from "@/domain/public-metadata";
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {methods,sources} from '@/content/catalog';
import {PublicHeader} from '@/components/public-header';
import {Footer} from '@/components/footer';
import type {Locale} from '@/domain/schemas';

export function generateStaticParams(){return ['ru','en'].flatMap(locale=>methods.map(m=>({locale,slug:m.slug})))}

export default async function Page({params}:{params:Promise<{locale:string;slug:string}>}){
 const {locale,slug}=await params;if(locale!=='ru'&&locale!=='en')notFound();
 const m=methods.find(x=>x.slug===slug);if(!m)notFound();const l=locale as Locale,ru=l==='ru';
 return <div className="catalog-layout"><PublicHeader locale={l}/><main id="main">
  <header className="catalog-hero"><p className="eyebrow">PMWORK · {ru?'метод':'method'}</p><h1>{m.title[l]}</h1><p className="lead">{m.summary[l]}</p><div className="button-row"><Link className="button primary" href={`/${l}/tools/?tool=fit`}>{ru?'Проверить совместимость с проектом':'Check project fit'}</Link><Link className="button" href={`/${l}/methods/`}>{ru?'Все методы':'All methods'}</Link></div></header>
  <div className="public-container article-layout"><article className="article-body">
   <section><h2>{ru?'Что решает':'What it solves'}</h2><p>{m.flow[l]}</p></section>
   <section><h2>{ru?'Подходит, если':'Good fit when'}</h2><p>{m.bestFit[l]}</p></section>
   <section><h2>{ru?'Не подходит / ограничения':'Poor fit / limitations'}</h2><p>{m.poorFit[l]}</p>{m.limitations[l]!==m.poorFit[l]&&<p>{m.limitations[l]}</p>}</section>
   <section><h2>{ru?'Что должно быть подготовлено':'Prerequisites'}</h2><p>{m.prerequisites[l]}</p></section>
   <section><h2>{ru?'Минимальная рабочая версия':'Minimum implementation'}</h2><ol>{m.checklist.map(x=><li key={x[l]}>{x[l]}</li>)}</ol><p className="muted">{ru?'Это практическая минимальная конфигурация PMWORK, а не дополнительное требование владельца метода.':'This is a PMWORK practical minimum, not an additional requirement from the method owner.'}</p></section>
   <section><h2>{ru?'Полная операционная модель':'Full operating model'}</h2><h3>{ru?'Роли':'Roles'}</h3><p>{m.roles[l]}</p><h3>{ru?'Артефакты':'Artifacts'}</h3><p>{m.artifacts[l]}</p><h3>{ru?'Каденция':'Cadence'}</h3><p>{m.cadence[l]}</p><h3>{ru?'Метрики':'Metrics'}</h3><p>{m.metrics[l]}</p></section>
   <section><h2>{ru?'Типичная ошибка':'Common mistake'}</h2><p>{m.antiPatterns[l]}</p></section>
   <section><h2>{ru?'Как адаптировать':'Tailoring'}</h2><p>{m.tailoring[l]}</p></section>
   <section><h2>{ru?'Сочетания':'Combinations'}</h2><p>{m.combinations[l]}</p></section>
   <section><h2>{ru?'Источники':'Sources'}</h2><ul>{m.sourceIds.map(id=>{const s=sources.find(x=>x.id===id);return s?<li key={id}><a href={s.url} target="_blank" rel="noreferrer">{s.organization} · {s.title} · {s.version}</a></li>:null})}</ul></section>
  </article><aside className="article-aside panel"><h2>{ru?'Использовать в проекте':'Use in a project'}</h2><p>{ru?'Сначала проверьте контекст. Высокий score означает близость профиля проекта к допущениям подхода, а не прогноз успеха.':'Check context first. A high score means the project profile is close to the approach assumptions; it is not a success forecast.'}</p><Link className="button primary" href={`/${l}/tools/?tool=fit`}>{ru?'Сравнить подходы':'Compare approaches'}</Link><Link className="button" href={`/${l}/templates/`}>{ru?'Подобрать рабочий шаблон':'Choose a working template'}</Link></aside></div>
 </main><Footer locale={l}/></div>
}

export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}) {
 const {locale,slug}=await params; const record=methods.find(x=>x.slug===slug); if(!record||(locale!=="ru"&&locale!=="en")) return {};
 return publicMetadata(locale,`methods/${slug}`,record.title[locale],record.summary[locale]);
}
