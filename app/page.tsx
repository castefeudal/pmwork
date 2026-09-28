import Link from "next/link";
import { ArrowRight, Globe2, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";

export default function RootPage() {
  return (
    <main className="language-gate entry-gate">
      <div className="entry-atmosphere" aria-hidden="true"><span /><span /><span /></div>
      <header className="entry-header"><Brand /><span className="entry-local"><i /> Local-first · Private by design</span></header>
      <section className="entry-story" aria-labelledby="entry-title">
        <p className="eyebrow"><Sparkles size={14} aria-hidden="true" /> THE PROJECT OPERATING SPACE</p>
        <h1 id="entry-title">Make the next move <span>the right one.</span></h1>
        <p className="entry-lead">A clear view of the work, decisions and risks that move your project forward.</p>
      </section>
      <section className="entry-choice" aria-label="Choose your language">
        <div className="entry-choice-heading"><span><Globe2 size={16} aria-hidden="true" /> YOUR WORKSPACE</span><span>RU / EN</span></div>
        <p>Выберите язык интерфейса <span aria-hidden="true">·</span> Choose your language</p>
        <div className="entry-languages">
          <Link className="entry-language" href="/ru"><span className="entry-language-code">RU</span><span><strong>Русский</strong><small>Полный интерфейс и база знаний</small></span><ArrowRight size={19} aria-hidden="true" /></Link>
          <Link className="entry-language" href="/en"><span className="entry-language-code">EN</span><span><strong>English</strong><small>Full interface and knowledge base</small></span><ArrowRight size={19} aria-hidden="true" /></Link>
        </div>
      </section>
      <footer className="entry-footer"><span><i /> READY WHEN YOU ARE</span><span>Clear thinking. Better projects.</span></footer>
    </main>
  );
}
