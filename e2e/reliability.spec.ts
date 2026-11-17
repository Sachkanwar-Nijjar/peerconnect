import { test, expect, request } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
const baseURL = process.env.APP_URL || "http://127.0.0.1:3000";

test("Admin account pages do not repeat records across the 50-row boundary", async () => {
  const db = new PrismaClient();
  const api = await request.newContext({ baseURL });
  const ids = Array.from({ length: 51 }, (_, i) => `qa-pagination-${i}`);
  try {
    const admin = await db.user.findUniqueOrThrow({
      where: { email: "admin@thapar.edu" },
    });
    await db.user.createMany({
      data: ids.map((id) => ({
        id,
        name: "Pagination fixture",
        email: `${id}@thapar.edu`,
        passwordHash: admin.passwordHash,
        verified: true,
      })),
    });
    expect(
      (
        await api.post("/api/auth/login", {
          data: { email: admin.email, password: process.env.DEMO_PASSWORD },
        })
      ).ok(),
    ).toBeTruthy();
    const one = await (await api.get("/api/data/users?page=1")).json();
    const two = await (await api.get("/api/data/users?page=2")).json();
    expect(one).toHaveLength(50);
    expect(two.length).toBeGreaterThan(0);
    expect(
      two.every(
        (row: { id: string }) =>
          !one.some((first: { id: string }) => first.id === row.id),
      ),
    ).toBe(true);
  } finally {
    await db.user.deleteMany({ where: { id: { in: ids } } });
    await db.$disconnect();
    await api.dispose();
  }
});

test("Malformed and oversized requests return controlled errors; fractional pages remain usable", async () => {
  const api = await request.newContext({ baseURL });
  try {
    for (const body of ["{", "null", "[]"]) {
      const response = await api.post("/api/auth/login", {
        data: body,
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status()).toBe(400);
      expect((await response.json()).error).toContain("JSON object");
    }
    expect(
      (
        await api.post("/api/auth/login", {
          data: { email: "x".repeat(65000) },
        })
      ).status(),
    ).toBe(413);
    expect(
      (
        await api.post("/api/auth/login", {
          data: {
            email: "student.a@thapar.edu",
            password: process.env.DEMO_PASSWORD,
          },
        })
      ).ok(),
    ).toBeTruthy();
    expect(
      (
        await api.post("/api/data/profile", {
          data: "null",
          headers: { "Content-Type": "application/json" },
        })
      ).status(),
    ).toBe(400);
    const fractional = await api.get("/api/data/projects?page=1.5");
    expect(fractional.ok()).toBeTruthy();
    expect(await fractional.json()).toEqual(
      await (await api.get("/api/data/projects?page=1")).json(),
    );
    const health = await api.get("/api/health");
    expect(health.ok()).toBeTruthy();
    expect(await health.json()).toMatchObject({
      service: "peerconnect",
      status: "ready",
    });
  } finally {
    await api.dispose();
  }
});

test("Campus news finds older announcements beyond the first feed page and excludes hidden posts", async () => {
  const db = new PrismaClient();
  const api = await request.newContext({ baseURL });
  const ids: string[] = [];
  try {
    expect(
      (
        await api.post("/api/auth/login", {
          data: {
            email: "student.a@thapar.edu",
            password: process.env.DEMO_PASSWORD,
          },
        })
      ).ok(),
    ).toBeTruthy();
    const faculty = await db.user.findUniqueOrThrow({
      where: { email: "faculty@thapar.edu" },
    });
    for (let i = 0; i < 13; i++) {
      const post = await db.communityPost.create({
        data: {
          authorId: faculty.id,
          category: "General",
          content: `Reliability fixture ${i}`,
          createdAt: new Date(Date.now() + i * 1000),
        },
      });
      ids.push(post.id);
    }
    const hidden = await db.communityPost.create({
      data: {
        authorId: faculty.id,
        category: "Announcements",
        content: "Hidden reliability notice",
        highlighted: true,
        hidden: true,
      },
    });
    ids.push(hidden.id);
    const firstPage = await (await api.get("/api/data/posts")).json();
    expect(
      firstPage.every((p: { category: string }) => p.category === "General"),
    ).toBe(true);
    const news = await (await api.get("/api/data/highlights")).json();
    expect(news.length).toBeGreaterThan(0);
    expect(news.length).toBeLessThanOrEqual(3);
    expect(news[0].highlighted).toBe(true);
    expect(news.some((p: { id: string }) => p.id === hidden.id)).toBe(false);
  } finally {
    await db.communityPost.deleteMany({ where: { id: { in: ids } } });
    await api.dispose();
    await db.$disconnect();
  }
});

test("Home recovers failed news and feed requests through retry controls", async ({
  page,
}) => {
  let failNews = true,
    failFeed = true;
  await page.route("**/api/data/highlights", (route) =>
    failNews
      ? route.fulfill({
          status: 503,
          contentType: "text/html",
          body: "<!DOCTYPE html>Unavailable",
        })
      : route.continue(),
  );
  await page.route("**/api/data/posts?*", (route) =>
    failFeed
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Temporary feed failure" }),
        })
      : route.continue(),
  );
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "Log in", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("University email").fill("student.a@thapar.edu");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.DEMO_PASSWORD!);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Retry campus news" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry feed", exact: true }),
  ).toBeVisible();
  failNews = false;
  failFeed = false;
  await page.getByRole("button", { name: "Retry campus news" }).click();
  await page.getByRole("button", { name: "Retry feed", exact: true }).click();
  await expect(page.locator(".news-tile").first()).toBeVisible();
  await expect(page.locator(".home-feed .post-card").first()).toBeVisible();
  await expect(page.locator(".feed-skeleton")).toHaveCount(0);
});
