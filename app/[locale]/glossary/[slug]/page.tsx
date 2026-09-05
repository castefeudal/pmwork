import { notFound } from 'next/navigation';
import { glossaryTerms } from '@/content/glossary';
import { GlossaryDetail } from '@/components/glossary-browser';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
export function generateStaticParams(){return ['ru','en'].flatMap(locale=>glossaryTerms.map(t=>({locale,slug:t.slug})));}
export async function generateMetadata({params}:{params:Promise<{locale:string;slug:string}>}) {
 const {locale,slug}=await params; const term=glossaryTerms.find(t=>t.slug===slug);if(!term||(locale!=='ru'&&locale!=='en'))return {};
 const base='https://castefeudal.github.io/pmwork';
 return {title:`${locale==='ru'?term.ruTerm:term.term} — PMWORK`,description:term.definition[locale],alternates:{canonical:`${base}/${locale}/glossary/${slug}/`,languages:{ru:`${base}/ru/glossary/${slug}/`,en:`${base}/en/glossary/${slug}/`}}};
}
export default async function Page({params}:{params:Promise<{locale:string;slug:string}>}){
 const {locale,slug}=await params;const term=glossaryTerms.find(t=>t.slug===slug);if(!term||(locale!=='ru'&&locale!=='en'))notFound();
 const structured={'@context':'https://schema.org','@type':'DefinedTerm',name:locale==='ru'?term.ruTerm:term.term,description:term.definition[locale],termCode:term.acronym,inDefinedTermSet:`https://castefeudal.github.io/pmwork/${locale}/glossary/`};
 return <><PublicHeader locale={locale}/><main id="main" className="public-container"><GlossaryDetail term={term} terms={glossaryTerms} locale={locale}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,'\\u003c')}}/></main><Footer locale={locale}/></>;
}
