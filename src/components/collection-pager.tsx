import type { Locale } from '@/domain/schemas';

export function CollectionPager({ page, size, total, locale, onPage, label }: {
  page: number; size: number; total: number; locale: Locale; onPage: (page: number) => void; label: string;
}) {
  if (total <= size) return null;
  const ru = locale === 'ru';
  return <nav className="collection-pager" aria-label={label}>
    <button className="button small" disabled={page === 0} onClick={() => onPage(page - 1)}>{ru ? 'Назад' : 'Previous'}</button>
    <span role="status">{page * size + 1}–{Math.min((page + 1) * size, total)} / {total}</span>
    <button className="button small" disabled={(page + 1) * size >= total} onClick={() => onPage(page + 1)}>{ru ? 'Далее' : 'Next'}</button>
  </nav>;
}
