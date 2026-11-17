import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function openCampus(page: Page) {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Log in", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("University email").fill("student.a@thapar.edu");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.DEMO_PASSWORD!);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.locator(".campus-home")).toBeVisible();
  await expect(page.locator(".home-feed .post-card").first()).toBeVisible();
  await expect(page.locator(".feed-skeleton")).toHaveCount(0);
}
test("Midnight homepage prioritizes existing community content at desktop and mobile sizes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openCampus(page);
  await expect(page.locator(".workspace")).toHaveClass(/dark/);
  await expect(page.locator(".welcome-banner,.stat-grid")).toHaveCount(0);
  await expect(page.getByLabel("Post content")).toBeVisible();
  await expect(
    page.locator(".discovery-rail .opportunity-mini").first(),
  ).toBeVisible();
  expect(
    (await page.locator(".home-feed .post-card").first().boundingBox())!.y,
  ).toBeLessThan(620);
  await page.screenshot({
    path: "docs/screenshots/midnight-home-desktop.png",
    fullPage: false,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Academic", exact: true }).click();
  await expect(page.locator(".home-feed .post-card")).toHaveCount(1);
  await expect(page.locator(".home-feed .post-card")).toContainText(
    "What helped you move from learning SQL",
  );
  await page.getByRole("button", { name: "For campus", exact: true }).click();
  await expect(page.locator(".home-feed .post-card")).toHaveCount(4);
  await page.setViewportSize({ width: 390, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (await page.locator(".home-feed .post-card").first().boundingBox())!.y,
  ).toBeLessThan(650);
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await expect(page.locator(".sidebar")).toHaveClass(/open/);
  await page
    .getByRole("button", { name: "Close navigation", exact: true })
    .click();
  await expect(page.locator(".sidebar")).not.toHaveClass(/open/);
  await page.screenshot({
    path: "docs/screenshots/midnight-home-mobile.png",
    fullPage: false,
    animations: "disabled",
  });
});
test("Light theme remains usable, accessible and persists after refresh", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openCampus(page);
  await page
    .getByRole("button", { name: "Switch to light mode", exact: true })
    .press("Enter");
  await expect(page.locator(".workspace")).toHaveClass(/light/);
  await page.reload();
  await expect(page.locator(".workspace")).toHaveClass(/light/);
  await expect(page.locator(".home-feed .post-card").first()).toBeVisible();
  await expect(page.locator(".skeleton")).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.screenshot({
    path: "docs/screenshots/midnight-home-light.png",
    fullPage: false,
    animations: "disabled",
  });
});
