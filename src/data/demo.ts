import type { Locale, Workspace, WorkItem } from "@/domain/schemas";
const now = "2026-09-04T10:00:00.000Z";
export function demoWorkspace(locale: Locale): Workspace {
  const ru = locale === "ru";
  const projectDefaults = {
    scopeIn: "",
    scopeOut: "",
    constraints: "",
    definitionOfDone: "",
  };
  const projects: Workspace["projects"] = [
    {
      ...projectDefaults,
      id: "atlas",
      name: ru
        ? "Запуск цифрового продукта MARKOVMADE"
        : "MARKOVMADE Digital Product Launch",
      status: "active",
      owner: ru ? "Анна Смирнова" : "Anna Smirnova",
      sponsor: ru ? "Игорь Волков" : "Igor Volkov",
      approach: "hybrid",
      governance: "standard",
      type: "software",
      startDate: "2026-07-01",
      targetDate: "2026-11-14",
      purpose: ru
        ? "Снизить нагрузку поддержки через удобный кабинет самообслуживания."
        : "Reduce support demand through a useful self-service portal.",
      objective: ru
        ? "К Q1 не менее 60% типовых запросов решаются без оператора."
        : "By Q1, at least 60% of routine requests are resolved without an agent.",
      successMeasures: [
        ru ? "Доля активных пользователей ≥ 45%" : "Adoption ≥ 45%",
        ru ? "Доля обращений −25%" : "Contact rate −25%",
        ru ? "CSAT не ниже исходного уровня" : "CSAT at or above baseline",
      ],
      health: {
        schedule: "amber",
        scope: "green",
        budget: "amber",
        risks: "amber",
        blockers: "red",
        capacity: "amber",
        alignment: "green",
      },
      demo: true,
      currency: "USD",
      scopeIn: ru
        ? "Первичная настройка, поиск знаний, отслеживание обращения"
        : "Onboarding, knowledge search, request tracking",
      scopeOut: ru
        ? "ИИ-ассистент, замена CRM"
        : "AI assistant, CRM replacement",
      constraints: ru
        ? "Подтверждения SOC 2 до пилота; команда 6 штатных единиц"
        : "SOC 2 evidence before pilot; six FTE",
      definitionOfDone: ru
        ? "Проверено, испытано, доступно; подтверждения безопасности приняты, метрики включены"
        : "Reviewed, tested, accessible, security evidence accepted, metrics enabled",
    },
    {
      ...projectDefaults,
      id: "campaign",
      name: ru
        ? "Осенняя образовательная кампания"
        : "Autumn Education Campaign",
      status: "active",
      owner: ru ? "Мария Левина" : "Maria Levina",
      sponsor: ru ? "Павел Марков" : "Pavel Markov",
      approach: "flow",
      governance: "lightweight",
      type: "marketing",
      startDate: "2026-08-10",
      targetDate: "2026-10-05",
      purpose: ru
        ? "Провести доказательную контентную кампанию нового курса."
        : "Deliver an evidence-led content campaign for a new course.",
      objective: ru
        ? "Получить 800 квалифицированных регистраций в целевом CAC."
        : "Generate 800 qualified registrations within target CAC.",
      successMeasures: [
        ru ? "Квалифицированные лиды ≥ 800" : "Qualified leads ≥ 800",
        "CAC ≤ 32 BYN",
        ru ? "Конверсия лендинга ≥ 4,5%" : "Landing CVR ≥ 4.5%",
      ],
      health: {
        schedule: "green",
        scope: "green",
        budget: "amber",
        risks: "green",
        blockers: "green",
        capacity: "amber",
        alignment: "green",
      },
      demo: true,
      currency: "BYN",
    },
    {
      ...projectDefaults,
      id: "migration",
      name: ru
        ? "Миграция регулируемой инфраструктуры"
        : "Regulated Infrastructure Migration",
      status: "active",
      owner: ru ? "Дмитрий Орлов" : "Dmitry Orlov",
      sponsor: ru ? "Елена Морозова" : "Elena Morozova",
      approach: "hybrid",
      governance: "controlled",
      type: "infrastructure",
      startDate: "2026-05-01",
      targetDate: "2027-02-28",
      purpose: ru
        ? "Перенести критичный сервис без нарушения требований и SLA."
        : "Migrate a critical service without breaching compliance or SLA.",
      objective: ru
        ? "Завершить миграцию без инцидентов Sev-1 и с простоем менее 30 минут."
        : "Complete migration with zero Sev-1 incidents and under 30 minutes downtime.",
      successMeasures: ru
        ? ["Ноль инцидентов Sev-1", "Аудит принят", "Простой менее 30 минут"]
        : ["Zero Sev-1", "Audit accepted", "Downtime < 30 min"],
      health: {
        schedule: "amber",
        scope: "green",
        budget: "amber",
        risks: "red",
        blockers: "amber",
        capacity: "green",
        alignment: "green",
      },
      demo: true,
      currency: "EUR",
    },
  ];
  const seed: Array<
    [
      string,
      string,
      string,
      string,
      string,
      string,
      boolean,
      string,
      string,
      number,
    ]
  > = [
    [
      "PW-101",
      "atlas",
      ru ? "Согласовать границы первого релиза" : "Align first-release scope",
      "feature",
      "ready",
      "critical",
      false,
      "2026-09-01",
      "2026-09-09",
      8,
    ],
    [
      "PW-102",
      "atlas",
      ru ? "Миграция каталога знаний" : "Migrate knowledge catalog",
      "story",
      "in-progress",
      "high",
      false,
      "2026-08-25",
      "2026-09-18",
      13,
    ],
    [
      "PW-103",
      "atlas",
      ru ? "Провести проверку безопасности" : "Complete security review",
      "task",
      "review",
      "critical",
      true,
      "2026-08-28",
      "2026-09-06",
      8,
    ],
    [
      "PW-104",
      "atlas",
      ru ? "Настроить продуктовую аналитику" : "Configure product analytics",
      "story",
      "backlog",
      "medium",
      false,
      "2026-09-20",
      "2026-10-02",
      5,
    ],
    [
      "PW-105",
      "atlas",
      ru ? "Проверить сценарий доступности" : "Validate accessibility journey",
      "task",
      "done",
      "high",
      false,
      "2026-08-18",
      "2026-08-28",
      5,
    ],
    [
      "PW-106",
      "atlas",
      ru ? "Контроль готовности пилота" : "Pilot readiness gate",
      "deliverable",
      "ready",
      "critical",
      false,
      "2026-09-19",
      "2026-09-28",
      8,
    ],
    [
      "MK-21",
      "campaign",
      ru ? "Сценарии серии Reels" : "Reels series scripts",
      "feature",
      "in-progress",
      "high",
      false,
      "2026-08-18",
      "2026-09-08",
      13,
    ],
    [
      "MK-22",
      "campaign",
      ru ? "Проверка предложения на лендинге" : "Landing offer review",
      "task",
      "ready",
      "critical",
      false,
      "2026-09-03",
      "2026-09-07",
      5,
    ],
    [
      "IN-11",
      "migration",
      ru ? "Утвердить план переключения" : "Approve cutover plan",
      "deliverable",
      "review",
      "critical",
      false,
      "2026-08-01",
      "2026-09-12",
      21,
    ],
    [
      "IN-12",
      "migration",
      ru ? "Пробный запуск №2" : "Dry run #2",
      "task",
      "ready",
      "critical",
      true,
      "2026-09-15",
      "2026-09-20",
      13,
    ],
  ];
  const owners: Record<string, string> = {
    "PW-101": ru ? "Анна Смирнова" : "Anna Smirnova",
    "PW-102": ru ? "Максим Ким" : "Max Kim",
    "PW-103": ru ? "Олег Ян" : "Oleg Yan",
    "PW-105": ru ? "Ирина Соколова" : "Irina Sokolova",
    "PW-106": ru ? "Анна Смирнова" : "Anna Smirnova",
    "MK-21": ru ? "Мария Левина" : "Maria Levina",
    "MK-22": ru ? "Павел Марков" : "Pavel Markov",
    "IN-11": ru ? "Дмитрий Орлов" : "Dmitry Orlov",
    "IN-12": ru ? "Наталья Хан" : "Natalia Khan",
  };
  const workItems: WorkItem[] = seed.map(
    (
      [
        id,
        projectId,
        title,
        type,
        status,
        priority,
        blocked,
        startDate,
        dueDate,
        estimate,
      ],
      order,
    ) => ({
      id,
      projectId,
      title,
      description: ru
        ? "Рабочий элемент связан с результатом, владельцем и контрольной датой."
        : "Work item connected to an outcome, owner, and control date.",
      type: type as WorkItem["type"],
      status: status as WorkItem["status"],
      priority: priority as WorkItem["priority"],
      owner: owners[id] ?? "",
      contributors: [],
      labels: [],
      startDate,
      dueDate,
      estimate,
      dependencies: id === "PW-106" ? ["PW-102", "PW-103"] : [],
      acceptanceCriteria: [
        ru
          ? "Результат проверен владельцем ожидаемого эффекта"
          : "Outcome owner verified the result",
      ],
      done: status === "done",
      blocked,
      blockerReason: blocked
        ? ru
          ? "Ожидается внешнее решение"
          : "Waiting for an external decision"
        : undefined,
      riskIds: id === "PW-103" ? ["R-1"] : [],
      objectiveIds: projectId === "atlas" ? ["O-1"] : [],
      order,
      createdAt: now,
      updatedAt: now,
      archived: false,
    }),
  );
  return {
    schemaVersion: 6,
    savedWorkViews: [],
    workViewPreferences: [],
    id: "pmwork-demo",
    name: "PMWORK",
    locale,
    experience: "practitioner",
    density: "comfortable",
    projects,
    workItems,
    risks: [
      {
        id: "R-1",
        projectId: "atlas",
        title: ru
          ? "Согласование безопасности задержит релиз"
          : "Security approval may delay release",
        category: ru ? "Технический" : "Technical",
        description: ru
          ? "Решение зависит от внешней команды безопасности."
          : "Decision depends on an external security team.",
        probability: 4,
        impact: 5,
        owner: ru ? "Анна Смирнова" : "Anna Smirnova",
        strategy: "mitigate",
        actions: ru
          ? "Еженедельный обзор; подготовить подтверждения заранее."
          : "Weekly review; prepare evidence early.",
        trigger: ru
          ? "Нет согласования за 14 дней до релиза"
          : "No approval 14 days before release",
        reviewDate: "2026-09-08",
        residualProbability: 2,
        residualImpact: 4,
        status: "responding",
      },
    ],
    decisions: [
      {
        id: "D-1",
        projectId: "atlas",
        question: ru
          ? "Переносить ли устаревший раздел вопросов и ответов?"
          : "Should legacy FAQ content be migrated?",
        context: ru
          ? "40% материалов не использовались 12 месяцев."
          : "40% of content has not been used for 12 months.",
        alternatives: [
          ru ? "Перенести всё" : "Migrate all",
          ru ? "Только активное" : "Active only",
        ],
        criteria: [ru ? "Ценность" : "Value", ru ? "Риск" : "Risk"],
        decision: "",
        rationale: "",
        owner: ru ? "Игорь Волков" : "Igor Volkov",
        date: "2026-09-07",
        participants: [],
        consequences: "",
        revisitTrigger: "",
        status: "pending",
      },
    ],
    stakeholders: [
      {
        id: "S-1",
        projectId: "atlas",
        name: ru ? "Операционная поддержка" : "Support Operations",
        role: ru ? "Основной пользователь" : "Primary user",
        influence: 4,
        interest: 5,
        attitude: "supportive",
        expectations: ru ? "Снижение ручной нагрузки" : "Less manual demand",
        communicationNeeds: ru
          ? "Демонстрация каждые две недели"
          : "Biweekly demo",
        owner: ru ? "Анна Смирнова" : "Anna Smirnova",
        strategy: ru ? "Вовлекать в обзор" : "Involve in review",
      },
      {
        id: "S-2",
        projectId: "atlas",
        name: ru ? "Служба безопасности" : "Security",
        role: ru ? "Контрольная функция" : "Control function",
        influence: 5,
        interest: 3,
        attitude: "neutral",
        expectations: ru ? "Проверяемые подтверждения" : "Verifiable evidence",
        communicationNeeds: ru
          ? "Пакет решения до контрольной проверки"
          : "Decision pack before gate",
        owner: ru ? "Олег Ян" : "Oleg Yan",
        strategy: ru ? "Согласовать критерии заранее" : "Align criteria early",
      },
    ],
    budgets: [
      {
        id: "B-1",
        projectId: "atlas",
        category: ru ? "Разработка" : "Development",
        planned: 120000,
        actual: 73500,
        committed: 31000,
        forecast: 129000,
      },
      {
        id: "B-2",
        projectId: "atlas",
        category: ru ? "Безопасность" : "Security",
        planned: 20000,
        actual: 9000,
        committed: 8500,
        forecast: 20500,
      },
    ],
    documents: [
      {
        id: "DOC-1",
        projectId: "atlas",
        title: ru ? "Устав проекта" : "Project Charter",
        type: "charter",
        body: ru
          ? "## Цель\nЗапустить кабинет самообслуживания.\n\n## Границы\nПервичная настройка, поиск знаний, отслеживание обращения."
          : "## Purpose\nLaunch a self-service portal.\n\n## Scope\nOnboarding, knowledge search, request tracking.",
        relatedIds: ["O-1"],
        updatedAt: now,
      },
    ],
    milestones: [
      {
        id: "M-1",
        projectId: "atlas",
        title: ru ? "Готовность пилота" : "Pilot ready",
        date: "2026-09-28",
        status: "at-risk",
        progress: 68,
      },
      {
        id: "M-2",
        projectId: "atlas",
        title: ru ? "Публичный запуск" : "Public launch",
        date: "2026-11-14",
        status: "planned",
        progress: 34,
      },
    ],
    issues: [
      {
        id: "I-1",
        projectId: "atlas",
        title: ru ? "Задержка проверки безопасности" : "Security review delay",
        description: ru
          ? "Проверка не началась в согласованную дату."
          : "Review did not start on the agreed date.",
        impact: 4,
        urgency: 5,
        owner: ru ? "Олег Ян" : "Oleg Yan",
        plan: ru
          ? "Передать пакет решения спонсору."
          : "Escalate decision pack to sponsor.",
        dueDate: "2026-09-06",
        escalation: "Sponsor",
        relatedRiskId: "R-1",
        relatedWorkIds: ["PW-103"],
        status: "resolving",
      },
    ],
    objectives: [
      {
        id: "O-1",
        projectId: "atlas",
        description: ru
          ? "60% запросов решаются через самообслуживание"
          : "60% of requests resolved through self-service",
        type: "outcome",
        baseline: "18%",
        target: "60%",
        measure: ru
          ? "Доля обращений, решённых через самообслуживание"
          : "Self-service resolution rate",
        dueDate: "2027-03-31",
        owner: ru ? "Игорь Волков" : "Igor Volkov",
        deliverableIds: ["PW-106"],
        status: "tracking",
      },
    ],
    assumptions: [
      {
        id: "A-1",
        projectId: "atlas",
        text: ru
          ? "Пользователи смогут найти нужную статью без оператора"
          : "Users can find the right article without an agent",
        rationale: ru
          ? "Журналы поиска показывают повторяемые запросы"
          : "Search logs show recurring queries",
        owner: ru ? "Анна Смирнова" : "Anna Smirnova",
        validationMethod: ru ? "Тест удобства · n=8" : "Usability test · n=8",
        validationDate: "2026-09-12",
        status: "validating",
        effectIfFalse: ru
          ? "Пересобрать информационную архитектуру и ранжирование"
          : "Rework IA and ranking",
      },
    ],
    dependencies: [
      {
        id: "DEP-1",
        projectId: "atlas",
        predecessorId: "PW-103",
        successorId: "PW-106",
        type: "FS",
        lag: 0,
        owner: ru ? "Анна Смирнова" : "Anna Smirnova",
        dueDate: "2026-09-19",
        status: "open",
      },
    ],
    iterations: [
      {
        id: "IT-1",
        projectId: "atlas",
        title: ru ? "Пилотный спринт 4" : "Pilot Sprint 4",
        goal: ru
          ? "Закрыть пробелы готовности пилота"
          : "Close pilot readiness gaps",
        startDate: "2026-09-01",
        endDate: "2026-09-14",
        capacity: 52,
        workItemIds: ["PW-101", "PW-102", "PW-103"],
        status: "active",
      },
    ],
    teamMembers: [
      {
        id: "TM-1",
        projectId: "atlas",
        name: ru ? "Анна Смирнова" : "Anna Smirnova",
        role: ru ? "Руководитель проекта" : "Project Lead",
        responsibility: ru
          ? "Результат, границы, эскалация"
          : "Outcome, scope, escalation",
        weeklyCapacity: 32,
        timezone: "Europe/Minsk",
        skills: ru
          ? ["Поставка", "Заинтересованные стороны"]
          : ["Delivery", "Stakeholders"],
      },
      {
        id: "TM-2",
        projectId: "atlas",
        name: ru ? "Максим Ким" : "Max Kim",
        role: "Engineer",
        responsibility: ru ? "Миграция базы знаний" : "Knowledge migration",
        weeklyCapacity: 36,
        timezone: "Europe/Minsk",
        skills: ru ? ["Данные", "Интерфейсы"] : ["Data", "Frontend"],
      },
    ],
    capacityAllocations: [
      {
        id: "CA-1",
        projectId: "atlas",
        memberId: "TM-1",
        week: "2026-W36",
        planned: 28,
      },
      {
        id: "CA-2",
        projectId: "atlas",
        memberId: "TM-2",
        week: "2026-W36",
        planned: 36,
      },
    ],
    changes: [
      {
        id: "CR-1",
        projectId: "atlas",
        change: ru
          ? "Добавить историю обращений в пилот"
          : "Add request history to pilot",
        requester: "Support Operations",
        reason: ru ? "Снижает повторные контакты" : "Reduces repeat contacts",
        scopeImpact: ru ? "+1 функция" : "+1 feature",
        scheduleImpact: ru ? "+5–8 дней" : "+5–8 days",
        costImpact: "+8,000 USD",
        riskImpact: ru
          ? "Расширяет объём проверки безопасности"
          : "Expands security scope",
        qualityImpact: ru
          ? "Нужны новые сценарии приёмки"
          : "New acceptance cases needed",
        alternatives: ru
          ? "После пилота; вариант только для чтения"
          : "After pilot; read-only option",
        recommendation: ru ? "После пилота" : "After pilot",
        decision: "",
        approver: ru ? "Игорь Волков" : "Igor Volkov",
        status: "assessing",
      },
    ],
    vendors: [
      {
        id: "V-1",
        projectId: "atlas",
        name: "SecureReview Ltd",
        scope: ru ? "Независимая проверка" : "Independent review",
        owner: ru ? "Олег Ян" : "Oleg Yan",
        deliverables: [ru ? "Отчёт о безопасности" : "Security report"],
        milestones: ["M-1"],
        cost: 8500,
        status: "at-risk",
        riskIds: ["R-1"],
        dependencyIds: ["DEP-1"],
        reviewNotes: ru
          ? "Нужна подтверждённая дата"
          : "Confirmed date required",
      },
    ],
    meetings: [
      {
        id: "MEET-1",
        projectId: "atlas",
        title: ru ? "Обзор готовности пилота" : "Pilot readiness review",
        date: "2026-09-08",
        attendees: ru
          ? ["Руководитель проекта", "Безопасность", "Операционная поддержка"]
          : ["Project Lead", "Security", "Support Ops"],
        agenda: [
          ru ? "Критерии запуска или остановки" : "Go/no-go criteria",
          ru ? "Незакрытые пробелы" : "Open gaps",
        ],
        notes: "",
        outputs: [ru ? "Решение D-1" : "Decision D-1"],
      },
    ],
    statusReports: [],
    lessons: [],
    communications: [
      {
        id: "COM-1",
        projectId: "atlas",
        audience: ru ? "Спонсор" : "Sponsor",
        purpose: ru ? "Решения и исключения" : "Decisions and exceptions",
        channel: ru ? "Пакет решения" : "Decision pack",
        cadence: ru ? "По необходимости, SLA 48ч" : "As needed, 48h SLA",
        owner: ru ? "Анна Смирнова" : "Anna Smirnova",
        successSignal: ru ? "Решение в SLA" : "Decision within SLA",
      },
    ],
    qualityGates: [
      {
        id: "QG-1",
        projectId: "atlas",
        title: ru ? "Готовность пилота" : "Pilot readiness",
        criteria: [
          ru ? "Критические сценарии пройдены" : "Critical flows pass",
          ru ? "Нет критических инцидентов" : "No Sev-1/2",
          ru ? "Откат проверен" : "Rollback verified",
        ],
        owner: ru ? "Ирина Соколова" : "Irina Sokolova",
        dueDate: "2026-09-26",
        status: "ready",
        evidence: ru
          ? "Отчёт испытаний, аудит доступности, журнал отката"
          : "Test report, accessibility audit, rollback log",
      },
    ],
    closureRecords: [
      {
        projectId: "atlas",
        finalAcceptance: false,
        handover: false,
        contractsAndBudget: false,
        remainingRisks: false,
        archiveAndEvidence: false,
        lessonsLearned: false,
        benefitsOwner: ru ? "Игорь Волков" : "Igor Volkov",
        benefitsReviewDate: "2027-03-31",
        updatedAt: now,
      },
    ],
    activities: [
      {
        id: "ACT-1",
        projectId: "atlas",
        at: now,
        type: "risk",
        message: ru
          ? "По риску R-1 начато выполнение мер"
          : "Risk R-1 moved to responding",
      },
    ],
    projectSettings: [
      {
        projectId: "atlas",
        enabledTypes: [
          "initiative",
          "epic",
          "feature",
          "story",
          "task",
          "subtask",
          "bug",
          "spike",
          "deliverable",
        ],
        wipLimits: { "in-progress": 3, review: 2 },
        governance: "standard",
        probabilityScale: 5,
        impactScale: 5,
      },
    ],
  };
}

function recordKey(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.id === "string") return `id:${record.id}`;
  if (typeof record.projectId === "string")
    return `project:${record.projectId}`;
  return undefined;
}

function localizeSeedValue(
  current: unknown,
  source: unknown,
  target: unknown,
): unknown {
  if (JSON.stringify(current) === JSON.stringify(source)) return target;
  if (
    Array.isArray(current) &&
    Array.isArray(source) &&
    Array.isArray(target)
  ) {
    const sourceEntries = source
      .map((item) => [recordKey(item), item] as const)
      .filter((entry): entry is readonly [string, unknown] =>
        Boolean(entry[0]),
      );
    const targetEntries = target
      .map((item) => [recordKey(item), item] as const)
      .filter((entry): entry is readonly [string, unknown] =>
        Boolean(entry[0]),
      );
    const sourceByKey = new Map(sourceEntries);
    const targetByKey = new Map(targetEntries);
    if (!sourceByKey.size) return current;
    return current.map((item) => {
      const key = recordKey(item);
      return key && sourceByKey.has(key) && targetByKey.has(key)
        ? localizeSeedValue(item, sourceByKey.get(key), targetByKey.get(key))
        : item;
    });
  }
  if (
    current &&
    source &&
    target &&
    typeof current === "object" &&
    typeof source === "object" &&
    typeof target === "object"
  ) {
    const result = { ...(current as Record<string, unknown>) };
    for (const key of Object.keys(result)) {
      result[key] = localizeSeedValue(
        result[key],
        (source as Record<string, unknown>)[key],
        (target as Record<string, unknown>)[key],
      );
    }
    return result;
  }
  return current;
}

/** Localizes only untouched bundled demo values; user-created and edited text is preserved byte-for-byte. */
export function localizeBundledDemo(
  workspace: Workspace,
  locale: Locale,
): Workspace {
  if (workspace.locale === locale) return workspace;
  const source = demoWorkspace(workspace.locale);
  const target = demoWorkspace(locale);
  const localized = localizeSeedValue(workspace, source, target) as Workspace;
  return { ...localized, locale };
}

/** A new workspace contains no bundled project records. */
export function emptyWorkspace(locale: Locale): Workspace {
  const seed = demoWorkspace(locale);
  return { ...seed, ...Object.fromEntries(Object.entries(seed).map(([key, value]) =>
    [key, Array.isArray(value) ? [] : value]
  )), id: "local-workspace", experience: "foundation" };
}
