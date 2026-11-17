import { describe, it, expect } from "vitest";
import { matchSkills, normalizeSkills, rankCandidates } from "../lib/matching";
import { profileSchema, projectSchema } from "../lib/validation";
describe("Original deterministic matching", () => {
  const required = ["Python", "ML", "React", "SQL"];
  it("TC-06 gives exact 100, 75, 50 scores and matched skills in rank order without mutation", () => {
    const candidates = [
      { id: "c", name: "C", skills: ["Python", "SQL"] },
      { id: "a", name: "A", skills: required },
      { id: "b", name: "B", skills: ["Python", "ML", "SQL"] },
    ];
    const before = JSON.stringify(candidates);
    const ranks = rankCandidates(required, candidates);
    expect(ranks.map((x) => [x.name, x.score])).toEqual([
      ["A", 100],
      ["B", 75],
      ["C", 50],
    ]);
    expect(ranks[1].matched).toEqual(["python", "ml", "sql"]);
    expect(ranks[1].missing).toEqual(["react"]);
    expect(JSON.stringify(candidates)).toBe(before);
  });
  it("TC-07 returns no candidates for isolated Rust/Kotlin fixture", () => {
    expect(
      rankCandidates(
        ["Rust", "Kotlin"],
        [{ id: "a", name: "A", skills: required }],
      ),
    ).toEqual([]);
  });
  it("FR-13 handles missing requirements", () => {
    expect(matchSkills([], required)).toEqual({
      score: 0,
      matched: [],
      missing: [],
    });
  });
  it("normalizes case, spaces, duplicates, and documented ML alias", () => {
    expect(
      normalizeSkills([" Python ", "PYTHON", "Machine Learning", "ML"]),
    ).toEqual(["python", "ml"]);
    expect(
      matchSkills(["Python", "PYTHON", "ML"], ["python", "machine learning"])
        .score,
    ).toBe(100);
  });
  it("uses a deterministic tie order", () => {
    expect(
      rankCandidates(
        ["SQL"],
        [
          { id: "b", name: "B", skills: ["SQL"] },
          { id: "a", name: "A", skills: ["SQL"] },
        ],
      ).map((x) => x.name),
    ).toEqual(["A", "B"]);
  });
  it("does not use experience, interests, or availability in the score", () => {
    const candidate = {
      id: "a",
      name: "A",
      skills: ["Python"],
      experience: "20 years",
      availability: "100 hours",
      interests: ["ML"],
    };
    expect(rankCandidates(required, [candidate])[0].score).toBe(25);
  });
});
describe("Original form rules", () => {
  it("TC-03 rejects an empty skills update", () => {
    expect(
      profileSchema.safeParse({
        name: "Student",
        department: "CSE",
        year: 3,
        bio: "",
        skills: "",
        technologies: "Django",
        interests: "ML",
        experience: "one project",
        availability: "10 hours",
        github: "",
        linkedin: "",
      }).success,
    ).toBe(false);
  });
  it("TC-04 rejects empty project skills", () => {
    expect(
      projectSchema.safeParse({
        title: "Smart Attendance System",
        description: "A test project description",
        category: "Technology",
        skills: "",
        technologies: "React",
        interests: "ML",
        teamSize: 4,
      }).success,
    ).toBe(false);
  });
  it("TC-05 rejects a blank title", () => {
    expect(
      projectSchema.safeParse({
        title: "",
        description: "A research description",
        category: "Research",
        skills: "Python, ML",
        technologies: "",
        interests: "",
        teamSize: 4,
        research: true,
      }).success,
    ).toBe(false);
  });
});
