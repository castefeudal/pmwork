// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WorkspaceApp } from "./workspace-app";
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });
describe("workspace interactions", () => {
  it("does not persist demo before an explicit choice", async () => {
    render(<WorkspaceApp locale="en" />);
    await screen.findByRole("heading", { name: "Start working in PMWORK" });
    fireEvent(window, new Event("pagehide"));
    expect(localStorage.getItem("pmwork:workspace:v3")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Create first project" }));
    expect(screen.getByRole("dialog", { name: "Create project" })).toBeTruthy();
    expect(screen.queryByText("Atlas Digital Product Launch")).toBeNull();
  });

  it("switches views and adds work", async () => {
    render(<WorkspaceApp locale="ru" />);
    fireEvent.click(await screen.findByRole("button", { name: "Посмотреть готовый пример" }));
    fireEvent.click((await screen.findAllByRole("button", { name: "Работа" }))[0]);
    expect(screen.getByRole("heading", { name: "Работа" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Добавить" }));
    fireEvent.change(screen.getByLabelText("Название"), {
      target: { value: "Component QA item" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    await waitFor(() =>
      expect(screen.getAllByText("Component QA item").length).toBeGreaterThan(0),
    );
  });
  it("moves a board card with accessible controls", async () => {
    render(<WorkspaceApp locale="en" />);
    fireEvent.click(await screen.findByRole("button", { name: "Explore demo" }));
    fireEvent.click(await screen.findByRole("button", { name: "Work · Board" }));
    const card = screen
      .getByText("Align first-release scope")
      .closest("article");
    expect(card).toBeTruthy();
    fireEvent.click(card!.querySelector("button[aria-label='Move right']")!);
    expect(screen.getByText("Align first-release scope")).toBeTruthy();
  });
  it("opens the command palette with a keyboard shortcut", async () => {
    render(<WorkspaceApp locale="en" />);
    fireEvent.click(await screen.findByRole("button", { name: "Explore demo" }));
    await screen.findAllByRole("button", { name: "Work" });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(
      screen.getByRole("dialog", { name: "Command palette" }),
    ).toBeTruthy();
  });

  it("creates and edits a validated dependency", async () => {
    render(<WorkspaceApp locale="en" />);
    fireEvent.click(await screen.findByRole("button", { name: "Explore demo" }));
    fireEvent.click((await screen.findAllByRole("button", { name: "Planning" }))[0]);
    fireEvent.click(screen.getByRole("button", { name: "Dependencies" }));
    fireEvent.click(screen.getByRole("button", { name: "Add dependency" }));

    const successor = screen.getByLabelText("Successor") as HTMLSelectElement;
    expect(successor.options.length).toBeGreaterThan(1);
    fireEvent.change(successor, {
      target: { value: successor.options[1]!.value },
    });
    fireEvent.change(screen.getByLabelText("Owner"), {
      target: { value: "Delivery lead" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(screen.getByText("Delivery lead")).toBeTruthy());
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    fireEvent.click(editButtons[editButtons.length - 1]!);
    expect(
      screen.getByRole("dialog", { name: "Edit dependency" }),
    ).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Owner"), {
      target: { value: "Program lead" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByText("Program lead")).toBeTruthy());
  });

  it("keeps project closure state while navigating", async () => {
    render(<WorkspaceApp locale="ru" />);
    fireEvent.click(await screen.findByRole("button", { name: "Посмотреть готовый пример" }));
    fireEvent.click(await screen.findByRole("button", { name: "Контроль" }));
    fireEvent.click(screen.getByRole("button", { name: "Закрытие" }));
    const acceptance = screen.getByLabelText(
      "Финальная приёмка подтверждена",
    ) as HTMLInputElement;
    fireEvent.click(acceptance);
    expect(acceptance.checked).toBe(true);

    fireEvent.click(screen.getAllByRole("button", { name: "Обзор" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Контроль" }));
    fireEvent.click(screen.getByRole("button", { name: "Закрытие" }));
    expect(
      (
        screen.getByLabelText(
          "Финальная приёмка подтверждена",
        ) as HTMLInputElement
      ).checked,
    ).toBe(true);
  });
});
