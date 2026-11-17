import "dotenv/config";
import { hash } from "bcryptjs";
import { db } from "../lib/db";
import { normalizeSkills } from "../lib/matching";
const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 10)
  throw Error(
    "Set DEMO_PASSWORD to a local-only password of at least 10 characters.",
  );
const passwordHash = await hash(password, 12);
async function user(
  id: string,
  name: string,
  email: string,
  role: "STUDENT" | "FACULTY" | "MODERATOR" | "ADMIN",
  skills: string[],
  bio: string,
) {
  const account = await db.user.upsert({
    where: { email },
    create: { id, name, email, passwordHash, role, verified: true },
    update: { name, passwordHash, role, verified: true, disabled: false },
  });
  const profile = await db.profile.upsert({
    where: { userId: account.id },
    create: {
      userId: account.id,
      department: "Computer Science & Engineering",
      year: 3,
      bio,
      technologies: ["Django", "Git"],
      interests: ["Machine Learning", "Accessible technology"],
      experience: "One academic project and a campus hackathon.",
      availability: "10 hours per week",
    },
    update: { bio },
  });
  await db.profileSkill.deleteMany({ where: { profileId: profile.id } });
  for (const name of normalizeSkills(skills)) {
    const skill = await db.skill.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    await db.profileSkill.create({
      data: { profileId: profile.id, skillId: skill.id },
    });
  }
  return account;
}
async function project(
  id: string,
  title: string,
  description: string,
  creatorId: string,
  skills: string[],
  category = "Technology",
  research = false,
) {
  await db.project.upsert({
    where: { id },
    create: {
      id,
      title,
      description,
      creatorId,
      category,
      technologies: ["Next.js", "PostgreSQL"],
      interests: ["Accessible technology", "Machine Learning"],
      teamSize: 4,
      team: { create: { id: `team-${id}` } },
    },
    update: { title, description },
  });
  await db.projectRequiredSkill.deleteMany({ where: { projectId: id } });
  for (const name of normalizeSkills(skills)) {
    const skill = await db.skill.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    await db.projectRequiredSkill.create({
      data: { projectId: id, skillId: skill.id },
    });
  }
  if (research)
    await db.researchOpportunity.upsert({
      where: { projectId: id },
      create: {
        projectId: id,
        department: "Computer Science & Engineering",
        details:
          "Fictional academic demo. Explore responsible, accessible learning systems.",
      },
      update: {},
    });
}
await user(
  "student-a",
  "Candidate A",
  "student.a@thapar.edu",
  "STUDENT",
  ["Python", "ML", "React", "SQL"],
  "Fictional demo student. I enjoy turning an ambitious idea into something people can use.",
);
await user(
  "student-b",
  "Candidate B",
  "student.b@thapar.edu",
  "STUDENT",
  ["Python", "ML", "SQL"],
  "Fictional demo student. Curious about data, learning, and better campus experiences.",
);
await user(
  "student-c",
  "Candidate C",
  "student.c@thapar.edu",
  "STUDENT",
  ["Python", "SQL"],
  "Fictional demo student. Learning by building, one thoughtful project at a time.",
);
await user(
  "student-x",
  "Aarav Sen",
  "student.x@thapar.edu",
  "STUDENT",
  ["React", "TypeScript", "Figma"],
  "Fictional demo student. Frontend developer with a soft spot for useful design.",
);
await user(
  "student-y",
  "Nia Khanna",
  "student.y@thapar.edu",
  "STUDENT",
  ["Figma", "Design"],
  "Fictional demo student. Designing approachable experiences for everyday problems.",
);
await user(
  "faculty",
  "Mira Kapoor",
  "faculty@thapar.edu",
  "FACULTY",
  ["Python", "ML"],
  "Fictional faculty mentor exploring responsible AI and accessible learning.",
);
await user(
  "moderator",
  "Dev Mehra",
  "moderator@thapar.edu",
  "MODERATOR",
  ["Moderation"],
  "Fictional community moderator.",
);
await user(
  "admin",
  "Riya Anand",
  "admin@thapar.edu",
  "ADMIN",
  ["Administration"],
  "Fictional platform administrator.",
);
await user(
  "duplicate",
  "Demo Duplicate",
  "dup.student@thapar.edu",
  "STUDENT",
  ["Documentation"],
  "Account reserved for the duplicate registration test.",
);
await project(
  "attendance",
  "Smart Attendance System",
  "Build a thoughtful attendance experience using Python, machine learning, React, and SQL. We are looking for curious collaborators who want to make everyday campus life a little smarter.",
  "faculty",
  ["Python", "ML", "React", "SQL"],
);
await project(
  "no-match",
  "Systems Lab Explorer",
  "An isolated matching fixture requiring Rust and Kotlin. No demo student has either required skill.",
  "faculty",
  ["Rust", "Kotlin"],
);
await project(
  "learning",
  "Accessible Learning Lab",
  "Explore responsible AI and accessible learning tools with a fictional faculty-led research team. Bring your curiosity, Python, and machine learning skills.",
  "faculty",
  ["Python", "ML"],
  "Research",
  true,
);
await project(
  "campus",
  "Campus Resource Finder",
  "Help students find useful academic resources with a responsive, accessible web experience. A practical project for people who care about good design.",
  "student-x",
  ["React", "Figma", "SQL"],
  "Social Impact",
);
await project(
  "design",
  "Design for Everyday Campus",
  "Turn a common campus challenge into a clear, welcoming product experience. Research, sketch, prototype, and learn together.",
  "student-y",
  ["Figma", "Design"],
  "Design",
);
for (const applicantId of ["student-x", "student-y"])
  await db.application.upsert({
    where: { projectId_applicantId: { projectId: "attendance", applicantId } },
    create: {
      id: `application-${applicantId}`,
      projectId: "attendance",
      applicantId,
      note: "I would love to contribute to this project and learn with the team.",
    },
    update: {},
  });
await db.teamMembership.upsert({
  where: { teamId_userId: { teamId: "team-campus", userId: "student-y" } },
  create: { teamId: "team-campus", userId: "student-y" },
  update: {},
});
await db.application.upsert({
  where: {
    projectId_applicantId: { projectId: "campus", applicantId: "student-y" },
  },
  create: { projectId: "campus", applicantId: "student-y", status: "ACCEPTED" },
  update: {},
});
const posts = [
  {
    id: "announcement",
    authorId: "faculty",
    content:
      "Curious about responsible AI? Our Accessible Learning Lab is looking for students who enjoy Python and machine learning. This is a fictional research opportunity created for the PeerConnect demo.",
    category: "Announcements",
    highlighted: true,
    projectId: "learning",
  },
  {
    id: "question",
    authorId: "student-b",
    content:
      "What helped you move from learning SQL to designing your first database? I’m mapping out a project and would love to hear how you approached the relationships.",
    category: "Academic",
    highlighted: false,
    projectId: null,
  },
  {
    id: "collab",
    authorId: "student-x",
    content:
      "A useful campus tool starts with understanding the people who use it. Looking for a design-minded collaborator for Campus Resource Finder. Fictional demo project — fresh ideas welcome!",
    category: "Projects",
    highlighted: false,
    projectId: "campus",
  },
  {
    id: "event",
    authorId: "student-y",
    content:
      "Fictional demo event: a small weekend design jam to explore accessible campus tools. Share a problem you would enjoy solving with a team. This is not an official society announcement.",
    category: "Events",
    highlighted: false,
    projectId: null,
  },
];
for (const post of posts)
  await db.communityPost.upsert({
    where: { id: post.id },
    create: post,
    update: {},
  });
await db.postComment.upsert({
  where: { id: "seed-comment" },
  create: {
    id: "seed-comment",
    postId: "question",
    authorId: "student-a",
    content:
      "Start with the user actions, then map each fact to one place. Drawing the ER diagram helped me a lot.",
  },
  update: {},
});
await db.postLike.upsert({
  where: { postId_userId: { postId: "announcement", userId: "student-a" } },
  create: { postId: "announcement", userId: "student-a" },
  update: {},
});
for (const [id, userId, text, href] of [
  [
    "welcome-a",
    "student-a",
    "Welcome to PeerConnect. Your next collaboration starts here.",
    "/app/projects",
  ],
  [
    "faculty-application",
    "faculty",
    "Aarav Sen applied to Smart Attendance System.",
    "/app/projects/attendance",
  ],
  [
    "research-a",
    "student-a",
    "Mira Kapoor shared a research opportunity.",
    "/app/community/announcement",
  ],
])
  await db.notification.upsert({
    where: { id },
    create: { id, userId, text, href },
    update: {},
  });
await db.conversation.upsert({
  where: { id: "demo-conversation" },
  create: { id: "demo-conversation", aId: "faculty", bId: "student-a" },
  update: {},
});
await db.message.upsert({
  where: { id: "demo-message" },
  create: {
    id: "demo-message",
    conversationId: "demo-conversation",
    senderId: "faculty",
    content:
      "Hello! If you are curious about the Accessible Learning Lab, I would be happy to discuss the project.",
  },
  update: {},
});
await db.$disconnect();
console.log(
  "PeerConnect fictional demo seed complete. Existing workflow decisions were preserved.",
);
