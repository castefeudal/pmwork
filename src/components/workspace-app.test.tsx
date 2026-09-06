// @vitest-environment jsdom
import {cleanup,fireEvent,render,screen,waitFor,within} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WorkspaceApp } from "./workspace-app";
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

const openDemo=async()=>fireEvent.click(await screen.findByRole("button",{name:/Explore a completed example/i}));
const desktopNav=()=>screen.getByRole("navigation",{name:/Разделы рабочего пространства|Workspace sections/});

describe("workspace interactions", () => {
  it("does not persist demo before an explicit choice", async () => {
    render(<WorkspaceApp locale="en" />);
    await screen.findByRole("heading", { name: "Start with a real project" });
    fireEvent(window, new Event("pagehide"));
    expect(localStorage.getItem("pmwork:workspace:v3")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Start my project/i }));
    expect(screen.getByRole("dialog", { name: "Create project" })).toBeTruthy();
    expect(screen.queryByText("MARKOVMADE Digital Product Launch")).toBeNull();
  });

  it("opens global add and creates work", async () => {
    render(<WorkspaceApp locale="ru" />);
    fireEvent.click(await screen.findByRole("button", { name: /Посмотреть готовый пример/i }));
    fireEvent.click(within(desktopNav()).getByRole("button", { name: "Работа" }));
    expect(screen.getByRole("heading", { name: "Работа" })).toBeTruthy();
    const addTrigger=screen.getByRole("button", { name: "Добавить" });
    expect(addTrigger).toBeTruthy();
    fireEvent.click(addTrigger!);
    const add=screen.getByRole("dialog",{name:"Добавить"});
    fireEvent.click(within(add).getByRole("button",{name:"Работа"}));
    fireEvent.change(screen.getByLabelText("Название"), {target: { value: "Component QA item" }});
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    await waitFor(() => expect(screen.getAllByText("Component QA item").length).toBeGreaterThan(0));
  });

  for (const locale of ["ru", "en"] as const) it(`distinguishes global Add from local work creation in ${locale}`, async () => {
    const ru = locale === "ru";
    render(<WorkspaceApp locale={locale} />);
    fireEvent.click(await screen.findByRole("button", { name: ru ? /Посмотреть готовый пример/ : /Explore a completed example/ }));
    fireEvent.click(within(desktopNav()).getByRole("button", { name: ru ? "Работа" : "Work" }));
    expect(screen.getAllByRole("button", { name: ru ? "Добавить" : "Add" })).toHaveLength(1);
    const local = screen.getByRole("button", { name: ru ? "Добавить работу" : "Add work item" });
    expect(local.classList.contains("primary")).toBe(false);
    fireEvent.click(local);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByLabelText(ru ? "Название" : "Title")).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: ru ? "Добавить" : "Add" })).toBeNull();
  });

  it("treats board as a Work mode rather than a top-level destination", async () => {
    render(<WorkspaceApp locale="en" />);
    await openDemo();
    fireEvent.click(within(desktopNav()).getByRole("button", { name: "Work" }));
    expect(within(desktopNav()).queryByRole("button",{name:"Board"})).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"Board"}));
    const card = screen.getByText("Align first-release scope").closest("article");
    expect(card).toBeTruthy();
    fireEvent.click(card!.querySelector("button[aria-label='Move right']")!);
    expect(screen.getByText("Align first-release scope")).toBeTruthy();
  });

  it("uses action-oriented mobile IA", async () => {
    render(<WorkspaceApp locale="en" />);
    await openDemo();
    const mobile=screen.getByRole("navigation",{name:"Workspace"});
    expect(within(mobile).getByRole("button",{name:"Today"})).toBeTruthy();
    expect(within(mobile).getByRole("button",{name:"Work"})).toBeTruthy();
    expect(within(mobile).getByRole("button",{name:"Plan"})).toBeTruthy();
    expect(within(mobile).getByRole("button",{name:"Control"})).toBeTruthy();
    expect(within(mobile).getByRole("button",{name:"More"})).toBeTruthy();
  });

  it("opens the command palette with a keyboard shortcut", async () => {
    render(<WorkspaceApp locale="en" />);
    await openDemo();
    await screen.findAllByRole("button", { name: "Work" });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeTruthy();
  });

  it("keeps Settings focused on settings rather than operational record creation", async () => {
    render(<WorkspaceApp locale="ru" />);
    fireEvent.click(await screen.findByRole("button", { name: /Посмотреть готовый пример/i }));
    fireEvent.click(within(desktopNav()).getByRole("button",{name:"Настройки"}));
    expect(screen.getByRole("heading",{name:"Уровень подсказок"})).toBeTruthy();
    expect(screen.queryByText("Создать связанную сущность")).toBeNull();
  });

  it("creates and edits a validated dependency", async () => {
    render(<WorkspaceApp locale="en" />);
    await openDemo();
    fireEvent.click(within(desktopNav()).getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("button", { name: "Dependencies" }));
    fireEvent.click(screen.getByRole("button", { name: "Add dependency" }));
    const successor = screen.getByLabelText("Successor") as HTMLSelectElement;
    expect(successor.options.length).toBeGreaterThan(1);
    fireEvent.change(successor, {target: { value: successor.options[1]!.value }});
    fireEvent.change(screen.getByLabelText("Owner"), {target: { value: "Delivery lead" }});
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() => expect(screen.getByText("Delivery lead")).toBeTruthy());
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    fireEvent.click(editButtons[editButtons.length - 1]!);
    expect(screen.getByRole("dialog", { name: "Edit dependency" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Owner"), {target: { value: "Program lead" }});
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByText("Program lead")).toBeTruthy());
  });

  it("keeps project closure state while navigating", async () => {
    render(<WorkspaceApp locale="ru" />);
    fireEvent.click(await screen.findByRole("button", { name: /Посмотреть готовый пример/i }));
    fireEvent.click(within(desktopNav()).getByRole("button", { name: "Контроль" }));
    fireEvent.click(screen.getByRole("button", { name: "Закрытие" }));
    const acceptance = screen.getByLabelText("Финальная приёмка подтверждена") as HTMLInputElement;
    fireEvent.click(acceptance);
    expect(acceptance.checked).toBe(true);
    fireEvent.click(within(desktopNav()).getByRole("button", { name: "Сейчас" }));
    fireEvent.click(within(desktopNav()).getByRole("button", { name: "Контроль" }));
    fireEvent.click(screen.getByRole("button", { name: "Закрытие" }));
    expect((screen.getByLabelText("Финальная приёмка подтверждена") as HTMLInputElement).checked).toBe(true);
  });
});
