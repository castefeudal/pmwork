import type { ActionSignal } from '@/domain/action-signals';
import type { Locale } from '@/domain/schemas';
import Link from 'next/link';

export function SignalEvidence({ signal, locale }: { signal: ActionSignal; locale: Locale }) {
  const ru = locale === 'ru';
  const tool = signal.source?.kind === 'decision' ? ['matrix',ru?'Матрица решения':'Decision Matrix'] : signal.source?.kind === 'change' ? ['change',ru?'Анализ влияния изменения':'Change Impact'] : signal.source?.kind === 'milestone' || signal.source?.kind === 'dependency' ? ['cpm',ru?'Проверка критического пути':'Critical path'] : signal.source?.kind === 'risk' ? ['emv',ru?'Денежная оценка риска':'Risk EMV'] : null;
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
    {tool && <p><Link href={`/${locale}/tools/?tool=${tool[0]}`}>{tool[1]}</Link>. {signal.source?.kind === 'risk' && (ru ? 'Для EMV нужны числовая вероятность и денежное влияние; качественная оценка P × I их не заменяет. ' : 'EMV requires a numerical probability and monetary impact; the ordinal P × I rating does not supply them. ')}{ru ? 'Данные не передаются автоматически: выберите контекст и проверьте исходные значения в инструменте.' : 'Data is not transferred automatically: select the context and review the inputs in the tool.'}</p>}
  </details>;
}
