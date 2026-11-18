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

const captions = {
  ru: {
    project: "Маршрут проекта с контрольными точками",
    program: "Пересечения между маршрутами программы",
    delivery: "Непрерывный поток поставки",
    operations: "Сетка наблюдений за процессом",
  },
  en: {
    project: "Project route with milestones",
    program: "Intersections between program tracks",
    delivery: "Continuous delivery flow",
    operations: "Process monitoring grid",
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
              <Image className="role-showcase-image" src={atlasAsset(`roles/${role}.webp`)} alt="" width={475} height={263} />
              <figcaption>{captions[locale][role]}</figcaption>
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
