/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  test,
  expect,
  request,
  type APIRequestContext,
} from "@playwright/test";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient(),
  baseURL = process.env.APP_URL || "http://127.0.0.1:3000",
  password = process.env.DEMO_PASSWORD!;
let student: APIRequestContext,
  faculty: APIRequestContext,
  other: APIRequestContext,
  anonymous: APIRequestContext,
  admin: APIRequestContext,
  moderator: APIRequestContext,
  projectId: string,
  opportunityId: string,
  postId: string,
  conversationId: string;
const json = (r: Awaited<ReturnType<APIRequestContext["get"]>>): Promise<any> =>
  r.json();
async function login(email: string) {
  const c = await request.newContext({ baseURL });
  const r = await c.post("/api/auth/login", { data: { email, password } });
  expect(r.ok(),`Login returned ${r.status()}: ${await r.text()}`).toBeTruthy();
  return c;
}
test.describe.serial("Original UCS503 cases and campus extensions", () => {
  test.beforeAll(async () => {
    const existing = await db.user.findUnique({
      where: { email: "test.student@thapar.edu" },
    });
    if (existing) {
      await db.project.deleteMany({ where: { creatorId: existing.id } });
      await db.user.delete({ where: { id: existing.id } });
    }
    faculty = await login("faculty@thapar.edu");
    other = await login("student.b@thapar.edu");
    admin = await login("admin@thapar.edu");
    moderator = await login("moderator@thapar.edu");
    anonymous = await request.newContext({ baseURL });
  });
  test.afterAll(async () => {
    for (const c of [student, faculty, other, admin, moderator, anonymous])
      await c?.dispose();
    await db.$disconnect();
  });
  test("TC-01 registration, verification, blocked unverified login, duplicate email", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Your next team starts here." }),
    ).toBeVisible();
    const r = await anonymous.post("/api/auth/register", {
      data: {
        name: "Test Student",
        email: "test.student@thapar.edu",
        password,
      },
    });
    expect(r.ok()).toBeTruthy();
    const d = await r.json();
    expect(d.message).toContain("Check your email");
    expect(d.verificationUrl).toContain("/verify-email?token=");
    const denied = await anonymous.post("/api/auth/login", {
      data: { email: "test.student@thapar.edu", password },
    });
    expect(denied.status()).toBe(403);
    expect((await denied.json()).error).toContain("not verified");
    expect((await anonymous.storageState()).cookies).toHaveLength(0);
    expect((await anonymous.get("/api/data/posts")).status()).toBe(401);
    const token = new URL(d.verificationUrl).searchParams.get("token");
    const verified = await anonymous.post("/api/auth/verify", {
      data: { token },
    });
    expect(verified.ok()).toBeTruthy();
    expect((await verified.json()).message).toContain("active");
    expect(
      (
        await db.user.findUniqueOrThrow({
          where: { email: "test.student@thapar.edu" },
        })
      ).verified,
    ).toBe(true);
    const duplicate = await anonymous.post("/api/auth/register", {
      data: { name: "Duplicate", email: "dup.student@thapar.edu", password },
    });
    expect(duplicate.status()).toBe(409);
    expect((await duplicate.json()).error).toContain("already registered");
    expect(
      await db.user.count({ where: { email: "dup.student@thapar.edu" } }),
    ).toBe(1);
  });
  test("TC-02 successful login, logout, failed credentials create no session", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("University email").fill("test.student@thapar.edu");
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(
      page.getByRole("heading", { name: /Your campus/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Log out", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    const failed = await anonymous.post("/api/auth/login", {
      data: { email: "test.student@thapar.edu", password: "wrongpassword" },
    });
    expect(failed.status()).toBe(401);
    expect((await anonymous.storageState()).cookies).toHaveLength(0);
    student = await login("test.student@thapar.edu");
  });
  test("TC-03 save profile, add React, reject empty skills without mutation", async () => {
    const before = await json(await student.get("/api/data/person"));
    expect(before.profile).toBeNull();
    const profile = {
      name: "Test Student",
      department: "CSE",
      year: 3,
      bio: "Test profile",
      skills: "Python, SQL",
      technologies: "Django",
      interests: "Machine Learning",
      experience: "one project",
      availability: "10 hours per week",
      github: "",
      linkedin: "",
    };
    expect(
      (await student.post("/api/data/profile", { data: profile })).ok(),
    ).toBeTruthy();
    expect(
      (
        await student.post("/api/data/profile", {
          data: { ...profile, skills: "Python, SQL, React" },
        })
      ).ok(),
    ).toBeTruthy();
    const saved = await json(await student.get("/api/data/person"));
    expect(
      saved.profile.skills
        .map((s: { skill: { name: string } }) => s.skill.name)
        .sort(),
    ).toEqual(["python", "react", "sql"]);
    expect(
      (
        await student.post("/api/data/profile", {
          data: { ...profile, skills: "" },
        })
      ).status(),
    ).toBe(400);
    expect(await json(await student.get("/api/data/person"))).toEqual(saved);
  });
  test("TC-04 create Smart Attendance System, list it, reject missing skills", async () => {
    const fields = {
      title: "Smart Attendance System",
      description:
        "A test-owned attendance project for automated verification.",
      category: "Technology",
      skills: "Python, ML, React, SQL",
      technologies: "React, Django",
      interests: "Machine Learning",
      teamSize: 4,
    };
    const created = await student.post("/api/data/project", { data: fields });
    expect(created.ok()).toBeTruthy();
    projectId = (await created.json()).id;
    const listings = await json(
      await student.get("/api/data/projects?q=Smart"),
    );
    expect(listings.some((p: { id: string }) => p.id === projectId)).toBe(true);
    const before = await db.project.count();
    expect(
      (
        await student.post("/api/data/project", {
          data: { ...fields, skills: "" },
        })
      ).status(),
    ).toBe(400);
    expect(await db.project.count()).toBe(before);
    expect(await db.projectRequiredSkill.count({ where: { projectId } })).toBe(
      4,
    );
  });
  test("TC-05 faculty research creation, student discovery, blank title rejection", async () => {
    const fields = {
      title: "Automated Research Fixture",
      description: "A faculty research opportunity for testing.",
      skills: "Python, ML",
      technologies: "",
      interests: "",
      teamSize: 4,
      category: "Research",
      research: true,
    };
    const r = await faculty.post("/api/data/project", { data: fields });
    expect(r.ok()).toBeTruthy();
    opportunityId = (await r.json()).id;
    expect(
      (await json(await student.get("/api/data/projects?research=true"))).some(
        (p: { id: string }) => p.id === opportunityId,
      ),
    ).toBe(true);
    const before = await db.project.count();
    expect(
      (
        await faculty.post("/api/data/project", {
          data: { ...fields, title: "" },
        })
      ).status(),
    ).toBe(400);
    expect(await db.project.count()).toBe(before);
    expect(
      (await student.post("/api/data/project", { data: fields })).status(),
    ).toBe(403);
  });
  test("TC-06 exact candidate scoring, order, matched skills, no data changes", async () => {
    const before = await db.profileSkill.count(),
      project = await db.project.findUnique({ where: { id: "attendance" } });
    const ranks = await json(
      await faculty.get("/api/data/matching?id=attendance"),
    );
    const fixture = ranks.filter((p: { id: string }) =>
      ["student-a", "student-b", "student-c"].includes(p.id),
    );
    expect(
      fixture.map((p: { name: string; score: number }) => [p.name, p.score]),
    ).toEqual([
      ["Candidate A", 100],
      ["Candidate B", 75],
      ["Candidate C", 50],
    ]);
    expect(fixture[1].matched).toEqual(["python", "ml", "sql"]);
    expect(fixture[2].matched).toEqual(["python", "sql"]);
    expect(await db.profileSkill.count()).toBe(before);
    expect(
      await db.project.findUnique({ where: { id: "attendance" } }),
    ).toEqual(project);
  });
  test("TC-07 Rust/Kotlin no match produces empty list, no records", async () => {
    const before = await db.application.count();
    expect(
      await json(await faculty.get("/api/data/matching?id=no-match")),
    ).toEqual([]);
    expect(await db.application.count()).toBe(before);
  });
  test("TC-08 browse, search Smart, view details and skills, empty xyz123 search", async () => {
    const before = await db.project.count();
    expect(
      (await json(await student.get("/api/data/projects"))).length,
    ).toBeGreaterThan(0);
    const results = await json(await student.get("/api/data/projects?q=Smart"));
    expect(
      results.some(
        (p: { title: string }) => p.title === "Smart Attendance System",
      ),
    ).toBe(true);
    const details = await json(
      await student.get(`/api/data/project?id=${projectId}`),
    );
    expect(details.title).toBe("Smart Attendance System");
    expect(details.skills).toHaveLength(4);
    expect(
      await json(await student.get("/api/data/projects?q=xyz123")),
    ).toEqual([]);
    expect(await db.project.count()).toBe(before);
  });
  test("TC-09 apply, persist Pending and notify creator; reject duplicates", async () => {
    const r = await other.post("/api/data/apply", {
      data: { id: projectId, note: "I can contribute Python and SQL." },
    });
    expect(r.ok()).toBeTruthy();
    const a = await r.json();
    expect(a.status).toBe("PENDING");
    expect(
      await db.notification.findFirst({
        where: {
          userId: (
            await db.project.findUniqueOrThrow({ where: { id: projectId } })
          ).creatorId,
          text: { contains: "Candidate B applied" },
        },
      }),
    ).not.toBeNull();
    expect(
      (
        await other.post("/api/data/apply", { data: { id: projectId } })
      ).status(),
    ).toBe(409);
  });
  test("TC-10 accept X, reject Y, membership integrity and persistent notices", async () => {
    const x = await login("student.x@thapar.edu"),
      y = await login("student.y@thapar.edu");
    for (const c of [x, y])
      expect(
        (await c.post("/api/data/apply", { data: { id: projectId } })).ok(),
      ).toBeTruthy();
    const details = await json(
      await student.get(`/api/data/project?id=${projectId}`),
    );
    const ax = details.applications.find(
        (a: { applicantId: string }) => a.applicantId === "student-x",
      ),
      ay = details.applications.find(
        (a: { applicantId: string }) => a.applicantId === "student-y",
      );
    expect(ax.status).toBe("PENDING");
    expect(ay.status).toBe("PENDING");
    expect(
      (
        await student.post("/api/data/decision", {
          data: { id: ax.id, status: "ACCEPTED" },
        })
      ).ok(),
    ).toBeTruthy();
    const count = await db.teamMembership.count();
    expect(
      (
        await student.post("/api/data/decision", {
          data: { id: ay.id, status: "REJECTED" },
        })
      ).ok(),
    ).toBeTruthy();
    expect(await db.teamMembership.count()).toBe(count);
    expect(
      await db.teamMembership.findFirst({
        where: { userId: "student-x", team: { projectId } },
      }),
    ).not.toBeNull();
    expect(
      await db.teamMembership.findFirst({
        where: { userId: "student-y", team: { projectId } },
      }),
    ).toBeNull();
    expect(
      (await db.application.findUniqueOrThrow({ where: { id: ax.id } })).status,
    ).toBe("ACCEPTED");
    expect(
      (await db.application.findUniqueOrThrow({ where: { id: ay.id } })).status,
    ).toBe("REJECTED");
    expect(
      (await json(await x.get("/api/data/notifications"))).items.some(
        (n: { text: string }) => n.text.includes("accepted"),
      ),
    ).toBe(true);
    expect(
      (await json(await y.get("/api/data/notifications"))).items.some(
        (n: { text: string }) => n.text.includes("rejected"),
      ),
    ).toBe(true);
    expect(
      (
        await other.post("/api/data/decision", {
          data: { id: ax.id, status: "REJECTED" },
        })
      ).status(),
    ).toBe(403);
    await x.dispose();
    await y.dispose();
  });
  test("Campus posts persist, likes toggle, comments persist, ownership and moderation", async () => {
    const r = await student.post("/api/data/post", {
      data: {
        content: "Automated community persistence fixture",
        category: "Academic",
      },
    });
    expect(r.ok()).toBeTruthy();
    postId = (await r.json()).id;
    expect(
      (await json(await student.get(`/api/data/post?id=${postId}`)))[0].content,
    ).toContain("persistence");
    expect((await anonymous.get(`/api/data/post?id=${postId}`)).status()).toBe(
      401,
    );
    await student.post("/api/data/like", { data: { id: postId } });
    expect(
      (await json(await student.get(`/api/data/post?id=${postId}`)))[0]._count
        .likes,
    ).toBe(1);
    await student.post("/api/data/like", { data: { id: postId } });
    expect(
      (await json(await student.get(`/api/data/post?id=${postId}`)))[0]._count
        .likes,
    ).toBe(0);
    await other.post("/api/data/comment", {
      data: { id: postId, content: "A persistent reply" },
    });
    expect(
      (await json(await student.get(`/api/data/post?id=${postId}`)))[0]
        .comments[0].content,
    ).toBe("A persistent reply");
    expect(
      (
        await other.post("/api/data/post", {
          data: {
            id: postId,
            content: "Unauthorized edit",
            category: "General",
          },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await other.post("/api/data/deletePost", { data: { id: postId } })
      ).status(),
    ).toBe(403);
    await other.post("/api/data/report", {
      data: { id: postId, reason: "Automated moderation fixture" },
    });
    const reports = await json(await moderator.get("/api/data/reports"));
    const report = reports.find((r: { postId: string }) => r.postId === postId);
    expect(report).toBeTruthy();
    await moderator.post("/api/data/moderate", {
      data: { id: report.id, hide: true },
    });
    expect(
      await json(await student.get(`/api/data/post?id=${postId}`)),
    ).toEqual([]);
    await moderator.post("/api/data/moderate", {
      data: { id: report.id, hide: false },
    });
  });
  test("Faculty announcements link to real opportunities and enforce permissions", async () => {
    expect(
      (
        await student.post("/api/data/post", {
          data: {
            content: "Unauthorized official announcement",
            category: "Announcements",
            highlighted: true,
          },
        })
      ).status(),
    ).toBe(403);
    const r = await faculty.post("/api/data/post", {
      data: {
        content: "New research fixture announcement",
        category: "Announcements",
        highlighted: true,
        projectId: opportunityId,
      },
    });
    expect(r.ok()).toBeTruthy();
    const p = (
      await json(await student.get(`/api/data/post?id=${(await r.json()).id}`))
    )[0];
    expect(p.project.id).toBe(opportunityId);
    expect(
      (await student.get(`/api/data/project?id=${p.project.id}`)).ok(),
    ).toBeTruthy();
    expect((await anonymous.get("/api/data/projects")).status()).toBe(401);
    expect(
      (
        await student.post("/api/data/upload", {
          multipart: {
            file: {
              name: "bad.exe",
              mimeType: "application/octet-stream",
              buffer: Buffer.from("invalid"),
            },
          },
        })
      ).status(),
    ).toBe(415);
  });
  test("Messaging privacy, unread state and notifications persist", async () => {
    const c = await student.post("/api/data/conversation", {
      data: { id: "faculty" },
    });
    conversationId = (await c.json()).id;
    const sent = await student.post("/api/data/message", {
      data: { id: conversationId, content: "Private persistence fixture" },
    });
    expect(sent.ok()).toBeTruthy();
    expect(
      (
        await json(await faculty.get(`/api/data/messages?id=${conversationId}`))
      ).some(
        (m: { content: string }) => m.content === "Private persistence fixture",
      ),
    ).toBe(true);
    expect(
      (await other.get(`/api/data/messages?id=${conversationId}`)).status(),
    ).toBe(403);
    expect(
      (
        await other.post("/api/data/message", {
          data: { id: conversationId, content: "Intrusion" },
        })
      ).status(),
    ).toBe(403);
    const notices = await json(await faculty.get("/api/data/notifications"));
    expect(
      notices.items.some((n: { text: string }) =>
        n.text.includes("New message from Test Student"),
      ),
    ).toBe(true);
  });
  test("Admin-only controls, same-origin protection, foreign key integrity", async () => {
    expect((await student.get("/api/data/users")).status()).toBe(403);
    expect((await admin.get("/api/data/users")).ok()).toBeTruthy();
    expect(
      (
        await student.post("/api/data/post", {
          headers: { Origin: "https://untrusted.example" },
          data: { content: "No", category: "General" },
        })
      ).status(),
    ).toBe(403);
    await expect(
      db.application.create({
        data: { projectId: "missing-project", applicantId: "student-a" },
      }),
    ).rejects.toMatchObject({ code: "P2003" });
  });
  test("Team capacity remains correct under concurrent acceptance", async () => {
    const p = await student.post("/api/data/project", {
      data: {
        title: "Capacity fixture",
        description: "A concurrency test project.",
        skills: "Python",
        technologies: "",
        interests: "",
        category: "Technology",
        teamSize: 2,
      },
    });
    const id = (await p.json()).id;
    const a = await login("student.a@thapar.edu"),
      c = await login("student.c@thapar.edu");
    const one = await (
        await a.post("/api/data/apply", { data: { id } })
      ).json(),
      two = await (await c.post("/api/data/apply", { data: { id } })).json();
    const responses = await Promise.all([
      student.post("/api/data/decision", {
        data: { id: one.id, status: "ACCEPTED" },
      }),
      student.post("/api/data/decision", {
        data: { id: two.id, status: "ACCEPTED" },
      }),
    ]);
    expect(responses.filter((r) => r.ok())).toHaveLength(1);
    expect(responses.filter((r) => r.status() === 409)).toHaveLength(1);
    expect(
      await db.teamMembership.count({ where: { team: { projectId: id } } }),
    ).toBe(1);
    await a.dispose();
    await c.dispose();
  });
  test("Responsive UI, keyboard labels, linked announcement navigation and refresh", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("University email").fill("student.a@thapar.edu");
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page).toHaveURL(/\/app$/);
    await page.goto("/app/community/announcement");
    await page.getByRole("link", { name: /Accessible Learning Lab/ }).click();
    await expect(page).toHaveURL(/\/app\/projects\/learning$/);
    await expect(
      page.getByRole("heading", {
        name: "Accessible Learning Lab",
        exact: true,
      }),
    ).toBeVisible();
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/app/community");
      await expect(
        page.getByRole("heading", { name: "A space for your community." }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.reload();
    await expect(page.getByLabel("Post content")).toBeVisible();
    await page.screenshot({
      path: "test-results/mobile-community.png",
      fullPage: true,
    });
  });
});
