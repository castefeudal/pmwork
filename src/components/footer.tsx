import Link from "next/link";
import type { Locale } from "@/domain/schemas";
export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="footer">
      <span>
        © 2026 PMWORK · {locale === "ru" ? "Павел Марков" : "Pavel Markov"}
      </span>
      <span>
        {locale === "ru"
          ? "Независимый ресурс; не связан с PMI, PeopleCert или владельцами методологий."
          : "Independent resource; not affiliated with PMI, PeopleCert, or framework owners."}
      </span>
      <span>
        <Link href={`/${locale}/sources`}>
          {locale === "ru" ? "Источники" : "Sources"}
        </Link>{" "}
        ·{" "}
        <Link href={`/${locale}/privacy`}>
          {locale === "ru" ? "Конфиденциальность" : "Privacy"}
        </Link>{" "}
        ·{" "}
        <Link href={`/${locale}/about`}>
          {locale === "ru" ? "О проекте" : "About"}
        </Link>
      </span>
    </footer>
  );
}
