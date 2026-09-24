import { dependencyConflicts } from './planning';
import { localDay } from './work-views';
import type { Locale, Workspace } from './schemas';

export type SignalSource = {
  kind: 'work' | 'issue' | 'decision' | 'risk' | 'milestone' | 'assumption' | 'quality' | 'dependency' | 'change';
  id: string;
  owner: string;
};
export type ActionSignal = {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  category: 'decision' | 'blocker' | 'due' | 'review' | 'control';
  title: string;
  why: string;
  action: string;
  view: 'work' | 'planning' | 'raid' | 'people' | 'finance' | 'control';
  source?: SignalSource;
  affectedIds: string[];
  evidence: { basis: 'recorded' | 'heuristic'; rule: string; asOf: string; missing: string[] };
  consequence: string;
  dueDate?: string;
};

/** Calendar dates use the user's local day. An explicit day makes replay deterministic. */
export function projectActions(workspace: Workspace, projectId: string, locale: Locale, asOf = localDay()): ActionSignal[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || !Number.isFinite(Date.parse(asOf)) || new Date(asOf).toISOString().slice(0, 10) !== asOf) throw new Error('Invalid signal date');
  const ru = locale === 'ru';
  const t = (r: string, e: string) => ru ? r : e;
  const out: ActionSignal[] = [];
  const items = workspace.workItems.filter(x => x.projectId === projectId && !x.archived);
  const add = (signal: Omit<ActionSignal, 'evidence' | 'affectedIds'> & { affectedIds?: string[] }, rule: string, missing: string[] = [], basis: 'recorded' | 'heuristic' = 'recorded') => {
    out.push({ ...signal, affectedIds: signal.affectedIds ?? (signal.source ? [signal.source.id] : []), evidence: { basis, rule, asOf, missing } });
  };
  const ownerGap = (owner: string) => owner.trim() ? [] : [t('Владелец не указан', 'Owner is not recorded')];
  for (const x of items.filter(x => !x.done)) {
    const source: SignalSource = { kind: 'work', id: x.id, owner: x.owner };
    if (x.blocked) add({
      id: `block-${x.id}`, severity: 'critical', category: 'blocker', source,
      title: `${t('Снять блокировку', 'Unblock')}: ${x.title}`,
      why: x.blockerReason || t('Работа отмечена как заблокированная.', 'Work is marked blocked.'),
      action: t('Назначить владельца и следующий шаг для снятия блокировки.', 'Assign an owner and the next step to resolve the blocker.'),
      consequence: t('Пока блокировка не снята, работа не может продолжаться.', 'Work cannot proceed while the blocker remains.'),
      view: 'work', dueDate: x.dueDate,
    }, t('Активная работа: blocked = true.', 'Open work: blocked = true.'), [...ownerGap(x.owner), ...(!x.blockerReason?.trim() ? [t('Причина блокировки не указана', 'Blocker reason is not recorded')] : [])]);
    else if (x.dueDate && x.dueDate <= asOf) add({
      id: `due-${x.id}`, severity: x.dueDate < asOf ? 'high' : 'medium', category: 'due', source,
      title: `${x.dueDate < asOf ? t('Работа просрочена', 'Overdue work') : t('Срок сегодня', 'Due today')}: ${x.title}`,
      why: `${t('Срок', 'Due')}: ${x.dueDate}`, dueDate: x.dueDate,
      action: t('Проверить результат, владельца и согласовать следующий шаг.', 'Check the outcome and owner, then agree on the next step.'),
      consequence: t('Без завершения или согласованного переноса обязательство остаётся невыполненным.', 'Without completion or an agreed date change, the commitment remains unmet.'), view: 'work',
    }, t('Работа не завершена; срок не позднее даты проверки.', 'Work is open; due date is on or before the evaluation day.'), ownerGap(x.owner));
  }
  for (const x of workspace.issues.filter(x => x.projectId === projectId && x.status !== 'closed' && x.dueDate && x.dueDate < asOf)) add({
    id: `issue-${x.id}`, severity: 'critical', category: 'blocker', source: { kind: 'issue', id: x.id, owner: x.owner },
    affectedIds: [x.id, ...x.relatedWorkIds], title: `${t('Просроченная проблема', 'Overdue issue')}: ${x.title}`,
    why: `${t('Срок', 'Due')}: ${x.dueDate}`, dueDate: x.dueDate,
    action: t('Обновить план восстановления или эскалировать.', 'Update the recovery plan or escalate.'),
    consequence: x.description || t('Последствия не описаны.', 'Consequences are not recorded.'), view: 'raid',
  }, t('Проблема не закрыта; срок прошёл.', 'Issue is not closed; due date has passed.'), ownerGap(x.owner));
  for (const x of workspace.decisions.filter(x => x.projectId === projectId && x.status === 'pending')) add({
    id: `decision-${x.id}`, severity: x.date && x.date <= asOf ? 'high' : 'medium', category: 'decision',
    source: { kind: 'decision', id: x.id, owner: x.owner }, title: `${t('Нужно решение', 'Decision needed')}: ${x.question}`,
    why: x.date ? `${t('Дата решения', 'Decision date')}: ${x.date}` : t('Дата решения не указана.', 'Decision date is not recorded.'), dueDate: x.date || undefined,
    action: t('Сравнить варианты и зафиксировать решение с обоснованием.', 'Compare options and record the decision and rationale.'),
    consequence: x.consequences || t('Последствия бездействия не описаны.', 'Consequences of inaction are not recorded.'), view: 'raid',
  }, t('Решение ожидает принятия. Дата определяет срочность.', 'Decision is pending. Its date determines urgency.'), [...ownerGap(x.owner), ...(!x.date ? [t('Дата не указана', 'Date is not recorded')] : []), ...(!x.consequences.trim() ? [t('Последствия не описаны', 'Consequences are not recorded')] : [])]);
  for (const x of workspace.risks.filter(x => x.projectId === projectId && x.status !== 'closed')) {
    const reviewDue = !!x.reviewDate && x.reviewDate <= asOf, score = x.probability * x.impact;
    if (!reviewDue && score < 15) continue;
    add({ id: `risk-${x.id}`, severity: score >= 15 || (reviewDue && x.reviewDate < asOf) ? 'high' : 'medium', category: 'review',
      source: { kind: 'risk', id: x.id, owner: x.owner },
      affectedIds: [x.id, ...items.filter(w => w.riskIds.includes(x.id)).map(w => w.id)],
      title: `${reviewDue ? t('Пересмотреть риск', 'Review risk') : t('Высокая оценка риска', 'High risk score')}: ${x.title}`,
      why: `P × I = ${score}${reviewDue ? ` · ${t('Дата пересмотра', 'Review date')}: ${x.reviewDate}` : ''}`, dueDate: x.reviewDate || undefined,
      action: t('Проверить триггер, меры реагирования и назначить следующую дату пересмотра.', 'Review the trigger and response, then set the next review date.'),
      consequence: t('Без пересмотра актуальность оценки и мер реагирования остаётся непроверенной.', 'Without a review, the assessment and response may be out of date.'), view: 'raid',
    }, reviewDue ? t('Риск открыт; дата пересмотра наступила. P × I — эвристическая оценка, не вероятность события.', 'Risk is open; review date has arrived. P × I is a heuristic score, not an event probability.') : t('Эвристика: P × I ≥ 15 по порядковым шкалам 1–5. Это не денежная экспозиция.', 'Heuristic: P × I ≥ 15 on ordinal 1–5 scales. This is not monetary exposure.'), [...ownerGap(x.owner), ...(!x.reviewDate ? [t('Дата пересмотра не указана', 'Review date is not recorded')] : [])], 'heuristic');
  }
  for (const x of workspace.milestones.filter(x => x.projectId === projectId && x.status !== 'done' && x.status !== 'cancelled' && (x.status === 'at-risk' || x.forecastDate < asOf))) add({
    id: `milestone-${x.id}`, severity: 'high', category: 'due', source: { kind: 'milestone', id: x.id, owner: x.owner },
    affectedIds: [x.id, ...items.filter(w => w.milestoneId === x.id).map(w => w.id)],
    title: `${x.forecastDate < asOf ? t('Контрольная точка просрочена', 'Overdue milestone') : t('Контрольная точка под риском', 'Milestone at risk')}: ${x.title}`,
    why: `${t('Базовый план', 'Baseline')}: ${x.baselineDate} → ${t('Прогноз', 'Forecast')}: ${x.forecastDate}`, dueDate: x.forecastDate,
    action: t('Проверить связанную работу и прогноз, сохранив базовый план.', 'Review linked work and the forecast while preserving the baseline.'),
    consequence: t('Связанные обязательства могут потребовать пересмотра; влияние нужно проверить.', 'Related commitments may need review; the impact needs to be checked.'), view: 'planning',
  }, t('Точка не завершена и не отменена; прогнозная дата прошла или указан статус «под риском».', 'Milestone is neither done nor cancelled; forecast date has passed or status is at risk.'), [...ownerGap(x.owner), ...(x.confidence === undefined ? [t('Уверенность не оценена', 'Confidence is not recorded')] : [])]);
  for (const x of workspace.assumptions.filter(x => x.projectId === projectId && (x.status === 'untested' || x.status === 'validating') && x.validationDate && x.validationDate <= asOf)) add({
    id: `assumption-${x.id}`, severity: 'medium', category: 'review', source: { kind: 'assumption', id: x.id, owner: x.owner },
    title: `${t('Непроверенное допущение', 'Untested assumption')}: ${x.text}`, why: `${t('Дата проверки', 'Validation date')}: ${x.validationDate}`, dueDate: x.validationDate,
    action: t('Провести минимальную проверку до нового обязательства.', 'Run the smallest validation before a new commitment.'),
    consequence: x.effectIfFalse || t('Влияние ошибочного допущения не описано.', 'Impact of a false assumption is not recorded.'), view: 'raid',
  }, t('Допущение ещё не подтверждено; дата проверки наступила.', 'Assumption is not yet validated; validation date has arrived.'), ownerGap(x.owner));
  for (const x of workspace.qualityGates.filter(x => x.projectId === projectId && x.status === 'failed')) add({
    id: `quality-${x.id}`, severity: 'critical', category: 'control', source: { kind: 'quality', id: x.id, owner: x.owner },
    title: `${t('Контроль качества не пройден', 'Quality gate failed')}: ${x.title}`, why: x.evidence || t('Результат проверки отмечен как неуспешный.', 'The gate is recorded as failed.'),
    action: t('Не выпускать результат до решения или явного принятия риска.', 'Do not release until resolved or risk is explicitly accepted.'),
    consequence: t('Критерии выпуска остаются невыполненными.', 'Release criteria remain unmet.'), view: 'control',
  }, t('Записанный статус проверки: failed.', 'Recorded gate status: failed.'), [...ownerGap(x.owner), ...(!x.evidence.trim() ? [t('Доказательства не приложены', 'Evidence is not recorded')] : [])]);
  const unowned = items.filter(x => !x.done && !x.owner.trim());
  if (unowned.length) add({ id: 'unowned', severity: 'medium', category: 'control', affectedIds: unowned.map(x => x.id),
    title: t(`${unowned.length} элементов без владельца`, `${unowned.length} unowned items`), why: t('Ответственный за следующую работу не указан.', 'Ownership of the next work is not recorded.'),
    action: t('Назначить владельца или убрать работу из активного горизонта.', 'Assign an owner or remove work from the active horizon.'),
    consequence: t('Нет явно назначенного ответственного за выполнение.', 'No accountable owner is recorded.'), view: 'work',
  }, t('Активная незавершённая работа с пустым полем владельца.', 'Non-archived, unfinished work with an empty owner field.'), [t('Владельцы не указаны', 'Owners are not recorded')]);
  const dependencies = new Map(workspace.dependencies.filter(x => x.projectId === projectId).map(x => [x.id, x]));
  for (const conflict of dependencyConflicts(workspace, projectId)) {
    const d = dependencies.get(conflict.id)!;
    add({ id: `dependency-${d.id}`, severity: 'high', category: 'control', source: { kind: 'dependency', id: d.id, owner: d.owner }, affectedIds: [d.id, d.predecessorId, d.successorId],
      title: `${t('Конфликт зависимости', 'Dependency conflict')}: ${conflict.from} → ${conflict.to}`,
      why: conflict.missing ? t('Связанная работа недоступна.', 'Linked work is unavailable.') : `${conflict.type} · ${conflict.days} ${t('дн. нарушения связи', 'days of timing conflict')}`,
      action: t('Согласовать даты или уточнить тип связи и лаг.', 'Align dates or review relationship type and lag.'),
      consequence: t('Текущие даты не подтверждают выполнимость зависимости.', 'Current dates do not establish a feasible dependency.'), view: 'planning',
    }, `${d.type} · ${t('лаг', 'lag')}: ${d.lag} ${t('календарных дней', 'calendar days')}`, conflict.missing ? [t('Связанная работа недоступна', 'Linked work is unavailable')] : []);
  }
  for (const x of workspace.changes.filter(x => x.projectId === projectId && x.status === 'assessing')) add({
    id: `change-${x.id}`, severity: 'high', category: 'decision', source: { kind: 'change', id: x.id, owner: x.approver },
    title: `${t('Согласовать изменение', 'Review change')}: ${x.change}`, why: x.reason,
    action: t('Сравнить влияние на сроки, стоимость и объём; зафиксировать решение.', 'Compare schedule, cost and scope impact; record the decision.'),
    consequence: t('Изменение остаётся несогласованным; его влияние не принято.', 'The change remains unapproved; its impact has not been accepted.'), view: 'control',
  }, t('Статус изменения: assessing.', 'Change status: assessing.'), ownerGap(x.approver));
  const severity = { critical: 0, high: 1, medium: 2 };
  const category = { decision: 0, blocker: 1, due: 2, review: 3, control: 4 };
  return out.sort((a, b) => severity[a.severity] - severity[b.severity] || category[a.category] - category[b.category] || (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || a.id.localeCompare(b.id));
}
