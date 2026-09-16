"use client";
import type { Locale, Workspace } from "@/domain/schemas";
import { WorkspaceMore } from "./workspace-more";

type Props = {
  locale: Locale;
  candidate?: Workspace;
  snapshotLabel?: string;
  replacing: boolean;
  canExportCurrent: boolean;
  onExportCurrent: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function RecoveryConfirmDialog({locale,candidate,snapshotLabel,replacing,canExportCurrent,onExportCurrent,onCancel,onConfirm}:Props) {
  const ru=locale==="ru";
  const title=ru?"Подтвердите восстановление":"Confirm restore";
  return <WorkspaceMore title={title} onClose={onCancel}>
    <div className="stack">
      {candidate ? <>
        <p>{ru?"Копия успешно прошла проверку.":"The backup passed validation."}</p>
        <dl className="recovery-summary">
          <div><dt>{ru?"Схема":"Schema"}</dt><dd>v{candidate.schemaVersion}</dd></div>
          <div><dt>{ru?"Проекты":"Projects"}</dt><dd>{candidate.projects.length}</dd></div>
          <div><dt>{ru?"Работа":"Work items"}</dt><dd>{candidate.workItems.length}</dd></div>
          <div><dt>{ru?"Риски":"Risks"}</dt><dd>{candidate.risks.length}</dd></div>
        </dl>
      </> : <p>{ru?`Снимок: ${snapshotLabel??"—"}`:`Snapshot: ${snapshotLabel??"—"}`}</p>}
      <div className="notice">
        <strong>{replacing?(ru?"Текущее рабочее пространство будет заменено.":"The current workspace will be replaced."):(ru?"Копия станет текущим рабочим пространством.":"The backup will become the current workspace.")}</strong>
        <p>{replacing?(ru?"Перед заменой PMWORK создаст защитный локальный снимок. Исходные данные не очищаются автоматически при ошибке восстановления.":"Before replacement PMWORK creates a local safety snapshot. Original data is never cleared automatically on restore failure."):(ru?"Это первый запуск: существующее рабочее пространство не заменяется.":"This is first run: no existing workspace is being replaced.")}</p>
      </div>
      <div className="dialog-actions">
        {canExportCurrent&&<button className="button" type="button" onClick={onExportCurrent}>{ru?"Скачать текущую копию":"Download current backup"}</button>}
        <span className="spacer"/>
        <button className="button" type="button" onClick={onCancel}>{ru?"Отмена":"Cancel"}</button>
        <button className="button primary" type="button" onClick={onConfirm}>{ru?"Восстановить":"Restore"}</button>
      </div>
    </div>
  </WorkspaceMore>;
}
