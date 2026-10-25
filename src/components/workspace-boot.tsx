import type { Locale } from "@/domain/schemas";
import { Brand } from "./brand";
export function WorkspaceBoot({locale}:{locale:Locale}) {
  const ru=locale==="ru";
  return (
    <main className="language-gate first-run-gate workspace-boot" aria-busy="true" aria-label={ru ? "Загрузка PMWORK" : "Loading PMWORK"}>
      <header className="boot-header"><Brand/><span><i />{ru ? "РАБОТАЕТ НА ЭТОМ УСТРОЙСТВЕ" : "RUNNING ON THIS DEVICE"}</span></header>
      <section className="boot-center" aria-live="polite">
        <p className="eyebrow">{ru ? "ПОДГОТАВЛИВАЕМ ВАШЕ ПРОСТРАНСТВО" : "PREPARING YOUR WORKSPACE"}</p>
        <h1>{ru ? "Собираем всё в одну ясную картину." : "Bringing your work into focus."}</h1>
        <p className="boot-status" role="status">{ru ? "Аккуратно проверяем локальные данные и контекст проекта" : "Checking your local data and project context"}</p>
        <div className="boot-progress" aria-hidden="true"><span /></div>
        <span className="boot-privacy">{ru ? "Ваши данные не покидают это устройство" : "Your data stays on this device"}</span>
      </section>
      <footer className="boot-footer"><span>PMWORK <i>·</i> PROJECT OPERATING SPACE</span><span>{ru ? "Приватно по умолчанию" : "Private by default"}</span></footer>
    </main>
  );
}
