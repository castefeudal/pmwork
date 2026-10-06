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
        <p className="eyebrow">
          PMWORK · {ru ? "Автор и принципы" : "Author and principles"}
        </p>
        <h1>{ru ? "Зачем существует PMWORK" : "Why PMWORK exists"}</h1>
        <div className="author-card">
          <div className="author-initials" aria-hidden="true">
            ПМ
          </div>
          <div>
            <h2>{ru ? "Павел Марков" : "Pavel Markov"}</h2>
            <p>
              {ru
                ? "Руководитель проектов и операционной деятельности, предприниматель и создатель образовательных и цифровых продуктов."
                : "Project & Operations Manager, entrepreneur, and creator of educational and digital products."}
            </p>
          </div>
        </div>
        <blockquote>
          {ru
            ? "Я хотел собрать место, в котором управление проектами перестаёт быть сотнями разрозненных терминов, книг, шаблонов и вкладок. PMWORK превращает знания в действия: понять контекст проекта, выбрать подход, собрать структуру, вести работу, риски, решения и документацию — и в любой момент понимать, что происходит и что делать дальше."
            : "I wanted one place where project management stops being hundreds of disconnected terms, books, templates, and tabs. PMWORK turns knowledge into action: understand the context, choose an approach, organize the work, manage risks, decisions, and documentation—and know what is happening and what to do next."}
        </blockquote>
        <h2>{ru ? "Управление в эпоху доступных вариантов" : "Management when creating is easier"}</h2>
        <p>{ru ? "Сегодня создать документ, код, презентацию или прототип проще, чем когда-либо. Но когда вариантов становится больше, важнее понять, что действительно стоит делать, в какой последовательности, с какими рисками и ради какого результата. Искусственный интеллект помогает производить варианты; ответственность за выбор и последствия остаётся у людей." : "It has never been easier to produce a document, code, a presentation or a prototype. More options make judgment more valuable: what deserves our time, in what order, with which risks, and toward what result? AI can help us create alternatives. People still own the choices and their consequences."}</p>
        <p>{ru ? "Я сделал PMWORK, чтобы удерживать этот контекст: увидеть сигнал, понять его значение, принять решение, превратить его в действие и проверить результат. Мне не нужна бюрократия ради бюрократии или одна методология на все случаи жизни. Я хочу, чтобы инструмент помогал принять лучшее решение, синхронизировать людей и сделать результат проверяемым." : "I built PMWORK to keep that context intact: notice a signal, understand it, make a decision, turn it into action, and check the result. I do not want paperwork for its own sake or one method applied to every situation. I want a tool that helps people make sound choices, coordinate their work, and verify what changed."}</p>
        <p>{ru ? "Для руководителей проектов, программ, поставки и операционной деятельности управление всё чаще означает создавать ясность в сложной системе. Именно для этой работы я развиваю PMWORK." : "For Project, Program, Delivery and Operations Managers, much of the job is creating clarity in a complex system. That is the work I am building PMWORK to support."}</p>
        <h2>{ru ? "Позиция продукта" : "Product position"}</h2>
        <p>
          {ru
            ? "Руководитель проекта не должен помнить профессию наизусть. Метод — средство, а не религия. Документ полезен, только если помогает решению, координации или проверке. Прозрачность важнее бюрократии, а ценность важнее механического выполнения процесса."
            : "A PM should not have to memorize the profession. A framework is a tool, not a religion. A document is useful only when it supports a decision, coordination, or verification. Transparency matters more than bureaucracy, and value more than mechanical process compliance."}
        </p>
        <h2>{ru ? "Граница ответственности" : "Boundary"}</h2>
        <p>
          {ru
            ? "PMWORK — независимый практический ресурс. Он не является официальным продуктом PMI, PeopleCert, ISO, Scrum.org или других владельцев упомянутых методик. Объяснения оригинальны; названия и товарные знаки принадлежат соответствующим владельцам."
            : "PMWORK is an independent practical resource. It is not an official product of PMI, PeopleCert, ISO, Scrum.org, or other framework owners. Explanations are original; names and trademarks belong to their respective owners."}
        </p>
      </main>
      <Footer locale={l} />
    </div>
  );
}
