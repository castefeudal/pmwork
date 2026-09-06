import { catalogMetadata } from "@/domain/public-metadata";
export const generateMetadata = ({params}: {params: Promise<{locale:string}>}) => catalogMetadata(params, "privacy");
import { notFound } from "next/navigation";
import type { Locale } from "@/domain/schemas";
import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";
export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "en") notFound();
  const l = locale as Locale,
    ru = l === "ru";
  return (
    <div>
      <PublicHeader locale={l} />
      <main id="main" className="article">
        <p className="eyebrow">PMWORK · Privacy</p>
        <h1>
          {ru
            ? "Ваши проекты остаются на устройстве"
            : "Your projects stay on your device"}
        </h1>
        <p>
          {ru
            ? "PMWORK хранит данные локально. Созданные проекты, рабочие элементы, риски, решения и документы сохраняются в IndexedDB браузера, с локальным зеркалом в localStorage и снимками восстановления. Для работы не нужна учётная запись, а данные проекта не отправляются на сервер PMWORK."
            : "PMWORK is local-first. Projects, work items, risks, decisions, and documents are stored in browser IndexedDB, with a localStorage mirror and recovery snapshots. No account is required, and project data is not sent to a PMWORK server."}
        </p>
        <h2>{ru ? "Контроль данных" : "Data control"}</h2>
        <ul>
          <li>
            {ru
              ? "Полная резервная копия в формате JSON доступна в настройках рабочего пространства."
              : "A full JSON backup is available in workspace settings."}
          </li>
          <li>
            {ru
              ? "Импорт проверяет версию и структуру файла до сохранения."
              : "Import validates file version and structure before saving."}
          </li>
          <li>
            {ru
              ? "Очистка хранилища браузера удалит локальные данные; регулярно создавайте резервные копии важных проектов."
              : "Clearing browser storage removes local data; back up important projects regularly."}
          </li>
          <li>
            {ru
              ? "Системы аналитики, рекламные SDK и цифровые отпечатки не используются."
              : "No analytics, advertising SDK, or fingerprinting is included."}
          </li>
        </ul>
        <p>
          <small>
            {ru
              ? "Последняя проверка: 4 сентября 2026."
              : "Last reviewed: September 4, 2026."}
          </small>
        </p>
      </main>
      <Footer locale={l} />
    </div>
  );
}
