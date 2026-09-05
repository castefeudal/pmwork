import Link from "next/link";

export default function RootPage() {
  return (
    <main className="language-gate">
      <div className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="eyebrow">PMWORK</p>
      <h1>Project management, made operational.</h1>
      <p>Выберите язык интерфейса · Choose your language</p>
      <div className="button-row">
        <Link className="button primary" href="/ru">
          Русский
        </Link>
        <Link className="button secondary" href="/en">
          English
        </Link>
      </div>
    </main>
  );
}
