import Image from "next/image";
import { Fragment } from "react";
import { managementRoles, roleLabels, roleQuestions } from "@/domain/management-role";
import type { Locale } from "@/domain/schemas";
import { PlateMarks, atlasAsset } from "./atlas-marks";
import { RoleTabs } from "./role-tabs";

const examples = {
  ru: { project: ["Прогноз контрольной точки позже базового срока", "Согласовать восстановление срока с владельцем", "Обновить план и назначить следующий шаг"], program: ["Передача между двумя проектами заблокирована", "Определить приоритет общего ресурса", "Согласовать работу компонентов вокруг общей цели"], delivery: ["Обязательство поставки заблокировано", "Снять блокер и перепроверить прогноз", "Обновить обязательство по фактическим данным"], operations: ["Метрика процесса вышла за допустимую границу", "Назначить корректирующее действие", "Проверить отклонение на следующем обзоре"] },
  en: { project: ["Milestone forecast is later than baseline", "Agree schedule recovery with the owner", "Update the plan and assign a next step"], program: ["A handoff between two projects is blocked", "Set the shared resource priority", "Agree how components will support the shared goal"], delivery: ["A delivery commitment is blocked", "Resolve the blocker and review the forecast", "Update the commitment using observed data"], operations: ["A process metric exceeds its operating limit", "Assign a corrective action", "Review the deviation at the next check"] },
};

/* Each role is drawn as its own chart so the four read apart before any text is
   read: one spine, one converging web, one obstructed flow, one cyclic band. */
const plates = {
  ru: {
    project: { caption: "Один маршрут с контрольными точками", alt: "Карта одного маршрута с четырьмя контрольными точками и базовой шкалой сроков" },
    program: { caption: "Три маршрута сходятся в общий результат", alt: "Карта трёх сходящихся маршрутов с общим узлом и связанными ресурсами" },
    delivery: { caption: "Поток, блокер и обходной путь к границе поставки", alt: "Карта трёх параллельных полос потока с отмеченным блокером и обходом к границе поставки" },
    operations: { caption: "Цикл контроля и выход метрики за границу", alt: "Карта концентрических циклов с полосами допуска и одним отклонением выше границы" },
  },
  en: {
    project: { caption: "One route with its milestones", alt: "Chart of a single route with four milestone points and a date baseline" },
    program: { caption: "Three routes converge on one outcome", alt: "Chart of three converging routes with a shared hub and linked resources" },
    delivery: { caption: "Flow, a blocker, and a bypass to the delivery line", alt: "Chart of three parallel flow lanes with a marked blocker and a bypass to the delivery boundary" },
    operations: { caption: "Control cycles and one metric outside its band", alt: "Chart of concentric control cycles with tolerance bands and one excursion above the limit" },
  },
};

/**
 * Every role sheet ships in the prerendered HTML: the switching is behaviour, so
 * only the four tab labels and a click handler reach the browser as JavaScript.
 */
export function RoleShowcase({ locale }: { locale: Locale }) {
  const ru = locale === "ru";
  return (
    <section className="section role-showcase">
      <div className="role-showcase-heading">
        <h2>{ru ? "Примеры по типам работы" : "Examples by work type"}</h2>
        <RoleTabs
          label={ru ? "Типы работы" : "Work types"}
          roles={managementRoles.map((value) => ({ value, label: roleLabels[locale][value] }))}
        />
      </div>
      <div className="panel role-showcase-panel" aria-live="polite">
        {managementRoles.map((role, index) => (
          <Fragment key={role}>
            <figure className="atlas-plate role-showcase-plate" data-role-view={role} hidden={index === 0 ? undefined : true}>
              <PlateMarks />
              <Image className="role-showcase-image" src={atlasAsset(`roles/${role}-dark.webp`)} alt={plates[locale][role].alt} width={960} height={720} sizes="(max-width: 900px) 100vw, 460px" />
              <figcaption>{plates[locale][role].caption}</figcaption>
            </figure>
            <div className="role-showcase-body" data-role-view={role} hidden={index === 0 ? undefined : true}>
              <p className="eyebrow">{ru ? "Возможный сценарий" : "Example scenario"}</p>
              <h3>{roleQuestions[locale][role]}</h3>
              <dl>
                <div><dt>{ru ? "Сигнал" : "Signal"}</dt><dd>{examples[locale][role][0]}</dd></div>
                <div><dt>{ru ? "Действие" : "Next step"}</dt><dd>{examples[locale][role][1]}</dd></div>
                <div><dt>{ru ? "Что проверить дальше" : "What to check next"}</dt><dd>{examples[locale][role][2]}</dd></div>
              </dl>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
