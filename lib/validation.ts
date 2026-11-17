import { z } from "zod";
import { normalizeSkills } from "./matching";
const list = z.union([z.string(), z.array(z.string())]).transform((v) =>
  typeof v === "string"
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : v,
);
export const skillList = list
  .transform(normalizeSkills)
  .refine(
    (v) => v.length > 0 && v.length <= 30 && v.every((s) => s.length <= 60),
    "Enter at least one required skill (maximum 30).",
  );
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().transform((s) => s.toLowerCase().trim()),
  password: z.string().min(10).max(128),
  faculty: z.boolean().optional(),
});
const link = z.union([
  z.literal(""),
  z.url().refine((s) => s.startsWith("https://"), "Use an HTTPS link"),
]);
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  department: z.string().trim().min(2).max(100),
  year: z.coerce.number().int().min(1).max(6),
  bio: z.string().trim().max(1000),
  skills: skillList,
  technologies: list.refine((v) => v.length > 0, "Technologies are required"),
  interests: list.refine((v) => v.length > 0, "Interests are required"),
  experience: z.string().trim().min(1).max(2000),
  availability: z.string().trim().min(1).max(100),
  github: link,
  linkedin: link,
});
export const projectSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(6000),
  skills: skillList,
  technologies: list,
  interests: list,
  teamSize: z.coerce.number().int().min(2).max(30),
  category: z.enum([
    "Technology",
    "Design",
    "Social Impact",
    "Research",
    "Hackathon",
  ]),
  research: z.boolean().optional(),
  department: z.string().trim().max(100).optional(),
  details: z.string().max(2000).optional(),
  status: z.enum(["OPEN", "CLOSED", "COMPLETED"]).optional(),
});
export const postSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  category: z.enum([
    "General",
    "Projects",
    "Academic",
    "Events",
    "Announcements",
  ]),
  highlighted: z.boolean().optional(),
  projectId: z.string().nullable().optional(),
});
