import { expect, test } from "@playwright/test";
import { demoWorkspace } from "../../src/data/demo";
import { navigateWorkspace, route } from "./support";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(workspace => localStorage.setItem("pmwork:workspace:v3", JSON.stringify(workspace)), demoWorkspace("en"));
});

test("calendar shows stored dates and opens the source work record", async ({ page }) => {
  await page.goto(route("/en/workspace/"));
  await navigateWorkspace(page, "Work");
  await page.getByRole("button", { name: "Calendar", exact: true }).click();
  await expect(page.getByRole("region", { name: "Project calendar" })).toBeVisible();
  await page.locator(".calendar-day").filter({ has: page.locator("small") }).first().click();
  const event = page.locator(".calendar-event-link").first();
  await expect(event).toBeVisible();
  const title = await event.textContent();
  await event.click();
  const editor = page.getByRole("dialog");
  await expect(editor).toBeVisible();
  await expect(editor.getByLabel("Title")).toHaveValue(title?.trim() ?? "");
});

test("document library supports search, pinning, editing and Markdown download", async ({ page }, testInfo) => {
  await page.goto(route("/en/workspace/"));
  await navigateWorkspace(page, "Documents");
  await page.screenshot({ path: testInfo.outputPath("document-center.png"), fullPage: true });
  const card = page.getByRole("article").filter({ hasText: "Project Charter" });
  await expect(card).toBeVisible();
  await page.getByRole("button", { name: "Plan & control", exact: true }).click();
  await expect(card).toBeVisible();
  await page.getByRole("button", { name: "Status", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("No matching documents");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Pin Project Charter" }).click();
  await expect(card.getByRole("button", { name: "Unpin Project Charter" })).toHaveAttribute("aria-pressed", "true");
  const download = page.waitForEvent("download");
  await card.getByRole("button", { name: "Download Markdown" }).click();
  expect((await download).suggestedFilename()).toBe("Project Charter.md");
  await page.getByRole("textbox", { name: "Search documents" }).fill("self-service portal");
  await expect(card).toBeVisible();
  await page.getByRole("textbox", { name: "Search documents" }).fill("no matching item");
  await expect(page.getByRole("status")).toContainText("No matching documents");
});

test("status report creates an editable source-linked local document", async ({ page }) => {
  await page.goto(route("/en/workspace/"));
  await navigateWorkspace(page, "Control");
  await page.getByRole("button", { name: "Generate and edit status draft" }).click();
  const editor = page.getByRole("dialog");
  await expect(editor).toBeVisible();
  await expect(editor).toContainText("Executive summary");
  await expect(editor).toContainText("Source records");
  await expect(editor).toContainText("Reporting period");
});
