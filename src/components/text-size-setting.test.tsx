// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TextSizeSetting } from "./text-size-setting";

afterEach(() => { cleanup(); localStorage.clear(); delete document.documentElement.dataset.textSize; vi.restoreAllMocks(); });
it("persists size independently of theme and contrast, and validates storage events", () => {
  document.documentElement.dataset.theme = "dark";
  document.documentElement.dataset.contrast = "more";
  render(<TextSizeSetting locale="en"/>);
  const select = screen.getByRole("combobox", {name:"Text size"});
  fireEvent.change(select, {target:{value:"large"}});
  expect(localStorage.getItem("pmwork-text-size")).toBe("large");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(document.documentElement.dataset.contrast).toBe("more");
  fireEvent(window, new StorageEvent("storage", {key:"pmwork-text-size",newValue:"invalid"}));
  expect((select as HTMLSelectElement).value).toBe("standard");
});
it("keeps the setting usable when storage is unavailable", () => {
  vi.spyOn(Storage.prototype,"setItem").mockImplementation(() => { throw Error("unavailable"); });
  render(<TextSizeSetting locale="ru"/>);
  fireEvent.change(screen.getByRole("combobox"), {target:{value:"extra-large"}});
  expect(document.documentElement.dataset.textSize).toBe("extra-large");
});
