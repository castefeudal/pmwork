import Image from "next/image";
import { CircleDot, GitBranch, ShieldCheck, Waypoints } from "lucide-react";
import type { Locale } from "@/domain/schemas";
import { atlasAsset } from "./atlas-marks";

const copy = {
  ru: {
    eyebrow: "ОПЕРАТИВНАЯ КАРТА",
    title: "От сигнала до контроля — один маршрут",
    lead: "PMWORK не хранит записи по отдельности. Наблюдение связывается с решением, решение — с действием, действие — с проверкой. Каждый переход остаётся видимым на карте проекта.",
    steps: [
      { name: "Сигнал", body: "Просроченный срок, блокер или риск, у которого истекла дата пересмотра." },
      { name: "Решение", body: "Выбор с владельцем, основанием и датой, когда к нему вернутся." },
      { name: "Действие", body: "Следующий шаг в работе: он меняет запись, а не остаётся заметкой." },
      { name: "Контроль", body: "Факт против плана: отклонение видно до контрольной точки, а не после." },
    ],
    caption: "Карта управленческого цикла PMWORK. Записи на карте — демонстрационные данные проекта.",
  },
  en: {
    eyebrow: "OPERATIONAL ATLAS",
    title: "From signal to control — one route",
    lead: "PMWORK does not keep records apart. An observation connects to a decision, a decision to an action, an action to a check. Every hop stays visible on the project map.",
    steps: [
      { name: "Signal", body: "A missed date, a blocker, or a risk whose review date has passed." },
      { name: "Decision", body: "A choice with an owner, the evidence behind it, and a date to revisit." },
      { name: "Action", body: "The next step in work: it changes a record instead of staying a note." },
      { name: "Control", body: "Actual against plan, so variance shows before the milestone, not after." },
    ],
    caption: "PMWORK management loop. The records on this chart are the sample project data.",
  },
} as const;

const markers = [CircleDot, GitBranch, Waypoints, ShieldCheck];

export function AtlasBand({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <section className="atlas-band" aria-labelledby="atlas-band-title">
      <div className="atlas-band-plate">
        <Image
          src={atlasAsset("hero/atlas-band-dark.webp")}
          alt=""
          aria-hidden="true"
          width={1400}
          height={934}
          loading="lazy"
          sizes="100vw"
        />
      </div>
      <div className="atlas-band-inner">
        <div className="atlas-band-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="atlas-band-title">{t.title}</h2>
          <p>{t.lead}</p>
        </div>
        <ol className="atlas-loop">
          {t.steps.map((step, index) => {
            const Marker = markers[index];
            return (
              <li key={step.name} className="atlas-loop-step">
                <span className="atlas-loop-index" aria-hidden="true">
                  <Marker size={17} strokeWidth={1.9} />
                </span>
                <h3>{step.name}</h3>
                <p>{step.body}</p>
              </li>
            );
          })}
        </ol>
        <p className="atlas-band-caption">{t.caption}</p>
      </div>
    </section>
  );
}
