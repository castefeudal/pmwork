import "./entry-portal.css";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Send } from "lucide-react";
import { Brand } from "@/components/brand";

function EntryAtlas() {
  return <svg className="portal-atlas" viewBox="0 0 640 520" fill="none" aria-hidden="true">
    <g className="portal-atlas-topography">{[0,1,2,3,4,5].map(i=><path key={i} d={`M${60+i*14} ${342+i*13}C${95+i*16} ${184-i*12} ${222-i*7} ${126+i*10} ${302+i*9} ${158+i*12}S${450+i*8} ${350-i*10} ${570-i*7} ${190+i*25}`} />)}</g>
    <g className="portal-atlas-grid">
      <path d="M40 100H600M40 260H600M40 420H600M160 40V480M320 40V480M480 40V480" />
      <circle cx="320" cy="260" r="190" /><circle cx="320" cy="260" r="130" />
      <ellipse cx="320" cy="260" rx="270" ry="100" transform="rotate(-35 320 260)" />
      <path d="M40 480 600 40M40 40 600 480" strokeDasharray="3 9" />
    </g>
    <g className="portal-atlas-route"><path d="M92 388H190L320 260H438L548 150" /><path d="m536 150h12v12" /></g>
    <g className="portal-atlas-secondary"><path d="M160 100v88l160 72v160M320 260l160 95h80" /></g>
    <g className="portal-atlas-nodes">{[[92,388],[190,388],[320,260],[438,260],[548,150]].map(([cx,cy])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={cx===320?8:4} />)}</g>
    <circle className="portal-atlas-center" cx="320" cy="260" r="23" />
    <g className="portal-atlas-labels"><text x="88" y="419">01 / SIGNAL</text><text x="333" y="238">02 / DECISION</text><text x="467" y="129">03 / ACTION</text><text x="333" y="448">04 / CONTROL</text><text x="42" y="60">OPERATIONAL ATLAS</text><text x="488" y="480">PM / 001</text></g>
  </svg>;
}

export default function RootPage() {
  return <main className="entry-portal">
    <header className="portal-header"><Brand /><span className="portal-descriptor" lang="en">A practical system<br />for complex work.</span><span className="portal-local" lang="en"><i /> Local first. Yours.</span></header>
    <section className="portal-hero" aria-labelledby="entry-title">
      <div className="portal-heading"><p className="portal-eyebrow" lang="en"><span>PROJECT MANAGEMENT</span><span>01 — ENTRY</span></p><h1 id="entry-title" lang="en">PMWORK<span className="portal-period">.</span></h1></div>
      <div className="portal-narrative"><p className="portal-statement">Сложная работа.<br /><span>Ясный маршрут.</span></p><p className="portal-translation" lang="en">Complex work. A clear way forward.</p><p className="portal-summary">Проекты, сроки, решения и риски.<br /><span lang="en">Projects, deadlines, decisions & risks.</span></p></div>
      <div className="portal-map"><EntryAtlas /><span className="portal-map-caption" lang="en">FROM SIGNAL TO ACTION <ArrowUpRight size={14} /></span></div>
    </section>
    <section className="portal-choice" aria-labelledby="portal-choice-title"><div className="portal-choice-heading"><h2 id="portal-choice-title">Выберите язык <span lang="en">/ Choose your language</span></h2><span aria-hidden="true">↙</span></div>
      <div className="portal-languages">{[{code:'RU',name:'Русский',detail:'Перейти к работе',href:'/ru',lang:'ru'},{code:'EN',name:'English',detail:'Enter your workspace',href:'/en',lang:'en'}].map(item=><Link tabIndex={0} className="portal-language" key={item.code} href={item.href} lang={item.lang}><span className="portal-language-code">{item.code}</span><span className="portal-language-copy"><strong>{item.name}</strong><small>{item.detail}</small></span><ArrowRight aria-hidden="true" size={24} /></Link>)}</div>
    </section>
    <footer className="portal-footer"><div className="portal-credit"><span lang="en">MADE BY <strong>MARKOVMADE</strong></span></div><a tabIndex={0} className="portal-contact" href="https://t.me/markovmade" target="_blank" rel="noopener noreferrer" aria-label="Связаться с автором / Contact the creator — @markovmade, Telegram"><Send size={20} aria-hidden="true" /><span><span>Связаться с автором <span lang="en">/ Contact the creator</span></span><strong>@markovmade</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a></footer>
  </main>;
}
