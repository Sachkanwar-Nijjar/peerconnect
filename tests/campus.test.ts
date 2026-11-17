import { describe, it, expect } from "vitest";
import {
  saturnaliaEvents,
  campusOrganizations,
  campusResources,
} from "../lib/campus-catalog";
import { eventCalendar } from "../lib/calendar";
import { structuredEvents } from "../lib/campus-feed";
describe("Campus schedule and source handling", () => {
  it("preserves all four published day schedules without duplicate identities", () => {
    expect(saturnaliaEvents).toHaveLength(64);
    expect(new Set(saturnaliaEvents.map((e) => e.id)).size).toBe(64);
    expect(
      ["2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23"].map(
        (d) => saturnaliaEvents.filter((e) => e.date === d).length,
      ),
    ).toEqual([5, 23, 25, 11]);
  });
  it("exports an IST event in UTC without inventing an end time", () => {
    const e = saturnaliaEvents.find((e) => e.title === "SatHack")!;
    const ics = eventCalendar(e);
    expect(ics).toContain("DTSTART:20261121T053000Z");
    expect(ics).not.toContain("DTEND");
    expect(ics).toContain("CSED Ground Floor");
  });
  it("escapes calendar injection through text fields", () => {
    const ics = eventCalendar({
      ...saturnaliaEvents[0],
      title: "Hi, there;\nEND:VEVENT",
    });
    expect(ics).toContain("SUMMARY:Hi\\, there\\;\\nEND:VEVENT");
    expect(ics.match(/\r\nEND:VEVENT/g)).toHaveLength(1);
  });
  it("ignores unstructured page text and malformed JSON", () => {
    expect(
      structuredEvents(
        '<h1>21 November</h1><script type="application/ld+json">bad</script>',
        "SAT",
        "https://www.saturnalia.in/events",
        "2026-11-15",
      ),
    ).toEqual([]);
  });
  it("reads public graph event records with explicit time offsets", () => {
    const html =
      '<script type="application/ld+json">' +
      JSON.stringify({
        "@graph": [
          {
            "@type": "Event",
            name: "Workshop",
            startDate: "2026-11-21T05:30:00Z",
            location: { name: "Library" },
          },
        ],
      }) +
      "</script>";
    const events = structuredEvents(
      html,
      "Library",
      "https://cl.thapar.edu/",
      "2026-11-15",
    );
    expect(events[0]).toMatchObject({
      date: "2026-11-21",
      time: "11:00",
      venue: "Library",
    });
  });
  it("does not invent a timezone for ambiguous source records", () => {
    expect(
      structuredEvents(
        '<script type="application/ld+json">{"@type":"Event","name":"No timezone","startDate":"2026-11-21T11:00"}</script>',
        "SAT",
        "https://www.saturnalia.in/events",
        "2026-11-15",
      ),
    ).toEqual([]);
  });
  it("includes all requested communities and primary department resources", () => {
    expect(campusOrganizations.map((o) => o.id)).toEqual(
      expect.arrayContaining([
        "saturnalia",
        "virsa",
        "ccs",
        "mars",
        "acm",
        "fateh",
        "venturelab",
      ]),
    );
    expect(campusResources.map((r) => r.url)).toContain(
      "https://tslas.thapar.edu/",
    );
    expect(campusResources.map((r) => r.url)).toContain(
      "https://cl.thapar.edu/",
    );
  });
});
