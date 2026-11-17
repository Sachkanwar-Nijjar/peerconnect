"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowUpRight,
  Search,
  Star,
  Users,
  MessageCircle,
} from "lucide-react";
import { apiResponse } from "@/lib/api-response";
import { helpTopics, facultyResources } from "@/lib/learning-catalog";
async function api(query: string, body?: unknown) {
  return apiResponse(
    await fetch(
      "/api/data/learning" + (body ? "" : "?" + query),
      body
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : { cache: "no-store" },
    ),
  );
}
export function LearningHub({
  section,
  user,
}: {
  section: string;
  user: { id: string; name: string };
}) {
  const router = useRouter(),
    query = useSearchParams(),
    code = query.get("code"),
    id = query.get("id");
  const view =
    section === "courses"
      ? code
        ? "course"
        : "courses"
      : section === "skills"
        ? "offers"
        : id
          ? "thread"
          : "requests";
  const [data, setData] = useState<any>(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [page, setPage] = useState(1),
    [revision, setRevision] = useState(0),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState<any>(null);
  const load = useCallback(async () => {
    try {
      setData(
        await api(
          new URLSearchParams({
            view,
            q: search,
            page: String(page),
            semester: section === "courses" ? filter : "",
            category: section === "skills" ? filter : "",
            status: section === "guidance" ? filter : "",
            ...(code ? { code } : {}),
            ...(id ? { id } : {}),
          }).toString(),
        ),
      );
    } catch (e) {
      setNotice((e as Error).message);
    }
  }, [view, search, page, section, filter, code, id]);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 200);
    return () => clearTimeout(timer);
  }, [load, revision]);
  useEffect(() => {
    if (view !== "thread") return;
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [view, load]);
  async function act(body: any) {
    setBusy(true);
    try {
      const r = await api("", body);
      setNotice("Saved.");
      setRevision((n) => n + 1);
      return r;
    } catch (e) {
      setNotice((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  function form(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    return Object.fromEntries(new FormData(e.currentTarget));
  }
  function helper(p: any, context: any) {
    return (
      <article className="learn-card" key={p.id}>
        <div className="mentor-identity">
          <span className="learn-avatar">
            {p.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h3>{p.name}</h3>
            <p>
              {p.profile?.department} · Year {p.profile?.year || "—"}
            </p>
          </div>
        </div>
        <span className="learn-tag green">
          {context.skill || context.courseCode} · {context.level || "Taken"}
        </span>
        <p>
          {p.profile?.bio ||
            "A focused question is the start of a useful conversation."}
        </p>
        <p className="learn-muted">
          Why this helper: available for this{" "}
          {context.skill ? "skill" : "course"}. Experience is self-declared.
        </p>
        {p.profile?.availability && (
          <p>Availability: {p.profile.availability}</p>
        )}
        <Reputation id={p.id} />
        <div className="learn-actions">
          <Link href={"/app/profile/" + p.id}>View profile ↗</Link>
          {p.id !== user.id && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSelected({ person: p, ...context })}
            >
              Ask for guidance
            </button>
          )}
        </div>
      </article>
    );
  }
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!selected) return;
    const old = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          "button,input,select,textarea,a[href]",
        ) || [],
      ).filter((x) => !x.hasAttribute("disabled"));
    focusable()[0]?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "Tab") {
        const all = focusable(),
          first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = previousOverflow;
      old?.focus();
    };
  }, [selected]);
  const filters =
    section === "courses"
      ? ["1", "2", "3", "4", "5"]
      : section === "skills"
        ? ["Technical", "Communication", "Creative", "Career"]
        : ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"];
  return (
    <div className="learning-hub">
      <header className="learn-heading">
        <span className="eyebrow">LEARN · CONNECT · BUILD</span>
        <h1>
          {section === "courses"
            ? "A little context. A lot of clarity."
            : section === "skills"
              ? "Someone here knows your next step."
              : "Good conversations start here."}
        </h1>
        <p>Real people. Relevant experience. Your Thapar community.</p>
      </header>
      <nav className="learn-tabs" aria-label="Learning navigation">
        <Link
          className={section === "courses" ? "active" : ""}
          href="/app/courses"
        >
          <BookOpen size={18} />
          Course library
        </Link>
        <Link
          className={section === "skills" ? "active" : ""}
          href="/app/skills"
        >
          <Users size={18} />
          Find a helper
        </Link>
        <Link
          className={section === "guidance" ? "active" : ""}
          href="/app/guidance"
        >
          <MessageCircle size={18} />
          Guidance inbox
        </Link>
      </nav>
      {notice && (
        <div className="learn-notice" role="status">
          {notice}
          <button onClick={() => void load()}>Refresh</button>
        </div>
      )}
      {!data ? (
        <p role="status">Loading your campus…</p>
      ) : (
        <>
          {["courses", "offers", "requests"].includes(view) && (
            <div className="learn-filters">
              {view !== "requests" && (
                <label className="learn-search">
                  <Search size={18} />
                  <input
                    aria-label="Search courses or helpers"
                    placeholder="Search by name, course or skill…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>
              )}
              <select
                aria-label="Filter results"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">
                  All{" "}
                  {section === "courses"
                    ? "semesters"
                    : section === "skills"
                      ? "categories"
                      : "statuses"}
                </option>
                {filters.map((f) => (
                  <option key={f} value={f}>
                    {section === "courses" ? "Semester " + f : f}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setFilter("");
                  setSearch("");
                  setPage(1);
                }}
              >
                Reset
              </button>
            </div>
          )}
          {view === "courses" && (
            <>
              <div className="learn-banner">
                <div>
                  <span className="learn-tag">OFFICIAL SOURCE · CSE 2026</span>
                  <h2>
                    Know the course.
                    <br />
                    Find your people.
                  </h2>
                  <p>
                    A curated starter library with credits, semester and direct
                    syllabus sources. Check your own batch scheme before
                    planning.
                  </p>
                  <a
                    href="https://www.thapar.edu/upload/files/BECSE2026_Scheme.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official syllabus <ArrowUpRight size={16} />
                  </a>
                </div>
                <BookOpen size={100} />
              </div>
              <p className="learn-muted">
                {data.total} courses · CSE starter coverage · Checked 15 Nov
                2026
              </p>
              <div className="learn-grid">
                {data.items.map((c: any) => (
                  <Link
                    className={"learn-card course-card semester-" + c.semester}
                    href={"/app/courses?code=" + c.code}
                    key={c.code}
                  >
                    <span className="course-code">
                      {c.code}
                      <ArrowUpRight size={18} />
                    </span>
                    <h2>{c.title}</h2>
                    <p>
                      Semester {c.semester} · {c.credits} credits
                    </p>
                    <footer>
                      {c._count.students} offering help{" "}
                      {c.students.length > 0 && (
                        <span className="learn-tag green">
                          {c.students[0].status}
                        </span>
                      )}
                    </footer>
                  </Link>
                ))}
              </div>
              <section className="faculty-resources">
                <h2>Faculty & official resources</h2>
                <p>
                  Current institute directories. Listings do not imply
                  PeerConnect membership or endorsement.
                </p>
                {facultyResources.map((f) => (
                  <a key={f.url} href={f.url} target="_blank" rel="noreferrer">
                    {f.title}
                    <ArrowUpRight size={16} />
                  </a>
                ))}
              </section>
            </>
          )}
          {view === "course" && (
            <>
              <Link href="/app/courses">← All courses</Link>
              <div className="learn-banner">
                <div>
                  <span className="learn-tag">
                    {data.course.code} · {data.course.scheme}
                  </span>
                  <h2>{data.course.title}</h2>
                  <p>
                    Semester {data.course.semester} · {data.course.credits}{" "}
                    credits
                  </p>
                  <a
                    href={data.course.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official syllabus · checked {data.course.checkedAt} ↗
                  </a>
                </div>
              </div>
              <div className="learn-two">
                <section className="learn-card">
                  <h2>Your experience</h2>
                  <p>Course status and availability are self-declared.</p>
                  <form
                    key={JSON.stringify(data.course.students)}
                    onSubmit={(e) => {
                      const f = form(e);
                      void act({
                        action: "course",
                        code,
                        status: f.status,
                        available: f.available === "on",
                      });
                    }}
                  >
                    <label>
                      Course status
                      <select
                        name="status"
                        defaultValue={
                          data.course.students[0]?.status || "TAKING"
                        }
                      >
                        <option value="TAKING">Currently taking</option>
                        <option value="TAKEN">Already taken</option>
                      </select>
                    </label>
                    <label className="learn-check">
                      <input
                        type="checkbox"
                        name="available"
                        defaultChecked={data.course.students[0]?.available}
                      />{" "}
                      Available to help
                    </label>
                    <button disabled={busy} className="btn btn-primary">
                      Save course preference
                    </button>
                  </form>
                </section>
                <section className="learn-card">
                  <h2>Student perspective</h2>
                  <p>
                    {data.experience.count} contributions · Student-reported
                  </p>
                  <p>
                    {data.experience.workload
                      ? `Average workload: ${data.experience.workload.toFixed(1)} / 5`
                      : "Workload averages appear after 3 contributions."}
                  </p>
                  {data.course.students[0]?.status === "TAKEN" ? (
                    <form
                      onSubmit={(e) => {
                        const f = form(e);
                        void act({
                          action: "experience",
                          code,
                          cohort: f.cohort,
                          workload: Number(f.workload),
                          advice: "",
                        });
                      }}
                    >
                      <label>
                        Batch / semester
                        <input
                          name="cohort"
                          minLength={4}
                          maxLength={40}
                          placeholder="2024 batch · semester 3"
                          defaultValue={data.mine?.cohort}
                          required
                        />
                      </label>
                      <label>
                        Workload
                        <select
                          name="workload"
                          defaultValue={data.mine?.workload || 3}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      </label>
                      <button className="btn btn-outline" disabled={busy}>
                        Save feedback
                      </button>
                    </form>
                  ) : (
                    <p>
                      Mark this course as taken to contribute. Individual
                      responses are never published.
                    </p>
                  )}
                </section>
              </div>
              <h2 className="learn-section-title">People who can help</h2>
              <div className="learn-grid">
                {data.helpers.map((h: any) =>
                  helper(h.user, { courseCode: code }),
                )}
              </div>
              {!data.helpers.length && (
                <Empty text="No helpers yet. Offer help above or explore skill helpers." />
              )}
            </>
          )}
          {view === "offers" && (
            <>
              <div className="learn-two">
                <div className="learn-banner">
                  <div>
                    <span className="learn-tag">PASS IT FORWARD</span>
                    <h2>
                      Your next breakthrough
                      <br />
                      could start with a hello.
                    </h2>
                    <p>
                      Technical, creative, communication and career skills. Find
                      help, then build something together.
                    </p>
                  </div>
                </div>
                <section className="learn-card">
                  <h2>What can you help with?</h2>
                  <form
                    onSubmit={(e) => {
                      const f = form(e);
                      void act({ action: "offer", ...f, available: true });
                    }}
                  >
                    <label>
                      Skill
                      <input
                        name="skill"
                        required
                        minLength={2}
                        maxLength={60}
                        placeholder="Python or public speaking"
                      />
                    </label>
                    <div className="learn-form-row">
                      <label>
                        Category
                        <select name="category">
                          {[
                            "Technical",
                            "Communication",
                            "Creative",
                            "Career",
                          ].map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Experience
                        <select name="level">
                          {["Learning", "Intermediate", "Advanced"].map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <button className="btn btn-primary" disabled={busy}>
                      Offer help
                    </button>
                  </form>
                </section>
              </div>
              {data.mine.length > 0 && (
                <section className="learn-my-offers">
                  <h2>Your help skills</h2>
                  {data.mine.map((o: any) => (
                    <button
                      className="learn-offer-toggle"
                      key={o.id}
                      disabled={busy}
                      onClick={() =>
                        void act({
                          action: "offer",
                          skill: o.skill,
                          category: o.category,
                          level: o.level,
                          available: !o.available,
                        })
                      }
                    >
                      {o.skill} · {o.level} ·{" "}
                      {o.available ? "Available — pause" : "Paused — resume"}
                    </button>
                  ))}
                </section>
              )}
              <p className="learn-muted">
                {data.total} available offers · Self-declared experience
              </p>
              <div className="learn-grid">
                {data.items.map((o: any) => (
                  <div key={o.id}>
                    {helper(o.user, { skill: o.skill, level: o.level })}
                  </div>
                ))}
              </div>
            </>
          )}
          {view === "requests" && (
            <>
              <h2>Your guidance, in one place</h2>
              <p className="learn-muted">
                Chat opens after acceptance. A daily limit of 10 requests keeps
                campus inboxes useful.
              </p>
              {!data.length && (
                <Empty text="No requests here. Find a course or skill helper to get started." />
              )}
              <div className="learn-request-list">
                {data.map((r: any) => (
                  <Link
                    className="learn-card request-row"
                    key={r.id}
                    href={"/app/guidance?id=" + r.id}
                  >
                    <span className="learn-tag">{r.status}</span>
                    <div>
                      <h3>
                        {r.senderId === user.id
                          ? "To " + r.recipient.name
                          : "From " + r.sender.name}
                      </h3>
                      <p>
                        {r.topic} · {r.courseCode || r.skill}
                      </p>
                      <p>{r.question.slice(0, 140)}</p>
                    </div>
                    <ArrowUpRight size={20} />
                  </Link>
                ))}
              </div>
            </>
          )}
          {view === "thread" && (
            <>
              <Link href="/app/guidance">← Guidance inbox</Link>
              <section className="learn-card">
                <span className="learn-tag">{data.status}</span>
                <h2>{data.topic}</h2>
                <p>
                  {data.sender.name} → {data.recipient.name} ·{" "}
                  {data.courseCode || data.skill}
                </p>
                <blockquote>{data.question}</blockquote>
                <div className="learn-actions">
                  {data.status === "PENDING" &&
                    (data.recipientId === user.id ? (
                      <>
                        <button
                          disabled={busy}
                          className="btn btn-primary"
                          onClick={() =>
                            void act({
                              action: "status",
                              id,
                              status: "ACCEPTED",
                            })
                          }
                        >
                          Accept request
                        </button>
                        <button
                          disabled={busy}
                          className="btn btn-outline"
                          onClick={() =>
                            void act({
                              action: "status",
                              id,
                              status: "DECLINED",
                            })
                          }
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={busy}
                        className="btn btn-outline"
                        onClick={() =>
                          void act({
                            action: "status",
                            id,
                            status: "CANCELLED",
                          })
                        }
                      >
                        Cancel request
                      </button>
                    ))}
                  {data.status === "ACCEPTED" && (
                    <button
                      disabled={busy}
                      className="btn btn-outline"
                      onClick={() =>
                        void act({ action: "status", id, status: "COMPLETED" })
                      }
                    >
                      Mark completed
                    </button>
                  )}
                </div>
              </section>
              {["ACCEPTED", "COMPLETED"].includes(data.status) ? (
                <section className="learn-card">
                  <h2>Guidance conversation</h2>
                  <p className="learn-muted">
                    Private to participants · Updates every 5 seconds · Latest
                    100 messages
                  </p>
                  <div className="learn-messages" aria-live="polite">
                    {data.messages.map((m: any) => (
                      <div
                        key={m.id}
                        className={m.senderId === user.id ? "own" : ""}
                      >
                        <strong>
                          {m.senderId === user.id
                            ? "You"
                            : data.senderId === user.id
                              ? data.recipient.name
                              : data.sender.name}
                        </strong>
                        <p>{m.content}</p>
                      </div>
                    ))}
                  </div>
                  {data.status === "ACCEPTED" && (
                    <form
                      onSubmit={async (e) => {
                        const target = e.currentTarget,
                          f = form(e);
                        if (
                          await act({
                            action: "message",
                            id,
                            content: f.content,
                          })
                        )
                          target.reset();
                      }}
                    >
                      <label>
                        Message
                        <textarea
                          name="content"
                          required
                          maxLength={4000}
                          placeholder="Share a useful answer…"
                        />
                      </label>
                      <button disabled={busy} className="btn btn-primary">
                        Send message
                      </button>
                    </form>
                  )}
                  {data.status === "COMPLETED" &&
                    data.senderId === user.id &&
                    (!data.reviews.length ? (
                      <form
                        onSubmit={(e) => {
                          const f = form(e);
                          void act({
                            action: "review",
                            id,
                            rating: Number(f.rating),
                          });
                        }}
                      >
                        <label>
                          How helpful was the conversation?
                          <select name="rating">
                            {[5, 4, 3, 2, 1].map((n) => (
                              <option key={n}>{n}</option>
                            ))}
                          </select>
                        </label>
                        <p className="learn-muted">
                          One rating after a helper reply. Counts are shown
                          alongside the average.
                        </p>
                        <button disabled={busy} className="btn btn-primary">
                          Submit feedback
                        </button>
                      </form>
                    ) : (
                      <p>Thank you. Your feedback is recorded.</p>
                    ))}
                </section>
              ) : (
                <Empty text="Chat opens after the helper accepts this request." />
              )}
            </>
          )}
          {["courses", "offers", "requests"].includes(view) && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                className="btn btn-outline"
                disabled={
                  view === "requests"
                    ? data.length < 30
                    : page * 12 >= data.total
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
          {["courses", "offers"].includes(view) && !data.items.length && (
            <Empty text="No matches. Try a broader search or reset the filters." />
          )}
        </>
      )}
      {selected && (
        <div className="learn-dialog-backdrop">
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guidance-title"
            className="learn-dialog"
          >
            <button
              className="learn-close"
              aria-label="Close request"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <h2 id="guidance-title">Ask {selected.person.name}</h2>
            <p>
              {selected.courseCode || selected.skill} · A focused question makes
              helping easier.
            </p>
            <form
              onSubmit={async (e) => {
                const f = form(e);
                const r = await act({
                  action: "request",
                  recipientId: selected.person.id,
                  topic: f.topic,
                  question: f.question,
                  ...(selected.courseCode
                    ? { courseCode: selected.courseCode }
                    : { skill: selected.skill }),
                });
                if (r) router.push("/app/guidance?id=" + r.id);
              }}
            >
              <label>
                Topic
                <select autoFocus name="topic">
                  {helpTopics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Your question
                <textarea
                  name="question"
                  required
                  minLength={20}
                  maxLength={2000}
                  placeholder="What have you tried? What would you like help with?"
                />
              </label>
              <p className="learn-muted">
                20–2,000 characters. Chat opens after acceptance.
              </p>
              {notice && notice !== "Saved." && <p role="alert">{notice}</p>}
              <div className="learn-actions">
                <button disabled={busy} className="btn btn-primary">
                  Send guidance request
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="learn-empty">
      <BookOpen size={28} />
      <h3>Room for a useful connection.</h3>
      <p>{text}</p>
      <Link href="/app/courses">Explore courses ↗</Link>
    </div>
  );
}
function Reputation({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    let live = true;
    api("view=reputation&id=" + id)
      .then((d) => {
        if (live) setData(d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [id]);
  return (
    <p className="learn-reputation">
      <Star size={14} />
      {data?.count
        ? `${data.rating.toFixed(1)} / 5 · ${data.count} guidance ratings`
        : "New helper · No guidance ratings yet"}
    </p>
  );
}
