import {
  campusUpdates,
  saturnaliaEvents,
  type CampusEvent,
} from "./campus-catalog";
const sources = [
  { name: "Saturnalia", url: "https://www.saturnalia.in/events" },
  { name: "Nava Nalanda Library", url: "https://cl.thapar.edu/" },
  { name: "CCS", url: "https://hacktu.ccstiet.com/" },
];
const allowed = new Set(sources.map((s) => new URL(s.url).hostname));
type SourceState = {
  name: string;
  url: string;
  checkedAt: string;
  state: string;
  imported: number;
};
type Result = {
  events: CampusEvent[];
  updates: typeof campusUpdates;
  sources: SourceState[];
};
let cached: Result | undefined,
  expires = 0,
  pending: Promise<Result> | undefined;
function text(value: unknown, max = 200) {
  return typeof value === "string"
    ? value.replace(/<[^>]*>/g, "").slice(0, max)
    : "";
}
// Only public structured Event records are imported. Never guess a hidden API, date or fee.
export function structuredEvents(
  html: string,
  organizer: string,
  sourceUrl: string,
  checkedAt: string,
): CampusEvent[] {
  const result: CampusEvent[] = [];
  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const item = value as Record<string, unknown>;
    if (item["@graph"]) visit(item["@graph"]);
    const type = item["@type"];
    if (type !== "Event" && !(Array.isArray(type) && type.includes("Event")))
      return;
    const start = text(item.startDate, 50),
      title = text(item.name);
    // Require an explicit offset, avoiding accidental UTC/local schedule conversion.
    if (
      !title ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*(?:Z|[+-]\d{2}:\d{2})$/.test(start) ||
      Number.isNaN(Date.parse(start))
    )
      return;
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(start));
    const part = (key: string) =>
      parts.find((p) => p.type === key)?.value || "";
    const date = `${part("year")}-${part("month")}-${part("day")}`,
      time = `${part("hour")}:${part("minute")}`;
    const location = item.location as Record<string, unknown> | undefined;
    result.push({
      id: `auto-${organizer}-${date}-${title}`,
      title,
      date,
      time,
      venue: text(location?.name) || "Check organizer",
      category: "Organizer event",
      organizer,
      url: sourceUrl,
      checkedAt,
    });
  }
  for (const match of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      visit(JSON.parse(match[1]));
    } catch {
      /* Invalid publisher markup does not erase verified fallback data. */
    }
  }
  return result.slice(0, 150);
}
async function publicHtml(url: string) {
  if (!allowed.has(new URL(url).hostname)) throw Error("Unsupported source");
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
    headers: { "User-Agent": "PeerConnect-CampusFeed/1.0" },
  });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("text/html")
  )
    throw Error("Source unavailable");
  const reader = response.body?.getReader();
  if (!reader) throw Error("Empty source");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 2000000) throw Error("Source too large");
      chunks.push(chunk.value);
    }
  } finally {
    await reader.cancel();
  }
  return Buffer.concat(chunks).toString("utf8");
}
export async function campusFeed(): Promise<Result> {
  if (cached && Date.now() < expires) return cached;
  if (pending) return pending;
  pending = (async () => {
    const events = [...saturnaliaEvents];
    const states: SourceState[] = [];
    await Promise.all(
      sources.map(async (source) => {
        const checkedAt = new Date().toISOString();
        try {
          const parsed = structuredEvents(
            await publicHtml(source.url),
            source.name,
            source.url,
            checkedAt,
          );
          if (parsed.length) {
            for (const record of parsed) {
              const index = events.findIndex(
                (e) =>
                  e.organizer === source.name &&
                  e.title.toLowerCase() === record.title.toLowerCase() &&
                  e.date === record.date,
              );
              if (index < 0) events.push(record);
              else events[index] = { ...record, id: events[index].id };
            }
            states.push({
              ...source,
              checkedAt,
              state: "Structured event feed refreshed",
              imported: parsed.length,
            });
          } else
            states.push({
              ...source,
              checkedAt,
              state: "No supported structured feed; showing checked listings",
              imported: 0,
            });
        } catch {
          states.push({
            ...source,
            checkedAt,
            state: "Source unavailable; showing checked listings",
            imported: 0,
          });
        }
      }),
    );
    cached = {
      events: events.sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time),
      ),
      updates: campusUpdates,
      sources: states,
    };
    expires = Date.now() + 15 * 60000;
    return cached;
  })();
  try {
    return await pending;
  } finally {
    pending = undefined;
  }
}
