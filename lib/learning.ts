import { db } from "./db";
import { z } from "zod";
import type { User } from "@prisma/client";
import { helpTopics } from "./learning-catalog";
export class LearningError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const person = {
  id: true,
  name: true,
  profile: {
    select: {
      department: true,
      year: true,
      bio: true,
      availability: true,
      github: true,
      linkedin: true,
    },
  },
} as const;
const include = {
  sender: { select: person },
  recipient: { select: person },
  course: true,
  reviews: true,
} as const;
export async function learningData(user: User, q: URLSearchParams) {
  const view = q.get("view") || "courses",
    search = (q.get("q") || "").slice(0, 80),
    page = Math.max(1, Math.floor(Number(q.get("page")) || 1));
  if (view === "courses") {
    const semester = Number(q.get("semester"));
    const where = {
      ...(semester > 0 && semester < 9 ? { semester } : {}),
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { code: { contains: search, mode: "insensitive" as const } },
      ],
    };
    return {
      items: await db.course.findMany({
        where,
        orderBy: [{ semester: "asc" }, { code: "asc" }],
        take: 12,
        skip: (page - 1) * 12,
        include: {
          students: { where: { userId: user.id } },
          _count: {
            select: {
              students: {
                where: {
                  available: true,
                  user: { verified: true, disabled: false },
                },
              },
            },
          },
        },
      }),
      total: await db.course.count({ where }),
    };
  }
  if (view === "course") {
    const code = q.get("code") || "";
    const course = await db.course.findUnique({
      where: { code },
      include: { students: { where: { userId: user.id } } },
    });
    if (!course) throw new LearningError("Course not found.", 404);
    const helpers = await db.profileCourse.findMany({
      where: {
        courseCode: code,
        available: true,
        userId: { not: user.id },
        user: { verified: true, disabled: false },
      },
      include: { user: { select: person } },
      take: 30,
    });
    const experience = await db.courseExperience.aggregate({
      where: { courseCode: code },
      _count: true,
      _avg: { workload: true },
    });
    // Withhold individual advice and identities; small cohorts never expose averages.
    return {
      course,
      helpers,
      experience: {
        count: experience._count,
        workload: experience._count >= 3 ? experience._avg.workload : null,
      },
      mine: await db.courseExperience.findUnique({
        where: { userId_courseCode: { userId: user.id, courseCode: code } },
      }),
    };
  }
  if (view === "offers") {
    const where = {
      available: true,
      user: { verified: true, disabled: false },
      OR: [
        { skill: { contains: search, mode: "insensitive" as const } },
        { user: { name: { contains: search, mode: "insensitive" as const } } },
      ],
      ...(q.get("category") ? { category: q.get("category")! } : {}),
    };
    return {
      items: await db.helpOffer.findMany({
        where,
        include: { user: { select: person } },
        orderBy: { skill: "asc" },
        take: 12,
        skip: (page - 1) * 12,
      }),
      total: await db.helpOffer.count({ where }),
      mine: await db.helpOffer.findMany({
        where: { userId: user.id },
        orderBy: { skill: "asc" },
      }),
    };
  }
  if (view === "requests")
    return db.guidanceRequest.findMany({
      where: {
        OR: [{ senderId: user.id }, { recipientId: user.id }],
        ...(q.get("status") ? { status: q.get("status")! } : {}),
      },
      include,
      orderBy: { updatedAt: "desc" },
      take: 30,
      skip: (page - 1) * 30,
    });
  if (view === "thread") {
    const r = await db.guidanceRequest.findUnique({
      where: { id: q.get("id") || "" },
      include,
    });
    if (!r || ![r.senderId, r.recipientId].includes(user.id))
      throw new LearningError("Guidance unavailable.", 403);
    const messages = ["ACCEPTED", "COMPLETED"].includes(r.status)
      ? await db.guidanceMessage.findMany({
          where: { requestId: r.id },
          orderBy: { createdAt: "desc" },
          take: 100,
          skip: (page - 1) * 100,
        })
      : [];
    return { ...r, messages: messages.reverse() };
  }
  if (view === "reputation") {
    const id = q.get("id") || user.id;
    const reviews = await db.guidanceReview.aggregate({
      where: { request: { recipientId: id } },
      _avg: { rating: true },
      _count: true,
    });
    const completed = await db.guidanceRequest.count({
      where: { recipientId: id, status: "COMPLETED" },
    });
    return {
      count: reviews._count,
      rating: reviews._count ? reviews._avg.rating : null,
      completed,
    };
  }
  throw new LearningError("Unknown learning view.", 404);
}
export async function learningMutate(user: User, input: unknown) {
  const action = z.object({ action: z.string() }).parse(input).action;
  if (action === "course") {
    const p = z
      .object({
        code: z.string(),
        status: z.enum(["TAKING", "TAKEN"]),
        available: z.boolean(),
      })
      .parse(input);
    return db.profileCourse.upsert({
      where: { userId_courseCode: { userId: user.id, courseCode: p.code } },
      create: {
        userId: user.id,
        courseCode: p.code,
        status: p.status,
        available: p.available,
      },
      update: { status: p.status, available: p.available },
    });
  }
  if (action === "offer") {
    const p = z
      .object({
        skill: z
          .string()
          .trim()
          .min(2)
          .max(60)
          .transform((s) => s.toLowerCase()),
        category: z.enum(["Technical", "Communication", "Creative", "Career"]),
        level: z.enum(["Learning", "Intermediate", "Advanced"]),
        available: z.boolean(),
      })
      .parse(input);
    const count = await db.helpOffer.count({ where: { userId: user.id } });
    if (
      count >= 30 &&
      !(await db.helpOffer.findUnique({
        where: { userId_skill: { userId: user.id, skill: p.skill } },
      }))
    )
      throw new LearningError("Limit of 30 help skills reached.");
    return db.helpOffer.upsert({
      where: { userId_skill: { userId: user.id, skill: p.skill } },
      create: { ...p, userId: user.id },
      update: p,
    });
  }
  if (action === "experience") {
    const p = z
      .object({
        code: z.string(),
        workload: z.number().int().min(1).max(5),
        advice: z.string().trim().max(1000),
        cohort: z.string().trim().min(4).max(40),
      })
      .parse(input);
    const enrollment = await db.profileCourse.findUnique({
      where: { userId_courseCode: { userId: user.id, courseCode: p.code } },
    });
    if (enrollment?.status !== "TAKEN")
      throw new LearningError(
        "Mark this course as taken before contributing.",
        403,
      );
    return db.courseExperience.upsert({
      where: { userId_courseCode: { userId: user.id, courseCode: p.code } },
      create: {
        userId: user.id,
        courseCode: p.code,
        workload: p.workload,
        advice: p.advice,
        cohort: p.cohort,
      },
      update: { workload: p.workload, advice: p.advice, cohort: p.cohort },
    });
  }
  if (action === "request") {
    const p = z
      .object({
        recipientId: z.string(),
        topic: z.enum(helpTopics),
        courseCode: z.string().optional(),
        skill: z.string().trim().max(60).optional(),
        question: z.string().trim().min(20).max(2000),
      })
      .parse(input);
    if (p.recipientId === user.id)
      throw new LearningError("Choose another student.");
    if (
      !(await db.user.findFirst({
        where: { id: p.recipientId, verified: true, disabled: false },
      }))
    )
      throw new LearningError("Student unavailable.", 404);
    if (
      p.courseCode &&
      !(await db.profileCourse.findFirst({
        where: {
          userId: p.recipientId,
          courseCode: p.courseCode,
          available: true,
        },
      }))
    )
      throw new LearningError(
        "This helper is not available for the selected course.",
        409,
      );
    if (
      p.skill &&
      !(await db.helpOffer.findFirst({
        where: {
          userId: p.recipientId,
          skill: p.skill.toLowerCase(),
          available: true,
        },
      }))
    )
      throw new LearningError(
        "This helper is not available for the selected skill.",
        409,
      );
    if (!p.courseCode && !p.skill)
      throw new LearningError(
        "Choose a course or enter a skill for focused guidance.",
      );
    const { createHash } = await import("node:crypto");
    const activeKey = createHash("sha256")
      .update(
        JSON.stringify([
          user.id,
          p.recipientId,
          p.courseCode || "",
          p.skill?.toLowerCase() || "",
        ]),
      )
      .digest("hex");
    return db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`;
      if (
        (await tx.guidanceRequest.count({
          where: {
            senderId: user.id,
            createdAt: { gt: new Date(Date.now() - 86400000) },
          },
        })) >= 10
      )
        throw new LearningError(
          "Daily guidance request limit reached. Try tomorrow.",
          429,
        );
      const r = await tx.guidanceRequest.create({
        data: { ...p, senderId: user.id, activeKey },
      });
      await tx.notification.create({
        data: {
          userId: p.recipientId,
          text: `${user.name} requested ${p.topic.toLowerCase()} help.`,
          href: `/app/guidance?id=${r.id}`,
        },
      });
      return r;
    });
  }
  const p = z
    .object({
      id: z.string(),
      status: z
        .enum(["ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"])
        .optional(),
      content: z.string().trim().min(1).max(4000).optional(),
      rating: z.number().int().min(1).max(5).optional(),
    })
    .parse(input);
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT id FROM "GuidanceRequest" WHERE id = ${p.id} FOR UPDATE`;
    const r = await tx.guidanceRequest.findUnique({ where: { id: p.id } });
    if (!r || ![r.senderId, r.recipientId].includes(user.id))
      throw new LearningError("Guidance unavailable.", 403);
    const other = r.senderId === user.id ? r.recipientId : r.senderId;
    if (
      !(await tx.user.findFirst({
        where: { id: other, disabled: false, verified: true },
      }))
    )
      throw new LearningError("Participant unavailable.", 403);
    if (action === "status") {
      const allowed =
        (r.status === "PENDING" &&
          ((user.id === r.recipientId &&
            ["ACCEPTED", "DECLINED"].includes(p.status || "")) ||
            (user.id === r.senderId && p.status === "CANCELLED"))) ||
        (r.status === "ACCEPTED" && p.status === "COMPLETED");
      if (!allowed)
        throw new LearningError("This status change is not allowed.", 409);
      const updated = await tx.guidanceRequest.update({
        where: { id: r.id },
        data: {
          status: p.status,
          activeKey: ["DECLINED", "CANCELLED", "COMPLETED"].includes(p.status!)
            ? null
            : r.activeKey,
        },
      });
      await tx.notification.create({
        data: {
          userId: other,
          text: `Guidance request ${p.status!.toLowerCase()}.`,
          href: `/app/guidance?id=${r.id}`,
        },
      });
      return updated;
    }
    if (action === "message") {
      if (r.status !== "ACCEPTED" || !p.content)
        throw new LearningError(
          "Chat is available only while guidance is accepted.",
          403,
        );
      if (
        (await tx.guidanceMessage.count({
          where: {
            senderId: user.id,
            createdAt: { gt: new Date(Date.now() - 60000) },
          },
        })) >= 30
      )
        throw new LearningError("Please slow down.", 429);
      const m = await tx.guidanceMessage.create({
        data: { requestId: r.id, senderId: user.id, content: p.content },
      });
      await tx.notification.create({
        data: {
          userId: other,
          text: `Guidance message from ${user.name}.`,
          href: `/app/guidance?id=${r.id}`,
        },
      });
      return m;
    }
    if (action === "review") {
      if (r.status !== "COMPLETED" || r.senderId !== user.id || !p.rating)
        throw new LearningError(
          "Only the requester can rate completed guidance.",
          403,
        );
      if (
        !(await tx.guidanceMessage.count({
          where: { requestId: r.id, senderId: r.recipientId },
        }))
      )
        throw new LearningError("Feedback requires a reply from the helper.");
      return tx.guidanceReview.create({
        data: { requestId: r.id, authorId: user.id, rating: p.rating },
      });
    }
    throw new LearningError("Unknown guidance action.", 404);
  });
}
