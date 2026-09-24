import type { ActionSignal } from '@/domain/action-signals';
import type { Locale } from '@/domain/schemas';

export function SignalEvidence({ signal, locale }: { signal: ActionSignal; locale: Locale }) {
  const ru = locale === 'ru';
  return <details className="signal-evidence">
    <summary>{ru ? 'Основание и качество данных' : 'Evidence and data quality'}</summary>
    <dl>
      <dt>{ru ? 'Основание' : 'Basis'}</dt>
      <dd>{signal.evidence.basis === 'heuristic' ? (ru ? 'Эвристическая оценка' : 'Heuristic assessment') : (ru ? 'Записи проекта' : 'Project records')}. {signal.evidence.rule}</dd>
      <dt>{ru ? 'Проверено на дату' : 'Evaluated as of'}</dt><dd>{signal.evidence.asOf}</dd>
      <dt>{ru ? 'Связанные записи' : 'Affected records'}</dt>
      <dd>{signal.affectedIds.slice(0, 20).join(', ')}{signal.affectedIds.length > 20 ? ` (+${signal.affectedIds.length - 20})` : ''}</dd>
      <dt>{ru ? 'Пробелы данных' : 'Data gaps'}</dt>
      <dd>{signal.evidence.missing.length ? signal.evidence.missing.join(' · ') : (ru ? 'Обязательные поля этого правила заполнены. Актуальность записей не подтверждена независимо.' : 'Required fields for this rule are present. Record freshness has not been independently verified.')}</dd>
      <dt>{ru ? 'При бездействии' : 'If no action is taken'}</dt><dd>{signal.consequence}</dd>
    </dl>
    <p className="muted">{ru ? 'Приоритет помогает выбрать следующий шаг. Он не оценивает вероятность успеха проекта.' : 'Priority helps choose the next step. It does not measure the probability of project success.'}</p>
  </details>;
}
