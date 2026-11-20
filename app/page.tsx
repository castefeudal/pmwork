import "./entry-portal.css";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Compass, Send } from "lucide-react";
import { Brand } from "@/components/brand";

import { AtlasPicture } from "@/components/atlas-picture";

const languages = [
  {code:"RU",name:"Русский",detail:"Начать на русском",href:"/ru",lang:"ru"},
  {code:"EN",name:"English",detail:"Continue in English",href:"/en",lang:"en"},
];

export default function RootPage() {
  return <div className="entry-cover">
    <AtlasPicture scene="entry" className="portal-backdrop" />
    <main className="entry-portal">
    <header className="portal-header"><Brand /><span className="portal-descriptor" lang="en">THE PROJECT MANAGEMENT ATLAS</span><span className="portal-local" lang="en"><i aria-hidden="true" /> Local first. Yours.</span></header>
    <section className="portal-hero" aria-labelledby="entry-title">
      <div className="portal-heading"><p className="portal-eyebrow" lang="en">CLARITY FOR COMPLEX WORK</p><h1 id="entry-title" lang="en">PMWORK<span className="portal-period">.</span></h1></div>
      <div className="portal-narrative"><p className="portal-statement">Сложная работа.<br /><span>Ясный маршрут.</span></p><p className="portal-translation" lang="en">Complex work. A clear way forward.</p><p className="portal-summary">Проекты, сроки, решения и риски.<br /><span lang="en">Projects, deadlines, decisions & risks.</span></p></div>
      <div className="portal-map" aria-hidden="true"><div className="portal-map-key"><Compass size={20} strokeWidth={1.5} /><span>OPERATIONAL ATLAS</span></div></div>
    </section>
    <section className="portal-choice" aria-labelledby="portal-choice-title"><div className="portal-choice-heading"><h2 id="portal-choice-title">Выберите язык <span lang="en">/ Choose your language</span></h2></div>
      <div className="portal-languages">{languages.map(item=><Link className="portal-language" key={item.code} href={item.href} lang={item.lang}><span className="portal-language-code" aria-hidden="true">{item.code}</span><span className="portal-language-copy"><strong>{item.name}</strong><small>{item.detail}</small></span><span className="portal-language-arrow"><ArrowRight aria-hidden="true" size={22} /></span></Link>)}</div>
    </section>
    <footer className="portal-footer"><div className="portal-credit"><span lang="en">MADE BY <strong>MARKOVMADE</strong></span></div><a className="portal-contact" href="https://t.me/markovmade" target="_blank" rel="noopener noreferrer" aria-label="Связаться с автором / Contact the creator — @markovmade, Telegram"><Send size={18} aria-hidden="true" /><span><span>Связаться с автором <span lang="en">/ Contact the creator</span></span><strong>@markovmade</strong></span><ArrowUpRight size={17} aria-hidden="true" /></a></footer>
    </main>
  </div>;
}
