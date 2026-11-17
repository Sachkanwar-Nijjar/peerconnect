"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Clock,
  MapPin,
  Radio,
  Search,
  Download,
  MessageCircle,
  BookOpen,
  Users,
  ChevronDown,
} from "lucide-react";
import {
  campusOrganizations,
  campusResources,
  campusUpdates,
  saturnaliaEvents,
  type CampusEvent,
} from "@/lib/campus-catalog";
import { eventCalendar } from "@/lib/calendar";
type Source = {
  name: string;
  url: string;
  checkedAt: string;
  state: string;
  imported: number;
};
const dayLabel = (date: string) =>
  new Date(date + "T12:00:00+05:30").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short",
    timeZone: "Asia/Kolkata",
  });
export function CampusLife({ userId }: { userId: string }) {
  const [events, setEvents] = useState(saturnaliaEvents),
    [sources, setSources] = useState<Source[]>([]),
    [day, setDay] = useState("2026-11-21"),
    [category, setCategory] = useState("All"),
    [search, setSearch] = useState(""),
    [expanded, setExpanded] = useState(false),
    [saved, setSaved] = useState<string[]>([]),
    [onlySaved, setOnlySaved] = useState(false),
    [organization, setOrganization] = useState("All"),
    [message, setMessage] = useState("");
  const key = "peerconnect-events-" + userId;
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(value))
          setSaved(value.filter((x) => typeof x === "string"));
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, [key]);
  useEffect(() => {
    let live = true;
    fetch("/api/data/campus-feed", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (live) {
          setEvents(d.events);
          setSources(d.sources);
        }
      })
      .catch(() => {
        if (live)
          setMessage(
            "Live source checks are unavailable. Checked schedule remains available.",
          );
      });
    return () => {
      live = false;
    };
  }, []);
  function toggle(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setMessage(
        "Browser storage is unavailable. Saved events will last for this visit.",
      );
    }
  }
  function download(event: CampusEvent) {
    const url = URL.createObjectURL(
      new Blob([eventCalendar(event)], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = event.id + ".ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Calendar file downloaded. Import it into your calendar; organizer changes do not update downloaded files.",
    );
  }
  const dates = Array.from(new Set(events.map((e) => e.date))).sort();
  const matches = events.filter(
    (e) =>
      (onlySaved ? saved.includes(e.id) : e.date === day) &&
      (category === "All" || e.category === category) &&
      [e.title, e.venue, e.organizer]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const updates = campusUpdates.filter(
    (u) => organization === "All" || u.org === organization,
  );
  return (
    <section
      className="campus-life"
      aria-label="Campus life, festivals and societies"
    >
      <div className="campus-live-bar">
        <span>
          <Radio size={15} /> YOUR CAMPUS, ALL TOGETHER
        </span>
        <nav aria-label="Campus home shortcuts">
          <a href="#campus-schedule">What’s on</a>
          <a href="#society-updates">Societies</a>
          <Link href="/app/messages">Messages</Link>
          <Link href="/app/community">Conversations</Link>
        </nav>
      </div>
      <article className="sat-spotlight">
        <div className="sat-copy">
          <span className="sat-edition">
            THE CAMPUS IS THE PLAN. <span>51ST EDITION</span>
          </span>
          <h2>
            Make room
            <br />
            for <em>Saturnalia.</em>
          </h2>
          <p>
            21—23 NOVEMBER 2026 <span>·</span> TIET, PATIALA
          </p>
          <p className="sat-description">
            The hackathons. The stage. The people you’ll meet in between. Find
            your kind of fest, right here.
          </p>
          <div className="sat-buttons">
            <a className="btn sat-primary" href="#campus-schedule">
              <CalendarDays size={17} /> Explore the schedule
            </a>
            <a
              className="sat-official"
              href="https://www.saturnalia.in/"
              target="_blank"
              rel="noreferrer"
            >
              Official fest website <ArrowUpRight size={17} />
            </a>
          </div>
          <small>
            Day 0: 20 Nov · Main festival: 21–23 Nov · Organizer schedule
            checked 15 Nov
          </small>
        </div>
        <div className="sat-poster" aria-hidden="true">
          <span>
            SAT
            <br />
            26<span className="poster-star">✳</span>
          </span>
          <small>CULTURE / CODE / CONNECTION</small>
        </div>
      </article>
      <div className="campus-equal-grid">
        <Link href="/app/community">
          <MessageCircle />
          <strong>What’s everyone talking about?</strong>
          <span>Questions, campus insights & shared experiences.</span>
        </Link>
        <Link href="/app/messages">
          <MessageCircle />
          <strong>Your people, one conversation away.</strong>
          <span>Pick up a conversation or start a collaboration.</span>
        </Link>
        <Link href="/app/projects">
          <Users />
          <strong>Find your next team.</strong>
          <span>Projects, research & hackathon collaborators.</span>
        </Link>
        <Link href="/app/courses">
          <BookOpen />
          <strong>Learn from someone who’s been there.</strong>
          <span>Courses, skill helpers & focused guidance.</span>
        </Link>
      </div>
      <section id="campus-schedule" className="campus-schedule">
        <div className="campus-section-heading">
          <div>
            <span className="eyebrow">
              DON’T HEAR ABOUT IT AFTER IT HAPPENS
            </span>
            <h2>Your fest. Your schedule.</h2>
            <p>
              Published organizer listings · All times IST · Confirm changes
              before going
            </p>
          </div>
          <button
            className={"saved-filter " + (onlySaved ? "active" : "")}
            aria-pressed={onlySaved}
            onClick={() => {
              setOnlySaved(!onlySaved);
              setExpanded(false);
            }}
          >
            <Bookmark size={16} />
            {onlySaved
              ? "Show all events"
              : `Saved on this device (${saved.length})`}
          </button>
        </div>
        <div
          className="campus-day-tabs"
          role="tablist"
          aria-label="Saturnalia days"
        >
          {dates.map((date, i) => (
            <button
              key={date}
              role="tab"
              aria-selected={!onlySaved && day === date}
              onClick={() => {
                setDay(date);
                setOnlySaved(false);
                setExpanded(false);
              }}
            >
              <strong>Day {i}</strong>
              <span>{dayLabel(date)}</span>
            </button>
          ))}
        </div>
        <div className="campus-event-filters">
          <label>
            <Search size={17} />
            <input
              aria-label="Search campus events"
              value={search}
              placeholder="Search events, venues, hackathons…"
              onChange={(e) => {
                setSearch(e.target.value);
                setExpanded(false);
              }}
            />
          </label>
          <select
            aria-label="Event category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setExpanded(false);
            }}
          >
            {["All", ...Array.from(new Set(events.map((e) => e.category)))].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
          <a
            href="https://www.saturnalia.in/events"
            target="_blank"
            rel="noreferrer"
          >
            Organizer updates ↗
          </a>
        </div>
        <p className="campus-source-line">
          {matches.length} events{" "}
          {onlySaved ? "saved on this device" : `on ${dayLabel(day)}`} · Website
          listings; registration, eligibility and fees are handled by
          organizers.
        </p>
        <div className="campus-event-grid">
          {(expanded ? matches : matches.slice(0, 6)).map((e) => (
            <article
              key={e.id}
              className={
                "campus-event " + e.category.toLowerCase().replace(/\W/g, "-")
              }
            >
              <div className="event-card-top">
                <span>{e.category}</span>
                <button
                  aria-label={
                    (saved.includes(e.id) ? "Unsave " : "Save ") + e.title
                  }
                  aria-pressed={saved.includes(e.id)}
                  onClick={() => toggle(e.id)}
                >
                  <Bookmark
                    size={18}
                    fill={saved.includes(e.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <h3>{e.title}</h3>
              <p>
                <Clock size={14} />
                {onlySaved ? dayLabel(e.date) + " · " : ""}
                {new Date(
                  e.date + "T" + e.time + ":00+05:30",
                ).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                })}{" "}
                IST
              </p>
              <p>
                <MapPin size={14} />
                {e.venue}
              </p>
              <footer>
                <a href={e.url} target="_blank" rel="noreferrer">
                  Details & registration <ArrowUpRight size={14} />
                </a>
                <button
                  aria-label={"Download calendar for " + e.title}
                  title="Download calendar"
                  onClick={() => download(e)}
                >
                  <Download size={17} />
                </button>
              </footer>
            </article>
          ))}
        </div>
        {!matches.length && (
          <div className="campus-no-events">
            <h3>
              {onlySaved
                ? "Your plans start with a bookmark."
                : "No events match those filters."}
            </h3>
            <p>Try another day or category, or search more broadly.</p>
            <button
              onClick={() => {
                setOnlySaved(false);
                setCategory("All");
                setSearch("");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
        {matches.length > 6 && (
          <button
            className="campus-expand"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show fewer" : `See all ${matches.length} events`}
            <ChevronDown size={16} />
          </button>
        )}
        <details className="source-details">
          <summary>Where this schedule comes from & freshness</summary>
          <p>
            The checked fallback contains {saturnaliaEvents.length} official
            Saturnalia listings from 20–23 November, reviewed 15 Nov 2026. This
            is not a live organizer integration. Source checks run at most every
            15 minutes while the app is used and import supported public
            structured event records when available. Without those records, the
            checked fallback remains visible; a successful page check does not
            mean its schedule was synchronized.
          </p>
          {sources.map((s) => (
            <p key={s.name}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
              : {s.state} · {s.imported} imported · Checked{" "}
              {new Date(s.checkedAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </p>
          ))}
        </details>
        {message && (
          <p role="status" className="campus-status">
            {message}
          </p>
        )}
      </section>
      <CampusResources />
      <section id="society-updates" className="society-section">
        <div className="campus-section-heading">
          <div>
            <span className="eyebrow">
              THERE’S A COMMUNITY FOR YOUR KIND OF CURIOUS
            </span>
            <h2>Made by students. Made for you.</h2>
          </div>
          <a
            href="https://studentsocieties.thapar.edu/"
            target="_blank"
            rel="noreferrer"
          >
            Official society directory ↗
          </a>
        </div>
        <div className="society-scroll">
          {campusOrganizations.map((s) => (
            <article key={s.id} className={"society-tile " + s.color}>
              <a href={s.url} target="_blank" rel="noreferrer">
                <span>{s.name.slice(0, 2).toUpperCase()}</span>
                <h3>
                  {s.name}
                  <ArrowUpRight size={15} />
                </h3>
                <p>{s.tag}</p>
              </a>
              <a
                className="society-updates-link"
                href={s.updates}
                target="_blank"
                rel="noreferrer"
              >
                Events & updates ↗
              </a>
            </article>
          ))}
        </div>
        <div className="campus-news-heading">
          <h3>On the campus radar</h3>
          <select
            aria-label="Filter campus news organizer"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          >
            <option>All</option>
            {Array.from(new Set(campusUpdates.map((u) => u.org))).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="campus-news-grid">
          {updates.map((u) => (
            <article key={u.id} className="campus-news-item">
              <span>
                {u.org} · {u.type}
              </span>
              <h3>
                <a href={u.url} target="_blank" rel="noreferrer">
                  {u.title}
                  <ArrowUpRight size={16} />
                </a>
              </h3>
              <p>{u.summary}</p>
              <footer>
                {u.eventDate ? dayLabel(u.eventDate) : "Community spotlight"} ·
                Source checked {u.date}
              </footer>
            </article>
          ))}
        </div>
        <p className="campus-source-line">
          Summaries of organizer pages, checked 15 Nov 2026. These are separate
          from student posts below. Virsa, ACM and Fateh links open their own
          updates; no unverified event dates are invented.
        </p>
      </section>
    </section>
  );
}
export function CampusResources() {
  return (
    <section className="discovery-widget campus-resource-widget">
      <span className="eyebrow">YOUR CAMPUS TOOLKIT</span>
      <h2>
        Less searching.
        <br />
        More doing.
      </h2>
      {campusResources.map((r) => (
        <a href={r.url} key={r.url} target="_blank" rel="noreferrer">
          <div>
            <strong>{r.name}</strong>
            <small>{r.detail}</small>
          </div>
          <ArrowUpRight size={16} />
        </a>
      ))}
    </section>
  );
}
