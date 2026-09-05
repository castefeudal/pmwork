import { notFound } from "next/navigation";
import type { Locale } from "@/domain/schemas";
import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";
import { pick, sources } from "@/content/catalog";
export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "en") notFound();
  const l = locale as Locale,
    ru = l === "ru";
  return (
    <div>
      <PublicHeader locale={l} />
      <main id="main">
        <header className="catalog-hero">
          <p className="eyebrow">Authority · version · review date</p>
          <h1>{ru ? "Источники и актуальность" : "Sources and currency"}</h1>
          <p className="lead">
            {ru
              ? "Приоритет: официальные стандарты и руководства → профессиональные объединения → исследования → зрелая практика. Практическая эвристика не выдаётся за стандарт."
              : "Priority: official standards and guides → professional bodies → research → mature practice. Practitioner heuristics are not presented as standards."}
          </p>
        </header>
        <section className="catalog-grid">
          {sources.map((s) => (
            <article className="catalog-card" key={s.id}>
              <span className="pill">{s.authority}</span>
              <h2>{s.title}</h2>
              <p>
                {s.organization} · {s.version}
              </p>
              <p>{pick(s.notes, l)}</p>
              <div className="card-foot">
                <small>
                  {ru ? "Проверено" : "Checked"}: {s.checked}
                </small>
                <a
                  className="button small"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {ru ? "Официальный источник" : "Official source"}
                </a>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer locale={l} />
    </div>
  );
}
