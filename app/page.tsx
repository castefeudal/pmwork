import "./entry-portal.css";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Send } from "lucide-react";
import { Brand } from "@/components/brand";

/** The entry's own engineering plate: contours, a route and decision nodes. */
function EntryAtlas() {
  return <svg className="portal-atlas" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
    <defs><pattern id="entry-survey-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" className="portal-atlas-grid" /></pattern></defs>
    <rect width="600" height="400" fill="url(#entry-survey-grid)" />
    <g className="portal-contours">{Array.from({length:9},(_,i)=><path key={i} d={`M${-80+i*20} 410C${-10+i*19} ${210-i*9} ${160+i*12} ${360-i*16} ${220+i*10} ${180-i*8}S${440+i*14} ${140-i*10} 640 ${-80+i*20}`} />)}</g>
    <g className="portal-survey"><circle cx="308" cy="201" r="138"/><circle cx="308" cy="201" r="93" strokeDasharray="2 7"/><path d="M308 27V375M126 201H490"/><path d="m293 27 15 8 15-8M293 375l15-8 15 8"/></g>
    <g className="portal-atlas-secondary"><path d="M80 282V112H202L308 201V335H510"/><path d="M308 201 414 282H522"/><path d="M202 112V62H348" strokeDasharray="4 5"/></g>
    <path className="portal-atlas-route" d="M52 282H166L248 201H380L488 94H548" />
    <g className="portal-atlas-nodes">{[[52,282],[166,282],[248,201],[380,201],[488,94],[548,94]].map(([x,y])=><circle key={x} cx={x} cy={y} r={x===248?7:4} />)}</g>
    <circle className="portal-atlas-center" cx="248" cy="201" r="19"/><circle className="portal-atlas-center" cx="488" cy="94" r="12"/>
    <g className="portal-atlas-labels"><text x="52" y="307">01 / SIGNAL</text><text x="257" y="176">02 / DECISION</text><text x="456" y="70">03 / ACTION</text><text x="433" y="360">04 / CONTROL</text><text x="52" y="53">N 53° 54′</text><text x="490" y="383">E 27° 34′</text></g>
    <g className="portal-route-tag"><rect x="353" y="224" width="145" height="31" rx="3"/><circle cx="368" cy="240" r="3"/><text x="381" y="244">A CLEAR WAY FORWARD</text></g>
  </svg>;
}

const languages = [
  {code:"RU",name:"Русский",detail:"Начать на русском",href:"/ru",lang:"ru"},
  {code:"EN",name:"English",detail:"Continue in English",href:"/en",lang:"en"},
];

export default function RootPage() {
  return <main className="entry-portal">
    <header className="portal-header"><Brand /><span className="portal-descriptor" lang="en">THE PROJECT MANAGEMENT ATLAS</span><span className="portal-local" lang="en"><i aria-hidden="true" /> Local first. Yours.</span></header>
    <section className="portal-hero" aria-labelledby="entry-title">
      <div className="portal-heading"><p className="portal-eyebrow" lang="en"><span>CLARITY FOR COMPLEX WORK</span><span className="portal-edition">PM / 01</span></p><h1 id="entry-title" lang="en">PMWORK<span className="portal-period">.</span></h1></div>
      <div className="portal-narrative"><p className="portal-statement">Сложная работа.<br /><span>Ясный маршрут.</span></p><p className="portal-translation" lang="en">Complex work. A clear way forward.</p><p className="portal-summary">Проекты, сроки, решения и риски.<br /><span lang="en">Projects, deadlines, decisions & risks.</span></p></div>
      <figure className="portal-map"><div className="portal-map-header" lang="en"><span><i aria-hidden="true" /> OPERATIONAL ATLAS</span><span>FIELD NOTES / 001</span></div><EntryAtlas /><figcaption className="portal-map-caption" lang="en"><span>SIGNAL</span><span>DECISION</span><span>ACTION</span><span>CONTROL</span></figcaption><span className="portal-map-cross portal-map-cross-top" aria-hidden="true">+</span><span className="portal-map-cross portal-map-cross-bottom" aria-hidden="true">+</span></figure>
    </section>
    <section className="portal-choice" aria-labelledby="portal-choice-title"><div className="portal-choice-heading"><h2 id="portal-choice-title">Выберите язык <span lang="en">/ Choose your language</span></h2><span className="portal-choice-note" lang="en">YOUR NEXT CHAPTER <ArrowUpRight size={14} aria-hidden="true" /></span></div>
      <div className="portal-languages">{languages.map(item=><Link className="portal-language" key={item.code} href={item.href} lang={item.lang}><span className="portal-language-code" aria-hidden="true">{item.code}</span><span className="portal-language-copy"><strong>{item.name}</strong><small>{item.detail}</small></span><span className="portal-language-arrow"><ArrowRight aria-hidden="true" size={22} /></span></Link>)}</div>
    </section>
    <footer className="portal-footer"><div className="portal-credit"><span lang="en">AN INDEPENDENT TOOL. A CONSIDERED APPROACH.</span><span lang="en">MADE BY <strong>MARKOVMADE</strong></span></div><a className="portal-contact" href="https://t.me/markovmade" target="_blank" rel="noopener noreferrer" aria-label="Связаться с автором / Contact the creator — @markovmade, Telegram"><Send size={18} aria-hidden="true" /><span><span>Связаться с автором <span lang="en">/ Contact the creator</span></span><strong>@markovmade</strong></span><ArrowUpRight size={17} aria-hidden="true" /></a></footer>
  </main>;
}
