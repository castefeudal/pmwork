"use client";
import {useRef,type ReactNode} from "react";
import Image from "next/image";
import {Database,LockKeyhole} from "lucide-react";
import type {Locale} from "@/domain/schemas";
import {managementRoles,roleLabels,type ManagementRole} from "@/domain/management-role";
import {PlateMarks,atlasAsset} from "./atlas-marks";
import {Brand} from "./brand";
export type WorkspaceIntent = {kind:"project"|"demo"|"restore";role:ManagementRole;priority:string;file?:File};
export function WorkspaceWelcome({locale,role:firstRole,onRole:setFirstRole,priority:firstPriority,onPriority:setFirstPriority,onCreate,onDemo,onImport,notice,children,busy=false}:{locale:Locale;role:ManagementRole;onRole:(role:ManagementRole)=>void;priority:string;onPriority:(priority:string)=>void;onCreate:()=>void;onDemo:()=>void;onImport:(file:File)=>void;notice?:string;children?:ReactNode;busy?:boolean}) {
  const ru=locale==="ru",fileRef=useRef<HTMLInputElement>(null);
  const firstRunStartLabel = ({
    project: ru ? "Создать пустой проект" : "Create an empty project",
    program: ru ? "Открыть программы" : "Open programs",
    delivery: ru ? "Создать проект поставки" : "Create a delivery project",
    operations: ru ? "Открыть операционную работу" : "Open operations",
  } as const)[firstRole];
  const firstRunStartHint = firstRole === "project" || firstRole === "delivery"
    ? (ru ? "Задачи и сроки можно добавить позже." : "Add work items and dates when you are ready.")
    : (ru ? "Раздел откроется без демо-записей." : "The section opens without sample records.");
  const firstRunPreferencesHint = firstRole === "program" || firstRole === "operations"
    ? (ru ? "Откроется соответствующий рабочий раздел." : "The matching work area opens by default.")
    : (ru ? "По умолчанию откроется обзор проекта." : "The project overview opens by default.");

  return (
    <main className="language-gate first-run-gate" aria-busy={busy}>
      <Brand />
      <div className="first-run-hero">
        <div className="first-run-copy">
          <p className="eyebrow">{ru ? "НАЧАЛО РАБОТЫ" : "GET STARTED"}</p>
          <h1>{ru ? "Создайте проект или откройте пример" : "Create a project or open the example"}</h1>
          <p className="lead">{ru ? "Новый проект будет пустым. В демонстрационном уже есть задачи, сроки, риски и решения — на нём можно посмотреть, как устроен PMWORK." : "A new project starts empty. The sample includes work items, dates, risks, and decisions so you can see how PMWORK works."}</p>
        </div>
      </div>
      <div className="first-run-assurance"><span className="first-run-assurance-mark" aria-hidden="true">i</span><span><strong>{ru ? "Выберите, с чего начать" : "Choose how to start"}</strong><small>{ru ? "Создайте свой проект или откройте пример с готовыми записями." : "Create your own project or open the sample with example records."}</small></span></div>
      {busy&&<p role="status" className="first-run-checking">{ru?"Проверяем локальные данные. Сохранённое пространство откроется автоматически.":"Checking local data. Your saved workspace will open automatically."}</p>}
      <fieldset className="first-run-controls" disabled={busy} aria-label={ru?"Начало работы":"Getting started"}>
      <div className="first-run-actions">
        <button className="button primary first-run-option" onClick={onCreate}><span className="first-run-option-icon" aria-hidden="true">↗</span><span><strong>{firstRunStartLabel}</strong><small>{firstRunStartHint}</small></span><span className="first-run-option-arrow" aria-hidden="true">→</span></button>
        <button className="button first-run-option" onClick={onDemo}><span className="first-run-option-icon first-run-example-icon" aria-hidden="true"><Database size={17}/></span><span><strong>{ru ? "Посмотреть готовый пример" : "Explore a completed example"}</strong><small>{ru ? "Задачи, риски, решения и сроки уже заполнены." : "Work items, risks, decisions, and dates are already there."}</small></span><span className="first-run-option-arrow" aria-hidden="true">→</span></button>
        <details className="first-run-preferences">
          <summary>{ru ? "Дополнительно: выбрать рабочий раздел" : "Optional: choose a starting section"}</summary>
          <p>{ru ? `Эта настройка не обязательна. ${firstRunPreferencesHint}` : `These settings are optional. ${firstRunPreferencesHint}`}</p>
          <div className="first-run-preference-fields">
            <label className="field"><span>{ru ? "Тип работы" : "Type of work"}</span><select value={firstRole} onChange={e=>setFirstRole(e.target.value as ManagementRole)}>{managementRoles.map(role=><option key={role} value={role}>{roleLabels[locale][role]}</option>)}</select></label>
            {firstRole !== "program" && firstRole !== "operations" && <label className="field"><span>{ru ? "Какой раздел открыть первым?" : "Which section should open first?"}</span><select value={firstPriority} onChange={e=>setFirstPriority(e.target.value)}><option value="attention">{ru ? "Обзор проекта" : "Project overview"}</option><option value="organize">{ru ? "Список задач" : "Work items"}</option><option value="deadline">{ru ? "Сроки и план" : "Schedule and plan"}</option><option value="learn">{ru ? "Обучающий обзор" : "Guided tour"}</option></select></label>}
          </div>
        </details>
        <button className="button ghost first-run-restore" onClick={() => fileRef.current?.click()}>{ru ? "Восстановить из резервной копии" : "Restore from a backup"}</button>
      </div>
      </fieldset>
      <figure className="atlas-plate first-run-plate">
        <PlateMarks />
        <Image className="first-run-plate-image" src={atlasAsset("onboarding/atlas-plates-dark.webp")} alt={ru ? "Карта рабочих пластин: обзор, сроки, риски и решения нанесены на один лист." : "An atlas sheet: overview, schedule, risks and decisions plotted on one plate."} width={1100} height={880} sizes="(max-width: 860px) 100vw, 300px" priority />
      </figure>
      <p className="first-run-privacy"><LockKeyhole className="first-run-privacy-icon" size={16} strokeWidth={1.8} aria-hidden="true"/>{ru ? "Данные хранятся в браузере. Резервную копию можно скачать в настройках." : "Data is stored in this browser. Download a backup from Settings."}</p>
      <input hidden ref={fileRef} type="file" accept="application/json" onChange={e=>{const file=e.target.files?.[0];if(file)onImport(file);e.currentTarget.value="";}}/>
      {notice&&<p role="alert">{notice}</p>}
      {children}
    </main>
  );
}
