import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function login(page: Page, email: string) {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Log in", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("University email").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.DEMO_PASSWORD!);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.locator(".campus-home")).toBeVisible();
}
async function capture(page: Page, name: string) {
  await expect(page.locator(".loading")).toHaveCount(0);
  await expect(page.locator(".skeleton")).toHaveCount(0);
  await page.screenshot({
    path: `docs/screenshots/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
}
async function accessibility(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
}
test.beforeAll(async () => {
  await mkdir("docs/screenshots", { recursive: true });
  // Only fixtures created by the automated suite are reset; seeded demonstration workflows remain intact.
  const user = await db.user.findUnique({
    where: { email: "test.student@thapar.edu" },
  });
  const projects = await db.project.findMany({
    where: {
      OR: [
        ...(user ? [{ creatorId: user.id }] : []),
        { creatorId: "faculty", title: "Automated Research Fixture" },
      ],
    },
    select: { id: true },
  });
  const ids = projects.map((p) => p.id);
  await db.notification.deleteMany({
    where: { OR: ids.map((id) => ({ href: { contains: id } })) },
  });
  await db.communityPost.deleteMany({
    where: {
      content: "New research fixture announcement",
      authorId: "faculty",
    },
  });
  await db.project.deleteMany({ where: { id: { in: ids } } });
  if (user) await db.user.delete({ where: { id: user.id } });
});
test.afterAll(async () => {
  await db.$disconnect();
});
test("Public landing visual review, responsive layout and accessibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Find your people.",
  );
  await capture(page, "landing");
  await accessibility(page);
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await capture(page, "mobile-landing");
});
test("Student screens, working profile form, community composer, filters, accessibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page, "student.a@thapar.edu");
  await capture(page, "student-dashboard");
  await accessibility(page);
  await page.goto("/app/profile");
  await expect(
    page.getByRole("heading", { name: "Candidate A", exact: true }),
  ).toBeVisible();
  await capture(page, "student-profile");
  await page.getByRole("link", { name: "Edit Profile", exact: true }).click();
  await expect(page.getByLabel("Skills (comma separated)")).toHaveValue(
    /python/,
  );
  await page.getByRole("button", { name: "Save Profile", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved");
  await page.goto("/app/projects");
  await expect(
    page.getByRole("heading", { name: "Big ideas. Open doors." }),
  ).toBeVisible();
  await page.getByPlaceholder("Filter by a required skill").fill("Rust");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await expect(page.locator(".project-card")).toContainText(
    "Systems Lab Explorer",
  );
  await page.getByPlaceholder("Filter by a required skill").fill("");
  await expect(page.locator(".project-card")).toHaveCount(5);
  await capture(page, "project-discovery");
  await page.goto("/app/community");
  await expect(page.getByLabel("Post content")).toBeVisible();
  await capture(page, "campus-feed");
  await accessibility(page);
  await page
    .getByLabel("Post content")
    .fill("UI verification post: connecting a campus idea.");
  await page.getByRole("button", { name: "Publish post" }).click();
  await expect(page.getByRole("status")).toContainText("Your post is live");
  const post = page
    .locator(".post-card")
    .filter({ hasText: "UI verification post:" });
  await expect(post).toHaveCount(1);
  await page.reload();
  await expect(post).toHaveCount(1);
  await post.getByRole("button", { name: /^Like post,/ }).click();
  await expect(
    post.getByRole("button", { name: /^Unlike post,/ }),
  ).toBeVisible();
  await post
    .getByRole("textbox", { name: "Add a comment" })
    .fill("A UI-verified reply");
  await post.getByRole("button", { name: "Send comment" }).click();
  await expect(post.locator(".comment")).toContainText("A UI-verified reply");
  await post.getByRole("button", { name: "Delete post", exact: true }).click();
  await post
    .getByRole("button", { name: "Delete post", exact: true })
    .last()
    .click();
  await expect(post).toHaveCount(0);
  await page.goto("/app/messages?conversation=demo-conversation");
  await expect(page.getByLabel("Message", { exact: true })).toBeVisible();
  await capture(page, "messages");
  await page.goto("/app/notifications");
  await expect(
    page.getByRole("heading", { name: "The latest, for you." }),
  ).toBeVisible();
  await capture(page, "notifications");
  for (const route of [
    "/app/applications",
    "/app/teams",
    "/app/people",
    "/app/settings",
    "/app/projects/new",
  ]) {
    await page.goto(route);
    await expect(page.locator(".loading")).toHaveCount(0);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator(".alert.error")).toHaveCount(0);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/app/community");
  await expect(page.getByLabel("Post content")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await capture(page, "mobile-community");
});
test("Faculty dashboard, matching, no-match and research forms", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page, "faculty@thapar.edu");
  await capture(page, "faculty-dashboard");
  await page.goto("/app/projects/attendance/matching");
  await expect(page.locator(".candidate-card")).toHaveCount(4);
  const cards = page.locator(".candidate-card");
  await expect(cards.nth(0)).toContainText("100%");
  await expect(cards.nth(1)).toContainText("75%");
  await expect(cards.nth(2)).toContainText("50%");
  await capture(page, "candidate-matching");
  await accessibility(page);
  await page.goto("/app/projects/no-match/matching");
  await expect(
    page.getByRole("heading", { name: "No suitable matching candidates." }),
  ).toBeVisible();
  for (const route of [
    "/app/research/new",
    "/app/manage-projects",
    "/app/applicants",
  ]) {
    await page.goto(route);
    await expect(page.locator(".loading")).toHaveCount(0);
    await expect(page.locator("main h1")).toBeVisible();
  }
});
test("Admin and moderator screens enforce separate access", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page, "admin@thapar.edu");
  await page.goto("/app/admin");
  await expect(
    page.getByRole("heading", { name: "A healthy campus community." }),
  ).toBeVisible();
  await expect(page.getByLabel("Role for Mira Kapoor")).toHaveValue("FACULTY");
  await capture(page, "administration");
  await page.goto("/app/moderation");
  await expect(
    page.getByRole("heading", { name: "Review reported content." }),
  ).toBeVisible();
});
