import Link from "next/link";
export default function NotFound() {
  return (
    <main className="language-gate">
      <p className="eyebrow">404</p>
      <h1>Страница не найдена</h1>
      <p>The requested page does not exist.</p>
      <Link className="button primary" href="/ru">
        На главную
      </Link>
    </main>
  );
}
