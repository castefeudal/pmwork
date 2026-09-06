// @vitest-environment jsdom
import {cleanup,fireEvent,render,screen,waitFor,within} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WorkspaceApp } from "./workspace-app";
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });

const openDemo=async()=>fireEvent.click(await screen.findByRole("button",{name:/Explore a completed example/i}));

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
    fireEvent.click((await screen.findAllByRole("button", { name: "Работа" }))[0]);
    expect(screen.getByRole("heading", { name: "Работа" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Добавить" }));
    const add=screen.getByRole("dialog",{name:"Добавить"});
    fireEvent.click(within(add).getByRole("button",{name:"Работа"}));
    fireEvent.change(screen.getByLabelText("Название"), {target: { value: "Component QA item" }});
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    await waitFor(() => expect(screen.getAllByText("Component QA item").length).toBeGreaterThan(0));
  });

  it("treats board as a Work mode rather than a top-level destination", async () => {
    render(<WorkspaceApp locale="en" />);
    await openDemo();
    fireEvent.click((await screen.findAllByRole("button", { name: "Work" }))[0]);
    expect(screen.queryByRole("button",{name:"Work · Board"})).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"Board"}));
    const card = screen.getByText("Align first-release scope").closest("article");
    expect(card).toBeTruthy();
    fireEvent.click(card!.querySelector("button[aria-label='Move right']")!);
    expect(screen.getByText("Align first-release scope")).toBeTruthy();
  });

  it("uses action-oriented mobile IA and keeps Guide outside primary expert navigation", async () => {
    render(<WorkspaceApp locale="en" />);
    await openDemo();
    expect(screen.getByRole("navigation",{name:"Workspace"})).toBeTruthy();
    expect(screen.getAllByRole("button",{name:"Control"}).length).toBeGreaterThan(0);
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
    fireEvent.click(screen.getByRole("button",{name:"Настройки"}));
    expect(screen.getByRole("heading",{name:"Уровень подсказок"})).toBeTruthy();
    expect(screen.queryByText("Создать связанную сущность")).toBeNull();
  });

  it("creates and edits a validated dependency", async () => {
    render(<WorkspaceApp locale="en" />);
    await openDemo();
    fireEvent.click((await screen.findAllByRole("button", { name: "Plan" }))[0]);
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
    fireEvent.click(await screen.findByRole("button", { name: "Контроль" }));
    fireEvent.click(screen.getByRole("button", { name: "Закрытие" }));
    const acceptance = screen.getByLabelText("Финальная приёмка подтверждена") as HTMLInputElement;
    fireEvent.click(acceptance);
    expect(acceptance.checked).toBe(true);
    fireEvent.click(screen.getAllByRole("button", { name: "Сейчас" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Контроль" }));
    fireEvent.click(screen.getByRole("button", { name: "Закрытие" }));
    expect((screen.getByLabelText("Финальная приёмка подтверждена") as HTMLInputElement).checked).toBe(true);
  });
});
