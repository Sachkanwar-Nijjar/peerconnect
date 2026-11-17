export function normalizeSkill(value: string) {
  const s = value.trim().toLowerCase().replace(/\s+/g, " ");
  return s === "machine learning" ? "ml" : s;
}
export function normalizeSkills(values: string[]) {
  return [...new Set(values.map(normalizeSkill).filter(Boolean))];
}
export function matchSkills(required: string[], candidate: string[]) {
  const needs = normalizeSkills(required),
    has = new Set(normalizeSkills(candidate));
  const matched = needs.filter((s) => has.has(s)),
    missing = needs.filter((s) => !has.has(s));
  return {
    score: needs.length ? (matched.length / needs.length) * 100 : 0,
    matched,
    missing,
  };
}
export function rankCandidates<
  T extends { id: string; name: string; skills: string[] },
>(required: string[], candidates: T[]) {
  return candidates
    .map((c) => ({ ...c, ...matchSkills(required, c.skills) }))
    .filter((c) => c.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.name.localeCompare(b.name) ||
        a.id.localeCompare(b.id),
    );
}
