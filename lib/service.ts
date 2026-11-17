import { campusFeed } from "./campus-feed";
import { learningData, learningMutate } from "./learning";
import { Prisma, type User } from "@prisma/client";
import { db } from "./db";
import { matchSkills, rankCandidates } from "./matching";
import { profileSchema, projectSchema, postSchema } from "./validation";
import { z } from "zod";
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
function requireRole(user: User, roles: string[]) {
  if (!roles.includes(user.role))
    throw new AppError("You do not have permission for this action.", 403);
}
const profileInclude = { skills: { include: { skill: true } } } as const;
const projectInclude = {
  skills: { include: { skill: true } },
  creator: { select: { id: true, name: true, role: true } },
  research: true,
  team: {
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profile: { include: profileInclude },
            },
          },
        },
      },
    },
  },
  _count: { select: { applications: true } },
} as const;
const publicUserSelect = {
  id: true,
  name: true,
  role: true,
  profile: { include: profileInclude },
  memberships: {
    include: {
      team: { include: { project: { select: { id: true, title: true } } } },
    },
  },
} as const;
export async function notify(
  userId: string,
  text: string,
  href: string,
  client: Prisma.TransactionClient = db,
) {
  await client.notification.create({ data: { userId, text, href } });
}
export async function getData(
  user: User,
  resource: string,
  q: URLSearchParams,
) {
  if (resource === "campus-feed") return campusFeed();
  if (resource === "learning") return learningData(user, q);
  const page = Math.max(
      1,
      Math.min(1000, Math.floor(Number(q.get("page"))) || 1),
    ),
    take = 12,
    skip = (page - 1) * take,
    search = (q.get("q") || "").slice(0, 100);
  if (resource === "me")
    return db.user.findUnique({
      where: { id: user.id },
      select: publicUserSelect,
    });
  if (resource === "dashboard") {
    const [projects, applications, notifications, posts, teams, people] =
      await Promise.all([
        db.project.findMany({
          where: { status: "OPEN", creatorId: { not: user.id } },
          include: projectInclude,
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        db.application.findMany({
          where:
            user.role === "FACULTY"
              ? { project: { creatorId: user.id } }
              : { applicantId: user.id },
          include: { project: { select: { id: true, title: true } } },
          take: 50,
        }),
        db.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        db.communityPost.findMany({
          where: { hidden: false },
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
        db.team.findMany({
          where: {
            OR: [
              { members: { some: { userId: user.id } } },
              { project: { creatorId: user.id } },
            ],
          },
          include: {
            project: { select: { id: true, title: true } },
            members: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        }),
        db.user.findMany({
          where: {
            id: { not: user.id },
            verified: true,
            disabled: false,
            role: "STUDENT",
          },
          select: publicUserSelect,
          take: 100,
        }),
      ]);
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
      include: profileInclude,
    });
    const skills = profile?.skills.map((s) => s.skill.name) || [],
      interests = profile?.interests.map((s) => s.toLowerCase()) || [];
    const recommended = projects
      .map((p) => ({
        ...p,
        match: matchSkills(
          p.skills.map((s) => s.skill.name),
          skills,
        ),
        interestOverlap: p.interests.filter((i) =>
          interests.includes(i.toLowerCase()),
        ).length,
      }))
      .filter((p) => p.match.score > 0 || p.interestOverlap > 0)
      .sort(
        (a, b) =>
          b.match.score - a.match.score ||
          b.interestOverlap - a.interestOverlap,
      )
      .slice(0, 4);
    const recommendedPeople = rankCandidates(
      skills,
      people.map((p) => ({
        ...p,
        skills: p.profile?.skills.map((s) => s.skill.name) || [],
      })),
    ).slice(0, 3);
    const owned = await db.project.findMany({
      where: { creatorId: user.id },
      include: projectInclude,
      orderBy: { createdAt: "desc" },
    });
    return {
      recommended,
      applications,
      notifications,
      posts,
      teams,
      owned,
      recommendedPeople,
    };
  }
  if (resource === "projects")
    return db.project.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          q.get("category") ? { category: q.get("category")! } : {},
          q.get("skill")
            ? {
                skills: {
                  some: {
                    skill: {
                      name: {
                        contains: q.get("skill")!.toLowerCase(),
                        mode: "insensitive",
                      },
                    },
                  },
                },
              }
            : {},
          q.get("mine") === "true" ? { creatorId: user.id } : {},
          q.get("research") === "true" ? { research: { isNot: null } } : {},
        ],
      },
      include: projectInclude,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });
  if (resource === "project") {
    const p = await db.project.findUnique({
      where: { id: q.get("id") || "" },
      include: projectInclude,
    });
    if (!p) throw new AppError("Project not found.", 404);
    const application = await db.application.findUnique({
      where: {
        projectId_applicantId: { projectId: p.id, applicantId: user.id },
      },
    });
    const applications =
      p.creatorId === user.id
        ? await db.application.findMany({
            where: { projectId: p.id },
            include: { applicant: { select: publicUserSelect } },
            orderBy: { createdAt: "asc" },
          })
        : [];
    return { ...p, application, applications };
  }
  if (resource === "matching") {
    const p = await db.project.findUnique({
      where: { id: q.get("id") || "" },
      include: { skills: { include: { skill: true } } },
    });
    if (!p) throw new AppError("Project not found.", 404);
    if (p.creatorId !== user.id)
      throw new AppError(
        "Only the creator can find teammates for this project.",
        403,
      );
    const candidates = await db.user.findMany({
      where: {
        role: "STUDENT",
        verified: true,
        disabled: false,
        id: { not: user.id },
      },
      select: publicUserSelect,
    });
    return rankCandidates(
      p.skills.map((s) => s.skill.name),
      candidates.map((c) => ({
        ...c,
        skills: c.profile?.skills.map((s) => s.skill.name) || [],
      })),
    );
  }
  if (resource === "people")
    return db.user.findMany({
      where: {
        verified: true,
        disabled: false,
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  {
                    profile: {
                      skills: {
                        some: {
                          skill: {
                            name: {
                              contains: search.toLowerCase(),
                              mode: "insensitive",
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              }
            : {},
          q.get("department")
            ? {
                profile: {
                  department: {
                    contains: q.get("department")!,
                    mode: "insensitive",
                  },
                },
              }
            : {},
        ],
      },
      select: publicUserSelect,
      take,
      skip,
      orderBy: { name: "asc" },
    });
  if (resource === "person") {
    const person = await db.user.findFirst({
      where: { id: q.get("id") || user.id, verified: true, disabled: false },
      select: publicUserSelect,
    });
    if (!person) throw new AppError("Profile not found.", 404);
    return {
      ...person,
      projects: await db.project.findMany({
        where: { creatorId: person.id },
        include: projectInclude,
      }),
    };
  }
  if (resource === "applications")
    return db.application.findMany({
      where:
        q.get("received") === "true"
          ? { project: { creatorId: user.id } }
          : { applicantId: user.id },
      include: {
        project: { select: { id: true, title: true, creatorId: true } },
        applicant: { select: publicUserSelect },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });
  if (resource === "teams")
    return db.team.findMany({
      where: {
        OR: [
          { project: { creatorId: user.id } },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        project: { include: projectInclude },
        members: { include: { user: { select: publicUserSelect } } },
      },
      take,
      skip,
    });
  if (resource === "posts" || resource === "post" || resource === "highlights")
    return db.communityPost.findMany({
      where: {
        hidden: false,
        ...(resource === "highlights"
          ? {
              OR: [
                { highlighted: true },
                { category: { in: ["Announcements", "Events", "Academic"] } },
              ],
            }
          : {}),
        ...(resource === "post" ? { id: q.get("id") || "" } : {}),
        ...(q.get("category") ? { category: q.get("category")! } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            profile: { select: { department: true } },
          },
        },
        project: { select: { id: true, title: true } },
        likes: { where: { userId: user.id }, select: { userId: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
          take: 50,
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy:
        resource === "highlights"
          ? [{ highlighted: "desc" }, { createdAt: "desc" }, { id: "desc" }]
          : [{ createdAt: "desc" }, { id: "desc" }],
      take: resource === "highlights" ? 3 : take,
      skip: resource === "highlights" ? 0 : skip,
    });
  if (resource === "notifications")
    return {
      items: await db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        skip: (page - 1) * 30,
      }),
      unread: await db.notification.count({
        where: { userId: user.id, read: false },
      }),
    };
  if (resource === "conversations")
    return db.conversation.findMany({
      where: { OR: [{ aId: user.id }, { bId: user.id }] },
      include: {
        a: { select: { id: true, name: true } },
        b: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: {
          select: {
            messages: { where: { senderId: { not: user.id }, read: false } },
          },
        },
      },
      take: 50,
    });
  if (resource === "messages") {
    const c = await db.conversation.findUnique({
      where: { id: q.get("id") || "" },
    });
    if (!c || ![c.aId, c.bId].includes(user.id))
      throw new AppError("Conversation unavailable.", 403);
    await db.message.updateMany({
      where: { conversationId: c.id, senderId: { not: user.id }, read: false },
      data: { read: true },
    });
    return db.message.findMany({
      where: { conversationId: c.id },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
      skip: (page - 1) * 100,
    });
  }
  if (resource === "reports") {
    requireRole(user, ["MODERATOR", "ADMIN"]);
    return db.postReport.findMany({
      include: {
        post: { include: { author: { select: { id: true, name: true } } } },
        reporter: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
  if (resource === "users") {
    requireRole(user, ["ADMIN"]);
    return db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        disabled: true,
        requestedFaculty: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 50,
      skip: (page - 1) * 50,
    });
  }
  throw new AppError("Resource not found.", 404);
}
export async function mutate(user: User, action: string, input: unknown) {
  if (action === "learning") return learningMutate(user, input);
  const idSchema = z.object({ id: z.string().min(1) });
  if (action === "profile") {
    const p = profileSchema.parse(input);
    const { name, skills, ...fields } = p;
    return db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { name } });
      const profile = await tx.profile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...fields },
        update: fields,
      });
      await tx.profileSkill.deleteMany({ where: { profileId: profile.id } });
      for (const s of skills) {
        const skill = await tx.skill.upsert({
          where: { name: s },
          create: { name: s },
          update: {},
        });
        await tx.profileSkill.create({
          data: { profileId: profile.id, skillId: skill.id },
        });
      }
      return profile;
    });
  }
  if (action === "project") {
    requireRole(user, ["STUDENT", "FACULTY"]);
    const p = projectSchema.parse(input);
    const id = z.object({ id: z.string().optional() }).parse(input).id;
    const previous = id
      ? await db.project.findUnique({
          where: { id },
          include: { research: true, team: { include: { members: true } } },
        })
      : null;
    if (id && (!previous || previous.creatorId !== user.id))
      throw new AppError("You can only edit your own projects.", 403);
    const research = previous ? !!previous.research : !!p.research;
    if (research) requireRole(user, ["FACULTY"]);
    if (previous && p.teamSize < (previous.team?.members.length || 0) + 1)
      throw new AppError("Team size cannot be smaller than the current team.");
    return db.$transaction(async (tx) => {
      const { skills, research: _research, department, details, ...data } = p;
      if (id) {
        await tx.$queryRaw`SELECT id FROM "Project" WHERE id = ${id} FOR UPDATE`;
        const memberCount = await tx.teamMembership.count({
          where: { team: { projectId: id } },
        });
        if (p.teamSize < memberCount + 1)
          throw new AppError(
            "Team size cannot be smaller than the current team.",
          );
      }
      void _research;
      const project = id
        ? await tx.project.update({ where: { id }, data })
        : await tx.project.create({
            data: { ...data, creatorId: user.id, team: { create: {} } },
          });
      await tx.projectRequiredSkill.deleteMany({
        where: { projectId: project.id },
      });
      for (const s of skills) {
        const skill = await tx.skill.upsert({
          where: { name: s },
          create: { name: s },
          update: {},
        });
        await tx.projectRequiredSkill.create({
          data: { projectId: project.id, skillId: skill.id },
        });
      }
      if (research)
        await tx.researchOpportunity.upsert({
          where: { projectId: project.id },
          create: {
            projectId: project.id,
            department: department || "Research",
            details: details || "",
          },
          update: {
            department: department || "Research",
            details: details || "",
          },
        });
      if (id) {
        const members = await tx.teamMembership.findMany({
          where: { team: { projectId: id } },
        });
        for (const m of members)
          await notify(
            m.userId,
            `${project.title} was updated.`,
            `/app/projects/${id}`,
            tx,
          );
      }
      return project;
    });
  }
  if (action === "apply") {
    requireRole(user, ["STUDENT"]);
    const { id, note } = z
      .object({ id: z.string(), note: z.string().max(1000).default("") })
      .parse(input);
    return db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Project" WHERE id = ${id} FOR UPDATE`;
      const p = await tx.project.findUnique({
        where: { id },
        include: { team: { include: { members: true } } },
      });
      if (!p) throw new AppError("Project not found.", 404);
      if (p.creatorId === user.id)
        throw new AppError("You are already the project creator.");
      if (
        p.status !== "OPEN" ||
        (p.team?.members.length || 0) + 1 >= p.teamSize
      )
        throw new AppError("This project is not accepting applications.");
      const a = await tx.application.create({
        data: { projectId: id, applicantId: user.id, note },
      });
      await notify(
        p.creatorId,
        `${user.name} applied to ${p.title}.`,
        `/app/projects/${id}`,
        tx,
      );
      return a;
    });
  }
  if (action === "decision") {
    const { id, status } = z
      .object({ id: z.string(), status: z.enum(["ACCEPTED", "REJECTED"]) })
      .parse(input);
    return db.$transaction(async (tx) => {
      const initial = await tx.application.findUnique({ where: { id } });
      if (!initial) throw new AppError("Application not found.", 404);
      await tx.$queryRaw`SELECT id FROM "Project" WHERE id = ${initial.projectId} FOR UPDATE`;
      const a = await tx.application.findUniqueOrThrow({
        where: { id },
        include: {
          project: { include: { team: { include: { members: true } } } },
        },
      });
      if (a.project.creatorId !== user.id)
        throw new AppError(
          "Only the project creator can review applications.",
          403,
        );
      if (a.status !== "PENDING")
        throw new AppError("This application has already been reviewed.", 409);
      if (status === "ACCEPTED") {
        if (a.project.status !== "OPEN")
          throw new AppError("Reopen the project before accepting applicants.");
        if ((a.project.team?.members.length || 0) + 1 >= a.project.teamSize)
          throw new AppError("The team is full.", 409);
        const team = await tx.team.upsert({
          where: { projectId: a.projectId },
          create: { projectId: a.projectId },
          update: {},
        });
        await tx.teamMembership.create({
          data: { teamId: team.id, userId: a.applicantId },
        });
      }
      await tx.application.update({ where: { id }, data: { status } });
      await notify(
        a.applicantId,
        `Your application to ${a.project.title} was ${status.toLowerCase()}.`,
        `/app/projects/${a.projectId}`,
        tx,
      );
      return { status };
    });
  }
  if (action === "post") {
    const p = postSchema.parse(input),
      id = z.object({ id: z.string().optional() }).parse(input).id;
    if (p.highlighted) requireRole(user, ["FACULTY", "ADMIN"]);
    if (p.projectId) {
      const project = await db.project.findUnique({
        where: { id: p.projectId },
      });
      if (!project) throw new AppError("Linked project not found.");
      if (
        p.highlighted &&
        project.creatorId !== user.id &&
        user.role !== "ADMIN"
      )
        throw new AppError(
          "Link your own opportunity in a highlighted announcement.",
          403,
        );
    }
    if (id) {
      const existing = await db.communityPost.findUnique({ where: { id } });
      if (!existing || existing.authorId !== user.id)
        throw new AppError("You can only edit your own posts.", 403);
      return db.communityPost.update({
        where: { id },
        data: {
          ...p,
          highlighted: !!p.highlighted,
          projectId: p.projectId || null,
        },
      });
    }
    return db.$transaction(async (tx) => {
      const post = await tx.communityPost.create({
        data: {
          ...p,
          highlighted: !!p.highlighted,
          projectId: p.projectId || null,
          authorId: user.id,
        },
      });
      if (p.highlighted) {
        const author = await tx.profile.findUnique({
          where: { userId: user.id },
        });
        const recipients = await tx.user.findMany({
          where: {
            verified: true,
            disabled: false,
            id: { not: user.id },
            OR: [
              ...(author?.department
                ? [{ profile: { department: author.department } }]
                : []),
              ...(p.projectId
                ? [{ applications: { some: { projectId: p.projectId } } }]
                : []),
            ],
          },
          select: { id: true },
        });
        for (const recipient of recipients)
          await notify(
            recipient.id,
            `${user.name} shared a campus announcement.`,
            `/app/community/${post.id}`,
            tx,
          );
      }
      return post;
    });
  }
  if (action === "deletePost") {
    const { id } = idSchema.parse(input);
    const post = await db.communityPost.findUnique({ where: { id } });
    if (!post || post.authorId !== user.id)
      throw new AppError("You can only delete your own posts.", 403);
    return db.communityPost.delete({ where: { id } });
  }
  if (action === "like" || action === "comment" || action === "report") {
    const { id } = idSchema.parse(input);
    if (!(await db.communityPost.findFirst({ where: { id, hidden: false } })))
      throw new AppError("Post not found.", 404);
    if (action === "like") {
      const key = { postId: id, userId: user.id };
      const existing = await db.postLike.findUnique({
        where: { postId_userId: key },
      });
      return existing
        ? db.postLike.delete({ where: { postId_userId: key } })
        : db.postLike.create({ data: key });
    }
    if (action === "comment") {
      const { content } = z
        .object({ content: z.string().trim().min(1).max(1500) })
        .parse(input);
      return db.postComment.create({
        data: { postId: id, authorId: user.id, content },
      });
    }
    const { reason } = z
      .object({ reason: z.string().trim().min(3).max(1000) })
      .parse(input);
    return db.postReport.upsert({
      where: { postId_reporterId: { postId: id, reporterId: user.id } },
      create: { postId: id, reporterId: user.id, reason },
      update: { reason, resolved: false },
    });
  }
  if (action === "conversation") {
    const { id } = idSchema.parse(input);
    if (id === user.id) throw new AppError("Choose another person.");
    if (
      !(await db.user.findFirst({
        where: { id, verified: true, disabled: false },
      }))
    )
      throw new AppError("User unavailable.");
    const [aId, bId] = [user.id, id].sort();
    return db.conversation.upsert({
      where: { aId_bId: { aId, bId } },
      create: { aId, bId },
      update: {},
    });
  }
  if (action === "message") {
    const { id, content } = z
      .object({ id: z.string(), content: z.string().trim().min(1).max(4000) })
      .parse(input);
    const c = await db.conversation.findUnique({ where: { id } });
    if (!c || ![c.aId, c.bId].includes(user.id))
      throw new AppError("Conversation unavailable.", 403);
    const recipient = c.aId === user.id ? c.bId : c.aId;
    if (
      !(await db.user.findFirst({
        where: { id: recipient, verified: true, disabled: false },
      }))
    )
      throw new AppError("Recipient unavailable.");
    return db.$transaction(async (tx) => {
      const m = await tx.message.create({
        data: { conversationId: id, senderId: user.id, content },
      });
      await notify(
        recipient,
        `New message from ${user.name}.`,
        `/app/messages?conversation=${id}`,
        tx,
      );
      return m;
    });
  }
  if (action === "readNotifications") {
    const { id } = z.object({ id: z.string().optional() }).parse(input);
    return db.notification.updateMany({
      where: { userId: user.id, ...(id ? { id } : {}) },
      data: { read: true },
    });
  }
  if (action === "moderate") {
    requireRole(user, ["MODERATOR", "ADMIN"]);
    const { id, hide } = z
      .object({ id: z.string(), hide: z.boolean() })
      .parse(input);
    return db.$transaction(async (tx) => {
      const report = await tx.postReport.findUniqueOrThrow({ where: { id } });
      await tx.communityPost.update({
        where: { id: report.postId },
        data: { hidden: hide },
      });
      return tx.postReport.update({ where: { id }, data: { resolved: true } });
    });
  }
  if (action === "user") {
    requireRole(user, ["ADMIN"]);
    const { id, role, disabled } = z
      .object({
        id: z.string(),
        role: z.enum(["STUDENT", "FACULTY", "MODERATOR", "ADMIN"]).optional(),
        disabled: z.boolean().optional(),
      })
      .parse(input);
    if (id === user.id)
      throw new AppError("Ask another administrator to change your account.");
    return db.$transaction(async (tx) => {
      if (disabled) await tx.session.deleteMany({ where: { userId: id } });
      return tx.user.update({
        where: { id },
        data: {
          role,
          disabled,
          ...(role === "FACULTY" ? { requestedFaculty: false } : {}),
        },
        select: { id: true, role: true, disabled: true },
      });
    });
  }
  if (action === "upload")
    throw new AppError(
      "Image uploads are not enabled. Please publish a text post.",
      415,
    );
  throw new AppError("Action not found.", 404);
}
