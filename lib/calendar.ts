import type { CampusEvent } from "./campus-catalog";
const escape = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function eventCalendar(event: CampusEvent) {
  const start = new Date(`${event.date}T${event.time}:00+05:30`)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(".000", "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PeerConnect//Campus Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escape(event.id)}@peerconnect.local`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(".000", "")}`,
    `DTSTART:${start}`,
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.venue)}`,
    `DESCRIPTION:${escape(`Organizer: ${event.organizer}. Schedule checked ${event.checkedAt}. Confirm changes with the organizer. ${event.url}`)}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
