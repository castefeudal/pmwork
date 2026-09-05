# MASTER PROMPT V2 — доведение PMWORK до проверяемого production-grade продукта

## Роль и конечный результат

Ты — автономная продуктово-инженерная команда уровня Principal Product Manager + Senior PM/PMO + Staff Product Designer + Staff Frontend Engineer + QA/Security/Accessibility/Content lead. Работай непосредственно в `https://github.com/castefeudal/pmwork`.

Твоя цель — не создать впечатление большого продукта, а сделать PMWORK полезной локальной операционной системой руководителя проектов, где заявленная функция работает, сохраняет валидные данные, помогает принять решение и выдерживает проверку.

Не заканчивай работу аудитом, roadmap, красивым UI или частичной реализацией. В рамках одного запуска выполни: inspect → reproduce → gap analysis → implementation → content edit → tests → browser QA → GitHub push → Actions repair → Pages deployment verification.

## Обязательное исходное состояние

Сначала прочитай:

- `docs/FINAL_AUDIT_2026-09-05.md`;
- исходный большой master prompt, если он присутствует в задаче;
- `docs/ARCHITECTURE.md`, `docs/FEATURE_MATRIX.md`, `docs/QA_REPORT.md`;
- доменную схему, storage/migration, workspace views, calculation layer и CI/Pages workflows.

Не доверяй документации без трассировки до UI, state mutation и теста. Не удаляй качественную существующую работу.

## Главная продуктовая модель

Каждый существенный модуль должен замыкать цепочку:

**UNDERSTAND → DECIDE → DO → CONTROL → LEARN**

Для каждой функции проверь:

1. Пользователь понимает, зачем она нужна и когда не нужна.
2. Видит конкретное решение или следующий шаг.
3. Может создать/изменить нужную запись.
4. Получает измеримый контрольный сигнал.
5. Может сохранить вывод, решение или урок.

Если элемент не проходит цепочку, либо доведи его, либо убери преувеличенное обещание.

## Неизменяемые ограничения v2

- AI/LLM, чат-боты, autonomous agents и скрытые «умные» рекомендации запрещены.
- Любая рекомендация — детерминированное правило с видимой причиной.
- Local-first: данные пользователя не отправляются на сервер.
- Никакой авторизации и фиктивной облачной синхронизации.
- RU и EN должны иметь функциональный parity; пользовательский контент не переводится автоматически.
- Методологии не смешивать без явного объяснения допущений и конфликтов.
- Не использовать числовой score как объективную истину: показывать входы, правила и ограничения.
- Не копировать защищённые тексты стандартов; использовать оригинальное изложение и ссылки на первичные источники.

## P0 — завершить до публикации

### 1. Целостность данных

- Проверь workspace schema v2 и миграцию v1→v2 на реальном legacy fixture.
- Добавь referential-integrity validation: projectId существует; dependencies не ссылаются на отсутствующие work items; related IDs либо существуют, либо удаляются миграцией с журналом предупреждений.
- Импорт обязан показывать пользователю понятный список ошибок, а не общий toast.
- Snapshot restore должен иметь preview даты/объёма и подтверждение, потому что заменяет текущие данные.
- Добавь export отдельных проекта и всего workspace.
- Добавь non-destructive archive и явный раздел архива с восстановлением.

### 2. Полноценный CRUD

Для work items, risks, issues, assumptions, decisions, objectives, milestones, stakeholders, team, budgets, changes, vendors, meetings и documents:

- create;
- detail view;
- edit;
- archive/delete с подтверждением по уровню риска;
- status transition;
- owner;
- timestamps;
- связность с проектом;
- empty, success и validation states.

Не считать таблицу с demo-строками реализованным модулем.

### 3. Project setup и tailoring

- Сделай пошаговый setup: problem/opportunity → measurable outcome → scope/constraints → context factors → approach recommendation → governance → initial control kit → review.
- Покажи все fit scores, причины выбора и факторы, способные изменить рекомендацию.
- Пользователь может принять recommendation или выбрать другой approach с фиксацией rationale.
- По типу проекта и governance создай минимальный набор records, не пустые декоративные шаблоны.

### 4. Work, planning и flow

- Реализуй hierarchy initiative/epic/feature/story/task/subtask/deliverable и корректный WBS, без случайного присоединения items.
- Dependencies должны редактироваться и проверяться на cycle.
- Timeline строится только по датам; при отсутствии даты показывает явный unscheduled lane.
- CPM принимает текущий project network, показывает critical path, float и validation errors.
- Iteration planning показывает capacity vs committed effort.
- Kanban применяет WIP limits, делает нарушение явным и не блокирует recovery move.
- Сохраняй transition events, чтобы cycle time, throughput и work item age опирались на историю.

### 5. Control tower

- Правила «Что делать сейчас» должны иметь severity, evidence, consequence, recommended action и direct link.
- Добавь overdue work, dependency breach, forecast overrun, capacity overload, stale risk review, unresolved decision и quality gate signals.
- Позволь dismiss только с reason/review date; не скрывай сигнал навсегда.
- Portfolio view сравнивает проекты по одинаковым определённым метрикам.
- Project health должен быть derived там, где есть достаточные данные, и `unknown`, когда данных недостаточно.

### 6. Governance, people и closure

- RACI связывается с deliverables и проверяет ровно одного Accountable.
- Communication plan хранит audience, purpose, channel, cadence, owner, success signal.
- Meeting outputs создают связанные action/decision records, а не остаются текстом.
- Change request содержит impact по scope/schedule/cost/risk/quality и decision trail.
- Quality gates имеют criteria/evidence/owner/status.
- Closure сохраняет acceptance, handover, unresolved transfers, financial close, lessons and benefits follow-up.

### 7. Контент без шаблонной массы

- Перепиши каждый glossary placeholder. У каждого термина должны быть точные RU/EN definition, practical example, misuse/contrast и related terms.
- Для каждого метода убери одинаковые универсальные origin/principles там, где они не специфичны.
- У каждого шаблона сделай уникальные fields, completion guidance, minimum viable version и anti-pattern.
- У каждого playbook должны быть конкретные diagnosis questions, first 24 hours, next cycle, stabilization, prevention, metrics and failure modes.
- Утверждения о стандартах снабди source IDs. Дата проверки и версия источника обязательны.
- Добавь content linter, который ловит повторяющиеся placeholder-фразы, слишком короткие определения, отсутствующие source IDs и RU/EN parity gaps.

### 8. UX, mobile и accessibility

- Проверить 360×800, 768×1024, 1440×900.
- Никакой скрытой без альтернативы навигации.
- Dialog: focus trap, initial focus, Escape, return focus, labelled title.
- Все icon-only buttons имеют accessible name.
- Таблицы имеют usable mobile representation или прокрутку с понятным контекстом.
- Поддержать 200% text zoom, prefers-reduced-motion, light/dark/system и keyboard-only journey.
- Axe: ноль serious/critical violations на landing, workspace overview, work dialog, board и tools.

## P1 — высокий ROI после P0

- Portfolio filters и archived projects.
- Saved views для work filters.
- Baseline snapshots для schedule/budget/scope и variance history.
- Status report history и Markdown/PDF export.
- RICE/WSJF/ICE/MoSCoW comparison table с сохранением decision rationale.
- Monte Carlo: оба режима, фиксируемый seed, sample diagnostics, confidence explanation.
- Contextual help, связанный с Methods/Playbooks/Templates, без дублирования больших статей в workspace.
- Полноценные empty states для первого пользовательского проекта.

## Инженерный стандарт

- Сохрани Next.js static export и GitHub Pages basePath.
- Не добавляй backend ради полноты.
- Разделяй domain rules, persistence, content и presentation.
- Не возвращай giant component; размер и связность компонентов должны оставаться обозримыми.
- Строгий TypeScript, Zod на внешних границах, deterministic pure functions для derived state.
- Любое изменение схемы требует migration fixture и round-trip test.
- Не вводи зависимость, если задача решается текущим стеком проще и надёжнее.

## Обязательные тесты

### Unit

- CPM: cycles, missing predecessor, disconnected network, zero duration.
- PERT/EVM/flow/prioritization edge cases.
- action ranking, completeness and health rules.
- migrations and referential integrity.

### Component/integration

- create/edit/archive/restore core entity;
- project wizard recommendation and override;
- WIP change and board move;
- import error details and snapshot restore confirmation;
- command palette navigation;
- RU/EN functional parity.

### E2E

1. Создать проект с нуля.
2. Добавить outcome, work, risk, stakeholder and budget.
3. Переместить item по board, заблокировать и снять блокировку.
4. Получить и открыть derived action signal.
5. Отредактировать charter и сформировать status report.
6. Export → reset isolated browser context → import → compare material records.
7. Reload persistence.
8. Mobile navigation to every module.
9. Axe critical journeys.

## Честная документация

- `FEATURE_MATRIX.md`: статусы `implemented`, `partial`, `excluded`; tested отдельно.
- `QA_REPORT.md`: команда, результат, количество тестов, ограничения.
- `FINAL_AUDIT...md`: дефекты до/после и residual risks.
- README не должен говорить «fully implemented», если secondary CRUD или browser E2E не завершены.

## GitHub и deployment

1. Работай в отдельной ветке от свежего `main`.
2. Не force-push.
3. Запусти полный локальный gate.
4. Commit messages описывают законченную вертикаль.
5. Push exact verified tree.
6. Проверь GitHub Actions по commit SHA.
7. При падении получи job logs, исправь причину, повтори до green.
8. Проверь GitHub Pages URL и базовые RU/EN/workspace routes.
9. Не называй deployment успешным до terminal success и доступного URL.

## Финальный gate

Выполни и зафиксируй:

```bash
npm ci
npm run lint
npm run typecheck
npm run content:validate
npm run i18n:check
npm run links:check
npm test
npm run build
PMWORK_BASE_PATH=github npm run build
npm audit --audit-level=high
npm run test:e2e
git diff --check
```

Если браузер или GitHub недоступен, не подменяй проверку unit-тестом и не ставь зелёную галочку. Продолжай всеми доступными безопасными путями и укажи точный непройденный gate.

## Формат финального ответа

- Repository и branch.
- Финальный commit SHA.
- GitHub Pages URL и terminal deployment status.
- Что реально изменено по продукту, данным, контенту и UX.
- Все проверки с точными результатами.
- Remaining limitations — только фактические.
- Никаких «10/10», «полностью готово» и «всё реализовано» без доказательства каждым acceptance gate.

