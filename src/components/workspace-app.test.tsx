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
afterEach(cleanup);
describe("workspace interactions", () => {
  it("switches views and adds work", async () => {
    render(<WorkspaceApp locale="ru" />);
    fireEvent.click(await screen.findByRole("button", { name: "Работа" }));
    expect(screen.getByRole("heading", { name: "Работа" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Добавить" }));
    fireEvent.change(screen.getByLabelText("Название"), {
      target: { value: "Component QA item" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Создать" }));
    await waitFor(() =>
      expect(screen.getByText("Component QA item")).toBeTruthy(),
    );
  });
  it("moves a board card with accessible controls", async () => {
    render(<WorkspaceApp locale="en" />);
    fireEvent.click(await screen.findByRole("button", { name: "Board" }));
    const card = screen
      .getByText("Align first-release scope")
      .closest("article");
    expect(card).toBeTruthy();
    fireEvent.click(card!.querySelector("button[aria-label='Move right']")!);
    expect(screen.getByText("Align first-release scope")).toBeTruthy();
  });
  it("opens the command palette with a keyboard shortcut", async () => {
    render(<WorkspaceApp locale="en" />);
    await screen.findByRole("button", { name: "Work" });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(
      screen.getByRole("dialog", { name: "Command palette" }),
    ).toBeTruthy();
  });

  it("creates and edits a validated dependency", async () => {
    render(<WorkspaceApp locale="en" />);
    fireEvent.click(await screen.findByRole("button", { name: "Planning" }));
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
    fireEvent.click(await screen.findByRole("button", { name: "Контроль" }));
    fireEvent.click(screen.getByRole("button", { name: "Закрытие" }));
    const acceptance = screen.getByLabelText(
      "Финальная приёмка подтверждена",
    ) as HTMLInputElement;
    fireEvent.click(acceptance);
    expect(acceptance.checked).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Обзор" }));
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
