"use client";
import { CampusLife } from "./campus-life";
import { LearningHub } from "./learning-hub";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  FileCheck,
  GraduationCap,
  Heart,
  Home,
  Layers,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Users,
  X,
  Flag,
  Trash2,
  Pencil,
  Clock,
  Briefcase,
  ExternalLink,
  Flame,
  Radio,
  MoveUpRight,
  Moon,
} from "lucide-react";
import { Brand, OrbitMark } from "./brand";
import { apiResponse } from "@/lib/api-response";
type Data = Record<string, any>;
type Viewer = {
  id: string;
  name: string;
  role: string;
  requestedFaculty: boolean;
};
async function request(path: string, body?: unknown) {
  const r = await fetch(
    `/api/data/${path}`,
    body === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  return apiResponse(r);
}
const skills = (p: Data) => p?.skills?.map((s: Data) => s.skill.name) || [];
const titleCase = (s: string) =>
  s === "ml"
    ? "ML"
    : s === "sql"
      ? "SQL"
      : s.replace(/\b\w/g, (c) => c.toUpperCase());
const initials = (s: string) =>
  s
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("");
function RelativeTime({ value }: { value: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(
    0,
    Math.floor((now - new Date(value).getTime()) / 1000),
  );
  const label =
    seconds < 60
      ? "Just now"
      : seconds < 3600
        ? `${Math.floor(seconds / 60)}m ago`
        : seconds < 86400
          ? `${Math.floor(seconds / 3600)}h ago`
          : seconds < 604800
            ? `${Math.floor(seconds / 86400)}d ago`
            : new Date(value).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });
  return (
    <time dateTime={value} title={new Date(value).toLocaleString()}>
      {label}
    </time>
  );
}
function Avatar({ name, big = false }: { name: string; big?: boolean }) {
  const hue =
    [...name].reduce((total, char) => total + char.charCodeAt(0), 0) % 5;
  return (
    <span
      aria-hidden="true"
      className={`avatar avatar-tone-${hue} ${big ? "avatar-big" : ""}`}
    >
      {initials(name)}
    </span>
  );
}
function Chips({ items }: { items: string[] }) {
  return (
    <div className="chip-row">
      {items.map((s) => (
        <span className="chip" key={s}>
          {titleCase(s)}
        </span>
      ))}
    </div>
  );
}
function Empty({
  title = "Nothing here yet.",
  text = "Good things start with a first step.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <span className="icon-tile">
        <OrbitMark />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Heading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function ProjectCard({ project: p }: { project: Data }) {
  return (
    <article
      className={`card project-card project-category-${p.category.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="project-art" aria-hidden="true">
        <OrbitMark />
        <span />
        <span />
      </div>
      <div className="card-top">
        <span className={`project-icon ${p.research ? "violet" : ""}`}>
          {p.research ? <GraduationCap /> : <Code2 />}
        </span>
        <span className="tag">{p.research ? "Research" : p.category}</span>
        {p.match && (
          <span className="match-label">
            {Math.round(p.match.score)}% match
          </span>
        )}
      </div>
      <Link href={`/app/projects/${p.id}`}>
        <h3>{p.title}</h3>
      </Link>
      <p className="clamp-2">{p.description}</p>
      <Chips items={skills(p)} />
      {p.match && (
        <div className="recommendation-reason">
          {p.match.matched.length} required skills matched
          {p.interestOverlap ? ` · ${p.interestOverlap} shared interests` : ""}
        </div>
      )}
      <div className="project-footer">
        <span>
          <Avatar name={p.creator.name} />
          {p.creator.name}
        </span>
        <Link href={`/app/projects/${p.id}`} aria-label={`View ${p.title}`}>
          <ArrowUpRight size={19} />
        </Link>
      </div>
      <div className="project-meta">
        <span>
          <Users size={14} />
          {(p.team?.members?.length || 0) + 1}/{p.teamSize} positions filled
        </span>
        <span className={`status ${p.status.toLowerCase()}`}>{p.status}</span>
      </div>
    </article>
  );
}
export function Workspace({ user }: { user: Viewer }) {
  const pathname = usePathname(),
    router = useRouter(),
    query = useSearchParams(),
    path = pathname
      .replace(/^\/app\/?/, "")
      .split("/")
      .filter(Boolean),
    section = path[0] || "dashboard";
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [revision, setRevision] = useState(0),
    [mobile, setMobile] = useState(false),
    [search, setSearch] = useState(query.get("q") || ""),
    [filter, setFilter] = useState(""),
    [requiredSkill, setRequiredSkill] = useState(""),
    [page, setPage] = useState(1),
    [notifications, setNotifications] = useState<Data>({
      items: [],
      unread: 0,
    }),
    [bell, setBell] = useState(false),
    [dark, setDark] = useState(true);
  const isFaculty = user.role === "FACULTY",
    isAdmin = user.role === "ADMIN",
    isMod = ["ADMIN", "MODERATOR"].includes(user.role);
  const reload = () => setRevision((n) => n + 1);
  const act = async (
    action: string,
    body: unknown,
    message = "Saved successfully.",
  ) => {
    setBusy(true);
    try {
      const result = await request(action, body);
      setToast(message);
      reload();
      return result;
    } catch (e) {
      setToast((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };
  const resource = useCallback(() => {
    const qs = new URLSearchParams({ page: String(page), q: search });
    if (requiredSkill) qs.set("skill", requiredSkill);
    if (filter)
      qs.set(section === "people" ? "department" : "category", filter);
    if (["courses", "skills", "guidance"].includes(section)) return "me";
    if (section === "dashboard") return "dashboard";
    if (section === "profile")
      return path[1] && path[1] !== "edit" ? `person?id=${path[1]}` : "person";
    if (
      section === "projects" ||
      section === "research" ||
      section === "manage-projects" ||
      section === "matching"
    ) {
      if (path[1] && path[1] !== "new") {
        if (path[2] === "matching" || section === "matching")
          return `matching?id=${path[1]}`;
        return `project?id=${path[1]}`;
      }
      if (path[1] === "new") return "me";
      if (section === "research") qs.set("research", "true");
      if (section === "manage-projects" || section === "matching")
        qs.set("mine", "true");
      return `projects?${qs}`;
    }
    if (section === "people") return `people?${qs}`;
    if (section === "applications") return `applications?${qs}`;
    if (section === "applicants") return `applications?received=true&${qs}`;
    if (section === "teams") return `teams?${qs}`;
    if (section === "community")
      return path[1] && path[1] !== "new"
        ? `post?id=${path[1]}`
        : `posts?${qs}`;
    if (section === "messages") return "conversations";
    if (section === "notifications") return `notifications?${qs}`;
    if (section === "moderation") return "reports";
    if (section === "admin") return `users?${qs}`;
    if (section === "settings") return "me";
    return "missing";
  }, [pathname, search, filter, page, requiredSkill]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let live = true;
    request(resource())
      .then((d) => {
        if (live) {
          setData(d);
          setError("");
        }
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [resource, revision]);
  useEffect(() => {
    let live = true;
    const fetchNotifications = () =>
      request("notifications")
        .then((d) => {
          if (live) setNotifications(d);
        })
        .catch(() => {});
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [revision]);
  useEffect(() => {
    const sync = () =>
      setDark(localStorage.getItem("peerconnect-theme") !== "light");
    window.addEventListener("storage", sync);
    const frame = requestAnimationFrame(sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(t);
  }, [toast]);
  const nav = [
    { label: "Campus Home", href: "/app", icon: Home, key: "dashboard" },
    {
      label: "Campus Community",
      href: "/app/community",
      icon: MessageCircle,
      key: "community",
    },
    { label: "Messages", href: "/app/messages", icon: Send, key: "messages" },
    {
      label: "Course Library",
      href: "/app/courses",
      icon: BookOpen,
      key: "courses",
    },
    { label: "Skill Helpers", href: "/app/skills", icon: Users, key: "skills" },
    {
      label: "Guidance Inbox",
      href: "/app/guidance",
      icon: MessageCircle,
      key: "guidance",
    },
    {
      label: "Discover Projects",
      href: "/app/projects",
      icon: Compass,
      key: "projects",
    },
    {
      label: "Research",
      href: "/app/research",
      icon: GraduationCap,
      key: "research",
    },
    {
      label: "Discover People",
      href: "/app/people",
      icon: Users,
      key: "people",
    },

    {
      label: isFaculty ? "Applications received" : "My Applications",
      href: isFaculty ? "/app/applicants" : "/app/applications",
      icon: FileCheck,
      key: isFaculty ? "applicants" : "applications",
    },
    { label: "My Teams", href: "/app/teams", icon: Layers, key: "teams" },
    {
      label: "Manage Projects",
      href: "/app/manage-projects",
      icon: Briefcase,
      key: "manage-projects",
    },
    {
      label: "Find Teammates",
      href: "/app/matching",
      icon: Sparkles,
      key: "matching",
    },
  ];
  function pager() {
    return (
      <div className="pagination">
        <button
          className="btn btn-outline btn-sm"
          disabled={page === 1}
          onClick={() => setPage((n) => n - 1)}
        >
          <ChevronLeft size={15} />
          Previous
        </button>
        <span>Page {page}</span>
        <button
          className="btn btn-outline btn-sm"
          disabled={
            Array.isArray(data)
              ? data.length < 12
              : section === "notifications"
                ? data.items.length < 30
                : true
          }
          onClick={() => setPage((n) => n + 1)}
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    );
  }
  function searchbar(placeholder: string, options: string[] = []) {
    return (
      <div className="search-row">
        <div className="search-input">
          <Search size={18} />
          <input
            aria-label={placeholder}
            value={search}
            placeholder={placeholder}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {options.length > 0 && (
          <label className="filter-label">
            <SlidersHorizontal size={17} />
            <select
              aria-label="Filter category"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    );
  }
  function render() {
    if (["courses", "skills", "guidance"].includes(section))
      return (
        <LearningHub
          key={section + query.toString()}
          section={section}
          user={user}
        />
      );
    if (!data) return null;
    if (section === "dashboard")
      return (
        <CampusHome
          data={data}
          user={user}
          act={act}
          busy={busy}
          revision={revision}
        />
      );
    if (
      ["projects", "research", "manage-projects", "matching"].includes(section)
    ) {
      if (path[1] === "new")
        return (
          <ProjectForm
            user={user}
            research={section === "research"}
            act={act}
            busy={busy}
          />
        );
      if (path[2] === "matching" || (section === "matching" && path[1]))
        return (
          <>
            <Heading
              eyebrow="SKILLS MEET POSSIBILITY"
              title="Your next great teammates."
              description="Required skills matched ÷ total required skills × 100. Availability and experience do not change the score."
            />
            <Link className="text-link" href={`/app/projects/${path[1]}`}>
              <ChevronLeft size={16} />
              Back to project
            </Link>
            <div className="candidate-grid">
              {data.map((p: Data, i: number) => (
                <article className="card candidate-card" key={p.id}>
                  <div className="card-top">
                    <span className="eyebrow">#{i + 1} SKILL MATCH</span>
                    <span
                      className="score-badge"
                      style={
                        {
                          "--match-angle": `${p.score * 3.6}deg`,
                        } as React.CSSProperties
                      }
                    >
                      <span>
                        {Math.round(p.score)}
                        <small>%</small>
                      </span>
                    </span>
                  </div>
                  <Avatar name={p.name} big />
                  <h2>{p.name}</h2>
                  <p>
                    {p.profile?.department} · Year {p.profile?.year}
                  </p>
                  <div className="progress">
                    <span style={{ width: `${p.score}%` }} />
                  </div>
                  <span className="eyebrow">LISTED SKILLS</span>
                  <Chips items={p.skills} />
                  <span className="eyebrow">MATCHED SKILLS</span>
                  <Chips items={p.matched} />
                  <span className="eyebrow">MISSING SKILLS</span>
                  {p.missing.length ? (
                    <Chips items={p.missing} />
                  ) : (
                    <p className="positive">
                      <Check size={15} />
                      All required skills matched
                    </p>
                  )}
                  <Link
                    className="btn btn-outline full"
                    href={`/app/profile/${p.id}`}
                  >
                    View profile
                    <ArrowUpRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
            {!data.length && (
              <Empty
                title="No suitable matching candidates."
                text="No student currently matches the required skills. Try again when more profiles are available."
              />
            )}
            <p className="muted">
              Scores describe listed skill overlap, not proficiency or
              guaranteed availability.
            </p>
          </>
        );
      if (path[1])
        return (
          <ProjectDetail project={data} user={user} act={act} busy={busy} />
        );
      return (
        <>
          <Heading
            eyebrow="FIND YOUR NEXT CHALLENGE"
            title={
              section === "research"
                ? "Ideas worth exploring."
                : section === "manage-projects"
                  ? "Your ideas, in motion."
                  : section === "matching"
                    ? "Build a team that clicks."
                    : "Big ideas. Open doors."
            }
            description={
              section === "matching"
                ? "Choose one of your projects to discover candidates ranked by required skills."
                : "Discover meaningful work and the people who want to build it with you."
            }
          >
            {["STUDENT", "FACULTY"].includes(user.role) && (
              <Link
                className="btn btn-primary"
                href={
                  section === "research" && isFaculty
                    ? "/app/research/new"
                    : "/app/projects/new"
                }
              >
                <Plus size={17} />
                {section === "research" && isFaculty
                  ? "Create Research Opportunity"
                  : "Create Project"}
              </Link>
            )}
          </Heading>
          {searchbar("Search projects or ideas…", [
            "Technology",
            "Design",
            "Social Impact",
            "Research",
            "Hackathon",
          ])}
          <label className="department-search">
            Required skill
            <input
              placeholder="Filter by a required skill"
              value={requiredSkill}
              onChange={(e) => {
                setRequiredSkill(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <div className="results-caption">
            {section === "matching"
              ? "Your projects · select “Find Teammates” below"
              : "Find your next collaboration"}
          </div>
          <div className="project-grid three">
            {data.map((p: Data) => (
              <div key={p.id}>
                <ProjectCard project={p} />
                {section === "matching" && (
                  <Link
                    className="btn btn-primary full matching-link"
                    href={`/app/projects/${p.id}/matching`}
                  >
                    Find Teammates
                    <Sparkles size={16} />
                  </Link>
                )}
              </div>
            ))}
          </div>
          {!data.length && (
            <Empty
              title="No projects found."
              text="Try a different search, or create the opportunity you wish existed."
            />
          )}
          {pager()}
        </>
      );
    }
    if (section === "profile") {
      if (path[1] === "edit")
        return <ProfileForm person={data} act={act} busy={busy} />;
      return <ProfileView person={data} user={user} act={act} />;
    }
    if (section === "people")
      return (
        <>
          <Heading
            eyebrow="GOOD PEOPLE. SHARED AMBITIONS."
            title="Find your kind of people."
            description="Discover skills and perspectives from across your campus."
          />
          {searchbar("Search by name or skill…")}
          <label className="department-search">
            Department
            <input
              placeholder="Filter department"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <div className="people-grid">
            {data.map((p: Data) => (
              <article className="card person-card" key={p.id}>
                <Avatar name={p.name} big />
                <h3>{p.name}</h3>
                <span className="tag">
                  {p.role === "FACULTY"
                    ? "Faculty / Mentor"
                    : titleCase(p.role)}
                </span>
                <p>{p.profile?.department || "University member"}</p>
                <p className="clamp-2">
                  {p.profile?.bio || "Ready to connect and collaborate."}
                </p>
                <Chips items={skills(p.profile).slice(0, 5)} />
                <Link
                  className="btn btn-outline full"
                  href={`/app/profile/${p.id}`}
                >
                  View profile
                  <ArrowUpRight size={16} />
                </Link>
              </article>
            ))}
          </div>
          {!data.length && (
            <Empty
              title="No people found."
              text="Try another name, department, or skill."
            />
          )}
          {pager()}
        </>
      );
    if (section === "applications" || section === "applicants")
      return (
        <>
          <Heading
            eyebrow="THE NEXT STEP"
            title={
              section === "applicants"
                ? "Meet your potential team."
                : "Your opportunities, in progress."
            }
            description={
              section === "applicants"
                ? "Review profiles, accept a good fit, or close the loop with a decision."
                : "Track every application from a first hello to a new team."
            }
          />
          {data.map((a: Data) => (
            <div className="card application-row" key={a.id}>
              <span className="icon-tile">
                <FileCheck />
              </span>
              <div>
                <Link href={`/app/projects/${a.project.id}`}>
                  <h3>{a.project.title}</h3>
                </Link>
                <p>
                  {section === "applicants"
                    ? a.applicant.name
                    : `Applied ${new Date(a.createdAt).toLocaleDateString()}`}
                </p>
                <p>{a.note}</p>
              </div>
              <span className={`status ${a.status.toLowerCase()}`}>
                {a.status}
              </span>
              {section === "applicants" && a.status === "PENDING" && (
                <div className="row-actions">
                  <Link
                    className="btn btn-outline btn-sm"
                    href={`/app/profile/${a.applicantId}`}
                  >
                    Profile
                  </Link>
                  <button
                    disabled={busy}
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      act(
                        "decision",
                        { id: a.id, status: "ACCEPTED" },
                        "Application accepted. Student added to the team.",
                      )
                    }
                  >
                    Accept
                  </button>
                  <button
                    disabled={busy}
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      act(
                        "decision",
                        { id: a.id, status: "REJECTED" },
                        "Application rejected. Student notified.",
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {!data.length && (
            <Empty
              title="No applications yet."
              text={
                section === "applicants"
                  ? "Applications to your projects will appear here."
                  : "Find a project that feels like your next step."
              }
            />
          )}
          {pager()}
        </>
      );
    if (section === "teams")
      return (
        <>
          <Heading
            eyebrow="BETTER, TOGETHER"
            title="Your people. Your projects."
            description="Every team starts with a shared idea."
          />
          {data.map((t: Data) => (
            <article className="card team-card" key={t.id}>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    {t.members.length + 1} OF {t.project.teamSize} POSITIONS
                    FILLED
                  </span>
                  <h2>{t.project.title}</h2>
                </div>
                <Link
                  className="btn btn-outline"
                  href={`/app/projects/${t.project.id}`}
                >
                  View project
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="team-members">
                <Link
                  href={`/app/profile/${t.project.creatorId}`}
                  className="team-member"
                >
                  <Avatar name={t.project.creator.name} />
                  <div>
                    <strong>{t.project.creator.name}</strong>
                    <small>Project creator</small>
                  </div>
                </Link>
                {t.members.map((m: Data) => (
                  <Link
                    href={`/app/profile/${m.user.id}`}
                    className="team-member"
                    key={m.userId}
                  >
                    <Avatar name={m.user.name} />
                    <div>
                      <strong>{m.user.name}</strong>
                      <small>Accepted member</small>
                      <Chips items={skills(m.user.profile)} />
                    </div>
                  </Link>
                ))}
              </div>
              <p>
                {t.project.teamSize - t.members.length - 1} available positions
                · Creator included in capacity
              </p>
            </article>
          ))}
          {!data.length && (
            <Empty
              title="Your next team is waiting."
              text="Create a project or get an application accepted to start collaborating."
            />
          )}
          {pager()}
        </>
      );
    if (section === "community")
      return (
        <>
          <Heading
            eyebrow="AROUND YOUR CAMPUS"
            title="A space for your community."
            description="Fresh ideas, open questions, and opportunities worth sharing."
          />
          <PostComposer act={act} user={user} busy={busy} />
          {!path[1] && (
            <div className="feed-tabs">
              {["", "Projects", "Academic", "Events", "Announcements"].map(
                (t) => (
                  <button
                    className={filter === t ? "active" : ""}
                    key={t}
                    onClick={() => {
                      setFilter(t);
                      setPage(1);
                    }}
                  >
                    {t || "All Posts"}
                  </button>
                ),
              )}
            </div>
          )}
          <div className="feed-layout">
            <div>
              {data.map((p: Data) => (
                <PostCard
                  key={p.id}
                  post={p}
                  user={user}
                  act={act}
                  busy={busy}
                />
              ))}
              {!data.length && (
                <Empty
                  title="Start a campus conversation."
                  text="Share a question, an idea, or an opportunity."
                />
              )}
              {!path[1] && pager()}
            </div>
            <aside className="context-column">
              <div className="card">
                <span className="icon-tile">
                  <MessageCircle />
                </span>
                <h3>A little kindness goes a long way.</h3>
                <p>
                  Keep it campus-related. Be curious, respectful, and clear
                  about the help you need.
                </p>
                <Link href="/app/projects" className="quick-link">
                  Looking for a teammate?
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="campus-note">
                <span className="eyebrow">CONNECT THE CONVERSATION</span>
                <h3>An idea deserves a team.</h3>
                <p>
                  Link a project in your post so interested students can apply
                  directly.
                </p>
              </div>
            </aside>
          </div>
        </>
      );
    if (section === "messages")
      return (
        <>
          <Heading
            eyebrow="START A CONVERSATION"
            title="Good things begin with hello."
            description="Private conversations, shared possibilities."
          />
          <Messages
            conversations={data}
            user={user}
            act={act}
            revision={revision}
          />
        </>
      );
    if (section === "notifications")
      return (
        <>
          <Heading
            eyebrow="YOU’RE IN THE LOOP"
            title="The latest, for you."
            description="Applications, messages, and relevant campus announcements."
          >
            <button
              disabled={busy}
              className="btn btn-outline"
              onClick={() =>
                act(
                  "readNotifications",
                  {},
                  "All notifications marked as read.",
                )
              }
            >
              <Check size={16} />
              Mark all as read
            </button>
          </Heading>
          {data.items.map((n: Data) => (
            <div
              className={`card notification-row ${n.read ? "" : "unread"}`}
              key={n.id}
            >
              <span className="icon-tile">
                <Bell size={20} />
              </span>
              <Link
                href={n.href}
                onClick={() =>
                  act("readNotifications", { id: n.id }, "Notification read.")
                }
              >
                <strong>{n.text}</strong>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </Link>
              {!n.read && (
                <button
                  className="btn btn-ghost btn-sm"
                  aria-label="Mark notification as read"
                  onClick={() =>
                    act("readNotifications", { id: n.id }, "Notification read.")
                  }
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
          {!data.items.length && (
            <Empty
              title="All quiet for now."
              text="Your notifications will appear here."
            />
          )}
          {pager()}
        </>
      );
    if (section === "moderation")
      return (
        <>
          <Heading
            eyebrow="CARE FOR THE COMMUNITY"
            title="Review reported content."
            description="Review the context, then hide the post or dismiss the report."
          />
          {data.map((r: Data) => (
            <div className="card report-card" key={r.id}>
              <span className="tag">
                {r.resolved ? "Resolved" : "Needs review"}
              </span>
              <h3>Post by {r.post.author.name}</h3>
              <p>{r.post.content}</p>
              <blockquote>{r.reason}</blockquote>
              <small>
                Reported by {r.reporter.name} ·{" "}
                {r.post.hidden ? "Hidden" : "Visible"}
              </small>
              <div className="row-actions">
                <button
                  disabled={busy}
                  className="btn btn-primary"
                  onClick={() =>
                    act(
                      "moderate",
                      { id: r.id, hide: true },
                      "Post hidden and report resolved.",
                    )
                  }
                >
                  Hide post
                </button>
                <button
                  disabled={busy}
                  className="btn btn-outline"
                  onClick={() =>
                    act(
                      "moderate",
                      { id: r.id, hide: false },
                      "Report dismissed. Post visible.",
                    )
                  }
                >
                  Dismiss / restore
                </button>
              </div>
            </div>
          ))}
          {!data.length && (
            <Empty
              title="No reports to review."
              text="Reports from the community will appear here."
            />
          )}
        </>
      );
    if (section === "admin")
      return (
        <>
          <Heading
            eyebrow="PLATFORM MANAGEMENT"
            title="A healthy campus community."
            description="Review faculty requests, assign roles, and manage account access."
          />
          {data.map((u: Data) => (
            <div className="card admin-user" key={u.id}>
              <Avatar name={u.name} />
              <div>
                <strong>{u.name}</strong>
                <small>
                  {u.email} · {u.verified ? "Verified" : "Unverified"}
                  {u.requestedFaculty ? " · Faculty approval requested" : ""}
                </small>
              </div>
              <select
                aria-label={`Role for ${u.name}`}
                disabled={busy || u.id === user.id}
                value={u.role}
                onChange={(e) =>
                  act(
                    "user",
                    { id: u.id, role: e.target.value },
                    "Role updated.",
                  )
                }
              >
                {["STUDENT", "FACULTY", "MODERATOR", "ADMIN"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <button
                className="btn btn-outline btn-sm"
                disabled={busy || u.id === user.id}
                onClick={() =>
                  act(
                    "user",
                    { id: u.id, disabled: !u.disabled },
                    "Account access updated.",
                  )
                }
              >
                {u.disabled ? "Enable account" : "Disable account"}
              </button>
            </div>
          ))}
          {pager()}
        </>
      );
    if (section === "settings")
      return (
        <>
          <Heading
            eyebrow="MAKE YOURSELF AT HOME"
            title="Your preferences."
            description="A few details to make PeerConnect feel like you."
          />
          <div className="card settings-card">
            <h2>Appearance</h2>
            <p>Choose a comfortable theme for your workspace.</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setDark(!dark);
                localStorage.setItem(
                  "peerconnect-theme",
                  dark ? "light" : "dark",
                );
              }}
            >
              <Sun size={17} />
              Switch to {dark ? "light" : "dark"} mode
            </button>
            <hr />
            <h2>Your profile</h2>
            <p>
              Keep your skills and availability current to find better
              collaborations.
            </p>
            <Link href="/app/profile/edit" className="btn btn-primary">
              Edit profile
              <ArrowRight size={16} />
            </Link>
            <hr />
            <h2>Account access</h2>
            <p>{titleCase(user.role)} · Verified university member</p>
            {user.requestedFaculty && (
              <p>Faculty request pending admin approval.</p>
            )}
            <p>
              Contact an administrator if your university role needs updating.
            </p>
          </div>
        </>
      );
    return <Empty title="This page could not be found." />;
  }
  return (
    <div className={`workspace social-ui ${dark ? "dark" : "light"}`}>
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <Brand />
        <button
          className="mobile-close icon-button"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        >
          <X />
        </button>
        <div className="workspace-label">
          <span />
          THAPAR · PATIALA
        </div>
        <nav>
          {nav.map((n) => (
            <Link
              className={section === n.key ? "active" : ""}
              key={n.key}
              href={n.href}
            >
              <n.icon size={19} />
              {n.label}
              {n.key === "community" && <span className="new-dot" />}
            </Link>
          ))}
          {isFaculty && (
            <Link href="/app/research/new">
              <Plus size={19} />
              Create Research
            </Link>
          )}
          {isMod && (
            <Link
              className={section === "moderation" ? "active" : ""}
              href="/app/moderation"
            >
              <Shield size={19} />
              Moderation
            </Link>
          )}
          {isAdmin && (
            <Link
              className={section === "admin" ? "active" : ""}
              href="/app/admin"
            >
              <Shield size={19} />
              Administration
            </Link>
          )}
        </nav>
        {["STUDENT", "FACULTY"].includes(user.role) && (
          <Link className="sidebar-create" href="/app/projects/new">
            <Plus size={17} />
            Create something
            <ArrowUpRight size={15} />
          </Link>
        )}
        <div className="sidebar-bottom">
          <Link href="/app/settings">
            <Settings size={18} />
            Settings
          </Link>
          <button
            onClick={async () => {
              try {
                await apiResponse(
                  await fetch("/api/auth/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: "{}",
                  }),
                );
                router.push("/login");
                router.refresh();
              } catch (error) {
                setToast((error as Error).message);
              }
            }}
          >
            <LogOut size={18} />
            Log out
          </button>
          <Link href="/app/profile" className="sidebar-user">
            <Avatar name={user.name} />
            <div>
              <strong>{user.name}</strong>
              <small>
                {isFaculty ? "Faculty / Mentor" : titleCase(user.role)}
              </small>
            </div>
          </Link>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobile(true)}
              aria-label="Open navigation"
            >
              <Menu />
            </button>
            <span>
              <span className="topbar-campus-name">Your campus</span>
              <ChevronRight size={14} />{" "}
              <strong>
                {section === "dashboard"
                  ? "Campus Home"
                  : titleCase(section.replace("-", " "))}
              </strong>
            </span>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button theme-toggle"
              aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
              onClick={() => {
                setDark(!dark);
                localStorage.setItem(
                  "peerconnect-theme",
                  dark ? "light" : "dark",
                );
              }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/app/people" className="topbar-discover">
              <Search size={17} />
              Find your people
            </Link>
            <button
              aria-label={`Notifications ${notifications.unread}`}
              className="icon-button notification-bell"
              onClick={() => setBell(!bell)}
            >
              <Bell size={20} />
              {notifications.unread > 0 && (
                <span aria-hidden="true">{notifications.unread}</span>
              )}
            </button>
            <Link
              href="/app/profile"
              aria-label={`My profile ${initials(user.name)}`}
            >
              <Avatar name={user.name} />
            </Link>
          </div>
          {bell && (
            <div className="bell-dropdown">
              <div className="section-heading">
                <h3>Notifications</h3>
                <button
                  className="icon-button"
                  aria-label="Close notifications"
                  onClick={() => setBell(false)}
                >
                  <X size={17} />
                </button>
              </div>
              {notifications.items.map((n: Data) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => {
                    setBell(false);
                    act(
                      "readNotifications",
                      { id: n.id },
                      "Notification read.",
                    );
                  }}
                >
                  {!n.read && <span className="live-dot" />}
                  {n.text}
                </Link>
              ))}
              {!notifications.items.length && <p>No notifications yet.</p>}
              <Link
                href="/app/notifications"
                onClick={() => setBell(false)}
                className="text-link"
              >
                View all notifications
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </header>
        <main className="main-content" id="main">
          {error ? (
            <div className="alert error" role="alert">
              {error}
              <button className="btn btn-outline btn-sm" onClick={reload}>
                Try again
              </button>
            </div>
          ) : !data ? (
            <div className="loading" aria-label="Loading">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ) : (
            render()
          )}
        </main>
        <div className="workspace-footer">
          PeerConnect <span>Connect. Collaborate. Create.</span>
          <a href="/images/CREDITS.txt" target="_blank" rel="noreferrer">
            Photo credits
          </a>
          <small>UCS503 · Fictional demo content</small>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function CampusHome({
  data,
  user,
  act,
  busy,
  revision,
}: {
  data: Data;
  user: Viewer;
  act: any;
  busy: boolean;
  revision: number;
}) {
  const faculty = user.role === "FACULTY";
  const projects = (faculty ? data.owned : data.recommended).slice(0, 3);
  const pending = data.applications.filter(
    (application: Data) => application.status === "PENDING",
  );
  return (
    <div className="campus-home">
      <header className="campus-welcome">
        <div>
          <span className="welcome-eyebrow">THAPAR · PATIALA</span>
          <h1>Your campus</h1>
        </div>
        <p>Hey {user.name.split(" ")[0]}. Here’s what’s happening.</p>
      </header>
      <CampusLife userId={user.id} />
      <div className="campus-columns">
        <div className="campus-stream">
          <CampusHighlights revision={revision} />
          <div className="stream-heading">
            <div>
              <Radio size={18} />
              <h2>The campus conversation</h2>
            </div>
            <Link href="/app/community">
              Explore feed <MoveUpRight size={14} />
            </Link>
          </div>
          <PostComposer act={act} user={user} busy={busy} />
          <HomeFeed user={user} act={act} busy={busy} revision={revision} />
        </div>
        <aside className="discovery-rail" aria-label="Your campus discovery">
          <section className="discovery-widget opportunity-widget">
            <div className="widget-heading">
              <span>
                <Sparkles size={16} />
                {faculty ? "YOUR OPPORTUNITIES" : "MADE FOR YOUR SKILLS"}
              </span>
              <Link
                href={faculty ? "/app/manage-projects" : "/app/projects"}
                aria-label="Explore all projects"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <h2>{faculty ? "Your opportunities" : "Projects for you"}</h2>
            {projects.map((p: Data) => (
              <Link
                className="opportunity-mini"
                href={`/app/projects/${p.id}`}
                key={p.id}
              >
                <span
                  className={`mini-project-icon ${p.research ? "research" : ""}`}
                >
                  {p.research ? (
                    <GraduationCap size={19} />
                  ) : (
                    <Code2 size={19} />
                  )}
                </span>
                <div>
                  <small>
                    {p.research ? "RESEARCH" : p.category.toUpperCase()}
                  </small>
                  <h3>{p.title}</h3>
                  <span className="mini-skills">
                    {skills(p).slice(0, 3).map(titleCase).join(" · ")}
                  </span>
                </div>
                {p.match && (
                  <span className="mini-match">
                    {Math.round(p.match.score)}%<small>match</small>
                  </span>
                )}
              </Link>
            ))}
            {!projects.length && (
              <p className="widget-empty">
                {faculty
                  ? "Share an opportunity and meet your next team."
                  : "Add your skills to find opportunities that fit."}
              </p>
            )}
            <Link
              href={faculty ? "/app/research/new" : "/app/projects"}
              className="rail-action"
            >
              {faculty
                ? "Create Research Opportunity"
                : "Discover opportunities"}
              <ArrowRight size={15} />
            </Link>
          </section>
          <section className="discovery-widget personal-widget">
            <div className="widget-heading">
              <span>
                <Layers size={16} />
                YOUR NEXT CHAPTER
              </span>
            </div>
            <div className="personal-subheading">
              <h3>{faculty ? "Applications to review" : "Applications"}</h3>
              <Link href={faculty ? "/app/applicants" : "/app/applications"}>
                View all
                <ChevronRight size={12} />
              </Link>
            </div>
            {pending.length ? (
              pending.slice(0, 2).map((a: Data) => (
                <Link
                  className="personal-update"
                  href={`/app/projects/${a.project.id}`}
                  key={a.id}
                >
                  <span className="update-dot" />
                  <div>
                    <strong>{a.project.title}</strong>
                    <small>
                      {faculty
                        ? "A potential teammate is waiting"
                        : "Your application is with the creator"}
                    </small>
                  </div>
                  <span className="status pending">Pending</span>
                </Link>
              ))
            ) : (
              <div className="personal-empty">
                <FileCheck size={17} />
                <p>
                  {faculty
                    ? "No applications waiting for review."
                    : "Your next opportunity is one application away."}
                </p>
              </div>
            )}
            <div className="personal-subheading">
              <h3>Your teams</h3>
              <Link href="/app/teams">
                View all
                <ChevronRight size={12} />
              </Link>
            </div>
            {data.teams.length ? (
              data.teams.slice(0, 2).map((t: Data) => (
                <Link
                  className="personal-update"
                  href={`/app/projects/${t.project.id}`}
                  key={t.id}
                >
                  <span className="team-mini-mark">
                    <Users size={16} />
                  </span>
                  <div>
                    <strong>{t.project.title}</strong>
                    <small>
                      {t.members.length + 1} people, one shared idea
                    </small>
                  </div>
                  <ArrowUpRight size={14} />
                </Link>
              ))
            ) : (
              <div className="personal-empty">
                <Users size={17} />
                <p>Find the people who make your ideas happen.</p>
              </div>
            )}
          </section>
          <section className="discovery-widget notification-widget">
            <div className="widget-heading">
              <span>
                <Bell size={16} />
                RECENT UPDATES
              </span>
              <Link
                href="/app/notifications"
                aria-label="View all notifications"
              >
                <ArrowUpRight size={17} />
              </Link>
            </div>
            {data.notifications.slice(0, 3).map((n: Data) => (
              <Link
                href={n.href}
                className={`orbit-notice ${!n.read ? "is-unread" : ""}`}
                key={n.id}
              >
                <span />
                <div>
                  <p>{n.text}</p>
                  <RelativeTime value={n.createdAt} />
                </div>
              </Link>
            ))}
            {!data.notifications.length && (
              <p className="widget-empty">
                Messages and project updates will find you here.
              </p>
            )}
          </section>
          <section className="people-widget">
            <div className="widget-heading">
              <span>
                <Users size={16} />
                PEOPLE TO MEET
              </span>
            </div>
            {data.recommendedPeople.slice(0, 3).map((p: Data) => (
              <Link
                className="person-mini"
                href={`/app/profile/${p.id}`}
                key={p.id}
              >
                <Avatar name={p.name} />
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.profile?.department || "Thapar community"}</small>
                </div>
                <ArrowUpRight size={14} />
              </Link>
            ))}
            {!data.recommendedPeople.length && (
              <Link className="rail-action" href="/app/people">
                Discover your people
                <ArrowRight size={15} />
              </Link>
            )}
          </section>
          <p className="rail-footnote">
            A little curiosity. A lot of possibility.
            <br />
            Connect. Collaborate. Create.
          </p>
        </aside>
      </div>
    </div>
  );
}
function CampusHighlights({ revision }: { revision: number }) {
  const [posts, setPosts] = useState<Data[] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    request("highlights")
      .then((items) => {
        if (active) {
          setPosts(items);
          setError("");
        }
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [revision, retry]);
  if (posts?.length === 0 && !error) return null;
  return (
    <section className="campus-highlights" aria-label="Campus news and updates">
      <div className="news-heading">
        <h2>Campus news & updates</h2>
        <Link href="/app/community">
          See all <ArrowUpRight size={14} />
        </Link>
      </div>
      {error ? (
        <div className="alert error" role="alert">
          {error}{" "}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setRetry((n) => n + 1)}
          >
            Retry campus news
          </button>
        </div>
      ) : !posts ? (
        <div className="news-row" aria-label="Loading campus news">
          <div className="news-tile skeleton" />
          <div className="news-tile skeleton" />
          <div className="news-tile skeleton" />
        </div>
      ) : (
        <div className="news-row">
          {posts.map((p, i) => (
            <Link
              href={`/app/community/${p.id}`}
              className={`news-tile news-tone-${i}`}
              key={p.id}
            >
              {i < 2 && (
                <div
                  className="news-image"
                  style={{
                    backgroundImage: `url(/images/thapar-${i === 0 ? "aerial" : "night"}.jpg)`,
                  }}
                />
              )}
              <div className="news-copy">
                <span className="news-category">
                  {p.highlighted ? "CAMPUS NOTICE" : p.category.toUpperCase()}
                </span>
                <h3>
                  {p.project?.title || p.content.split(/(?<=[.!?])\s/)[0]}
                </h3>
                <span className="news-meta">
                  {p.author?.name || "Campus community"} ·{" "}
                  <RelativeTime value={p.createdAt} />
                </span>
              </div>
              {i < 2 && <span className="archive-caption">Campus archive</span>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function HomeFeed({
  user,
  act,
  busy,
  revision,
}: {
  user: Viewer;
  act: any;
  busy: boolean;
  revision: number;
}) {
  const [category, setCategory] = useState(""),
    [page, setPage] = useState(1),
    [posts, setPosts] = useState<Data[] | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let current = true;
    request(`posts?${new URLSearchParams({ category, page: String(page) })}`)
      .then((result) => {
        if (current) {
          setPosts(result);
          setError("");
        }
      })
      .catch((error) => {
        if (current) setError(error.message);
      });
    return () => {
      current = false;
    };
  }, [category, page, revision, retry]);
  return (
    <section aria-label="Campus feed" className="home-feed">
      <div
        className="feed-tabs"
        role="group"
        aria-label="Campus post categories"
      >
        {[
          { value: "", label: "For campus", icon: Flame },
          { value: "Projects", label: "Projects", icon: Code2 },
          { value: "Academic", label: "Academic", icon: BookOpen },
          { value: "Events", label: "Events", icon: Radio },
          {
            value: "Announcements",
            label: "Announcements",
            icon: GraduationCap,
          },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            aria-pressed={category === value}
            className={category === value ? "active" : ""}
            onClick={() => {
              setCategory(value);
              setPage(1);
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
      {error && (
        <div className="alert error" role="alert">
          {error}{" "}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setRetry((n) => n + 1)}
          >
            Retry feed
          </button>
        </div>
      )}
      {!posts && !error ? (
        <div className="feed-skeleton">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : (
        <>
          {[...(posts || [])]
            .sort((a, b) => Number(b.highlighted) - Number(a.highlighted))
            .map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                act={act}
                busy={busy}
              />
            ))}
          {posts && !posts.length && (
            <Empty
              title="A conversation starts with you."
              text="Share a question, a collaboration, or something happening on campus."
            />
          )}
          <div className="pagination">
            <button
              className="btn btn-outline btn-sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <span>Page {page}</span>
            <button
              className="btn btn-outline btn-sm"
              disabled={!posts || posts.length < 12}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
function Field({
  label,
  name,
  register,
  required = false,
  textarea = false,
  defaultValue = "",
  type = "text",
}: {
  label: string;
  name: string;
  register: any;
  required?: boolean;
  textarea?: boolean;
  defaultValue?: string | number;
  type?: string;
}) {
  return (
    <label>
      {label}
      {required && <span className="required"> *</span>}
      {textarea ? (
        <textarea
          {...register(name, { required })}
          defaultValue={defaultValue}
          required={required}
          rows={4}
        />
      ) : (
        <input
          {...register(name, { required })}
          defaultValue={defaultValue}
          required={required}
          type={type}
        />
      )}
    </label>
  );
}
function ProfileForm({
  person: p,
  act,
  busy,
}: {
  person: Data;
  act: any;
  busy: boolean;
}) {
  const { register, handleSubmit } = useForm(),
    profile = p.profile || {},
    [saved, setSaved] = useState(false);
  async function save(values: Data) {
    const result = await act(
      "profile",
      values,
      "Profile saved. Your skills are ready for matching.",
    );
    if (result) setSaved(true);
  }
  return (
    <>
      <Heading
        eyebrow="PUT YOUR POTENTIAL OUT THERE"
        title="Make your profile, yours."
        description="Help the right people and projects find you."
      />
      {saved && (
        <div className="alert success">Your profile has been saved.</div>
      )}
      <form className="card editor-form" onSubmit={handleSubmit(save)}>
        <div className="form-grid">
          <Field
            label="Full name"
            name="name"
            defaultValue={p.name}
            register={register}
            required
          />
          <Field
            label="Department"
            name="department"
            defaultValue={profile.department}
            register={register}
            required
          />
          <Field
            label="Year of study"
            name="year"
            defaultValue={profile.year || 1}
            register={register}
            required
            type="number"
          />
          <Field
            label="Availability"
            name="availability"
            defaultValue={profile.availability}
            register={register}
            required
          />
        </div>
        <Field
          label="Bio"
          name="bio"
          defaultValue={profile.bio}
          register={register}
          textarea
        />
        <Field
          label="Skills (comma separated)"
          name="skills"
          defaultValue={skills(profile).join(", ")}
          register={register}
          required
        />
        <p className="field-hint">
          For example: Python, SQL, React. Machine Learning is normalized to ML.
        </p>
        <div className="form-grid">
          <Field
            label="Technologies (comma separated)"
            name="technologies"
            defaultValue={profile.technologies?.join(", ")}
            register={register}
            required
          />
          <Field
            label="Interests / research interests (comma separated)"
            name="interests"
            defaultValue={profile.interests?.join(", ")}
            register={register}
            required
          />
        </div>
        <Field
          label="Experience"
          name="experience"
          defaultValue={profile.experience}
          register={register}
          textarea
          required
        />
        <div className="form-grid">
          <Field
            label="GitHub URL (optional, HTTPS)"
            name="github"
            defaultValue={profile.github}
            register={register}
          />
          <Field
            label="LinkedIn URL (optional, HTTPS)"
            name="linkedin"
            defaultValue={profile.linkedin}
            register={register}
          />
        </div>
        <div className="form-footer">
          <Link className="btn btn-outline" href="/app/profile">
            Cancel
          </Link>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save Profile"}
            <Check size={16} />
          </button>
        </div>
      </form>
    </>
  );
}
function ProfileView({
  person: p,
  user,
  act,
}: {
  person: Data;
  user: Viewer;
  act: any;
}) {
  const router = useRouter(),
    profile = p.profile;
  return (
    <>
      <div className="profile-cover">
        <span>DIFFERENT SKILLS. SHARED POSSIBILITIES.</span>
        <div className="profile-cover-shapes">
          <OrbitMark />
          <span>
            IN GOOD
            <br />
            COMPANY.
          </span>
        </div>
      </div>
      <section className="card profile-main">
        <Avatar name={p.name} big />
        <div className="profile-title">
          <div>
            <h1>{p.name}</h1>
            <p>
              {profile?.department || "Thapar community"}
              {profile?.year ? ` · Year ${profile.year}` : ""}
            </p>
            <span className="tag">
              {p.role === "FACULTY"
                ? "Verified Faculty / Mentor"
                : titleCase(p.role)}
            </span>
          </div>
          {p.id === user.id ? (
            <Link className="btn btn-outline" href="/app/profile/edit">
              <Pencil size={16} />
              Edit Profile
            </Link>
          ) : (
            <button
              className="btn btn-primary"
              onClick={async () => {
                const c = await act(
                  "conversation",
                  { id: p.id },
                  "Conversation opened.",
                );
                if (c) router.push(`/app/messages?conversation=${c.id}`);
              }}
            >
              <MessageCircle size={16} />
              Message
            </button>
          )}
        </div>
        <p className="profile-bio">
          {profile?.bio || "A new connection, a world of possibility."}
        </p>
        {profile && (
          <div className="profile-links">
            <span>
              <Clock size={16} />
              {profile.availability}
            </span>
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer">
                <ExternalLink size={16} />
                GitHub
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <ExternalLink size={16} />
                LinkedIn
              </a>
            )}
          </div>
        )}
      </section>
      {!profile ? (
        <Empty
          title="Give your potential a profile."
          text="Add your skills, interests, experience, and availability to get started."
        />
      ) : (
        <div className="profile-columns">
          <div>
            <section className="card">
              <h2>Skills & strengths</h2>
              <p>The building blocks of your next collaboration.</p>
              <Chips items={skills(profile)} />
              <h3>Technologies</h3>
              <Chips items={profile.technologies} />
            </section>
            <section className="card">
              <h2>Experience</h2>
              <p className="preserve-text">{profile.experience}</p>
            </section>
            <section className="card">
              <h2>Projects & collaborations</h2>
              {p.projects?.map((project: Data) => (
                <Link
                  className="quick-link"
                  href={`/app/projects/${project.id}`}
                  key={project.id}
                >
                  {project.title}
                  <span className="tag">Creator</span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
              {p.memberships?.map((m: Data) => (
                <Link
                  className="quick-link"
                  href={`/app/projects/${m.team.project.id}`}
                  key={m.team.id}
                >
                  {m.team.project.title}
                  <span className="tag">Team member</span>
                </Link>
              ))}
              {!p.projects?.length && !p.memberships?.length && (
                <p>Your next project is waiting to be discovered.</p>
              )}
            </section>
          </div>
          <aside>
            <section className="card">
              <h3>
                {p.role === "FACULTY" ? "Research interests" : "Curious about"}
              </h3>
              <Chips items={profile.interests} />
            </section>
            <section className="campus-note">
              <Sparkles />
              <h3>More than a list of skills.</h3>
              <p>
                The best collaborations start with a conversation. Say hello.
              </p>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
function ProjectForm({
  user,
  research = false,
  existing,
  act,
  busy,
}: {
  user: Viewer;
  research?: boolean;
  existing?: Data;
  act: any;
  busy: boolean;
}) {
  const { register, handleSubmit } = useForm(),
    router = useRouter();
  async function save(values: Data) {
    const result = await act(
      "project",
      { ...values, research, id: existing?.id },
      existing ? "Project updated." : "Your opportunity is live.",
    );
    if (result) router.push(`/app/projects/${result.id}`);
  }
  if (research && user.role !== "FACULTY")
    return (
      <Empty
        title="Faculty access required."
        text="Research opportunities can only be created by approved faculty or mentors."
      />
    );
  return (
    <>
      <Heading
        eyebrow="GIVE YOUR IDEA A START"
        title={
          existing
            ? "A little refinement goes a long way."
            : research
              ? "Open a door to discovery."
              : "What do you want to build?"
        }
        description="Share your idea, describe the skills you need, and find the right people."
      />
      <form className="card editor-form" onSubmit={handleSubmit(save)}>
        <Field
          label={research ? "Research title" : "Project title"}
          name="title"
          register={register}
          required
          defaultValue={existing?.title}
        />
        <Field
          label="Description"
          name="description"
          register={register}
          required
          textarea
          defaultValue={existing?.description}
        />
        <div className="form-grid">
          <label>
            Category
            <select
              {...register("category")}
              defaultValue={
                existing?.category || (research ? "Research" : "Technology")
              }
            >
              {[
                "Technology",
                "Design",
                "Social Impact",
                "Research",
                "Hackathon",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Field
            label="Preferred team size (including you)"
            name="teamSize"
            register={register}
            type="number"
            required
            defaultValue={existing?.teamSize || 4}
          />
        </div>
        <Field
          label="Required skills (comma separated)"
          name="skills"
          register={register}
          required
          defaultValue={existing ? skills(existing).join(", ") : ""}
        />
        <p className="field-hint">
          At least one required skill. These alone determine candidate match
          percentages.
        </p>
        <div className="form-grid">
          <Field
            label="Technologies"
            name="technologies"
            register={register}
            defaultValue={existing?.technologies?.join(", ")}
          />
          <Field
            label="Interests"
            name="interests"
            register={register}
            defaultValue={existing?.interests?.join(", ")}
          />
        </div>
        {research && (
          <>
            <Field
              label="Department"
              name="department"
              register={register}
              defaultValue={existing?.research?.department}
            />
            <Field
              label="Research details"
              name="details"
              register={register}
              textarea
              defaultValue={existing?.research?.details}
            />
          </>
        )}
        {existing && (
          <label>
            Status
            <select {...register("status")} defaultValue={existing.status}>
              {["OPEN", "CLOSED", "COMPLETED"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        <div className="form-footer">
          <Link href="/app/projects" className="btn btn-outline">
            Cancel
          </Link>
          <button className="btn btn-primary" disabled={busy}>
            {busy
              ? "Saving…"
              : existing
                ? "Save changes"
                : research
                  ? "Publish Research Opportunity"
                  : "Create Project"}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </>
  );
}
function ProjectDetail({
  project: p,
  user,
  act,
  busy,
}: {
  project: Data;
  user: Viewer;
  act: any;
  busy: boolean;
}) {
  const [edit, setEdit] = useState(false),
    [note, setNote] = useState(""),
    [confirm, setConfirm] = useState(false),
    owner = p.creatorId === user.id;
  if (edit)
    return (
      <>
        <button className="btn btn-ghost" onClick={() => setEdit(false)}>
          <ChevronLeft size={16} />
          Back to project
        </button>
        <ProjectForm
          user={user}
          existing={p}
          research={!!p.research}
          act={async (...args: any[]) => {
            const result = await act(...args);
            if (result) setEdit(false);
            return result;
          }}
          busy={busy}
        />
      </>
    );
  return (
    <>
      <Link href="/app/projects" className="text-link">
        <ChevronLeft size={16} />
        All opportunities
      </Link>
      <section className="card project-detail">
        <div className="card-top">
          <span className="project-icon large">
            {p.research ? <GraduationCap /> : <Code2 />}
          </span>
          <span className="tag">{p.research ? "Research" : p.category}</span>
          <span className={`status ${p.status.toLowerCase()}`}>{p.status}</span>
        </div>
        <h1>{p.title}</h1>
        <Link className="person-mini" href={`/app/profile/${p.creator.id}`}>
          <Avatar name={p.creator.name} />
          <div>
            <strong>{p.creator.name}</strong>
            <small>Created {new Date(p.createdAt).toLocaleDateString()}</small>
          </div>
        </Link>
        <p className="preserve-text">{p.description}</p>
        <h3>Skills we’re looking for</h3>
        <Chips items={skills(p)} />
        <div className="detail-grid">
          <div>
            <h3>Technologies</h3>
            <Chips items={p.technologies} />
          </div>
          <div>
            <h3>Interests</h3>
            <Chips items={p.interests} />
          </div>
        </div>
        {p.research && (
          <>
            <h3>Research details</h3>
            <p>
              {p.research.department} · {p.research.details}
            </p>
          </>
        )}
        <div className="project-actions">
          {owner ? (
            <>
              <Link
                className="btn btn-primary"
                href={`/app/projects/${p.id}/matching`}
              >
                <Sparkles size={17} />
                Find Teammates
              </Link>
              <button className="btn btn-outline" onClick={() => setEdit(true)}>
                <Pencil size={16} />
                Edit Project
              </button>
              <a className="btn btn-outline" href="#applicants">
                Review Applicants
              </a>
            </>
          ) : p.application ? (
            <span className={`status ${p.application.status.toLowerCase()}`}>
              Application {p.application.status}
            </span>
          ) : user.role === "STUDENT" ? (
            <button
              className="btn btn-primary"
              disabled={p.status !== "OPEN" || busy}
              onClick={() => setConfirm(!confirm)}
            >
              Apply to Project
              <ArrowRight size={16} />
            </button>
          ) : (
            <p>Student accounts can apply to this opportunity.</p>
          )}
        </div>
        {confirm && !p.application && (
          <form
            className="apply-box"
            onSubmit={async (e) => {
              e.preventDefault();
              const result = await act(
                "apply",
                { id: p.id, note },
                "Application submitted. The project creator has been notified.",
              );
              if (result) setConfirm(false);
            }}
          >
            <label>
              A quick introduction (optional)
              <textarea
                maxLength={1000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What draws you to this project?"
              />
            </label>
            <div className="row-actions">
              <button className="btn btn-primary" disabled={busy}>
                Submit Application
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
      <section className="card">
        <div className="section-heading">
          <div>
            <h2>The team so far</h2>
            <p>
              {(p.team?.members?.length || 0) + 1} / {p.teamSize} positions
              filled · creator included
            </p>
          </div>
          <Users />
        </div>
        <div className="team-members">
          <Link className="team-member" href={`/app/profile/${p.creator.id}`}>
            <Avatar name={p.creator.name} />
            <div>
              <strong>{p.creator.name}</strong>
              <small>Project creator</small>
            </div>
          </Link>
          {p.team?.members?.map((m: Data) => (
            <Link
              href={`/app/profile/${m.userId}`}
              className="team-member"
              key={m.userId}
            >
              <Avatar name={m.user.name} />
              <div>
                <strong>{m.user.name}</strong>
                <small>Accepted member</small>
                <Chips items={skills(m.user.profile)} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      {owner && (
        <section className="card" id="applicants">
          <h2>Applications</h2>
          <p>Review a profile, find the fit, and build your team.</p>
          {p.applications.map((a: Data) => (
            <div className="applicant-row" key={a.id}>
              <Avatar name={a.applicant.name} />
              <div>
                <Link href={`/app/profile/${a.applicantId}`}>
                  <strong>{a.applicant.name}</strong>
                </Link>
                <Chips items={skills(a.applicant.profile)} />
                <p>{a.note}</p>
              </div>
              <span className={`status ${a.status.toLowerCase()}`}>
                {a.status}
              </span>
              {a.status === "PENDING" && (
                <div className="row-actions">
                  <button
                    disabled={busy}
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      act(
                        "decision",
                        { id: a.id, status: "ACCEPTED" },
                        "Application accepted. Team updated and student notified.",
                      )
                    }
                  >
                    Accept
                  </button>
                  <button
                    disabled={busy}
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      act(
                        "decision",
                        { id: a.id, status: "REJECTED" },
                        "Application rejected. Student notified.",
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {!p.applications.length && (
            <Empty
              title="Your future team will appear here."
              text="Share your project with the community to reach interested students."
            />
          )}
        </section>
      )}
    </>
  );
}
function PostComposer({
  act,
  user,
  busy,
}: {
  act: any;
  user: Viewer;
  busy: boolean;
}) {
  const [content, setContent] = useState(""),
    [category, setCategory] = useState("General"),
    [highlighted, setHighlighted] = useState(false),
    [linked, setLinked] = useState(""),
    [projects, setProjects] = useState<Data[]>([]);
  useEffect(() => {
    request("projects?mine=true")
      .then(setProjects)
      .catch(() => {});
  }, []);
  return (
    <form
      className="card post-composer"
      onSubmit={async (e) => {
        e.preventDefault();
        const p = await act(
          "post",
          { content, category, highlighted, projectId: linked || null },
          "Your post is live.",
        );
        if (p) setContent("");
      }}
    >
      <div className="composer-top">
        <Avatar name={user.name} />
        <label className="sr-only" htmlFor="post-content">
          Post content
        </label>
        <textarea
          id="post-content"
          placeholder="An idea, a question, something worth sharing…"
          value={content}
          maxLength={4000}
          required
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="composer-options">
        <select
          aria-label="Post category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["General", "Projects", "Academic", "Events", "Announcements"].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
        <select
          aria-label="Link a project"
          value={linked}
          onChange={(e) => setLinked(e.target.value)}
        >
          <option value="">Link a project (optional)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        {["FACULTY", "ADMIN"].includes(user.role) && (
          <label className="check-label">
            <input
              type="checkbox"
              checked={highlighted}
              onChange={(e) => setHighlighted(e.target.checked)}
            />
            Highlight announcement
          </label>
        )}
        <button
          className="btn btn-primary btn-sm"
          disabled={busy || !content.trim()}
        >
          Publish post
          <Send size={15} />
        </button>
      </div>
    </form>
  );
}
function PostCard({
  post: p,
  user,
  act,
  busy,
}: {
  post: Data;
  user: Viewer;
  act: any;
  busy: boolean;
}) {
  const [comment, setComment] = useState(""),
    [edit, setEdit] = useState(false),
    [content, setContent] = useState(p.content),
    [report, setReport] = useState(false),
    [reason, setReason] = useState(""),
    [deleting, setDeleting] = useState(false);
  return (
    <article
      className={`card post-card post-category-${p.category.toLowerCase()} ${p.highlighted ? "highlighted" : ""}`}
    >
      {p.highlighted && (
        <div className="highlight-label">
          <GraduationCap size={15} />
          <span>FROM YOUR FACULTY & CAMPUS</span>
          <Sparkles size={13} />
        </div>
      )}
      <div className="post-header">
        <Link href={`/app/profile/${p.authorId}`} className="author-line">
          <Avatar name={p.author.name} />
          <div>
            <strong>{p.author.name}</strong>
            <small>
              {p.author.role === "FACULTY"
                ? "Faculty / Mentor"
                : titleCase(p.author.role)}{" "}
              · <RelativeTime value={p.createdAt} />
            </small>
          </div>
        </Link>
        <span className="tag">{p.category}</span>
      </div>
      {edit ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await act(
              "post",
              {
                id: p.id,
                content,
                category: p.category,
                highlighted: p.highlighted,
                projectId: p.projectId,
              },
              "Post updated.",
            );
            if (r) setEdit(false);
          }}
        >
          <label>
            Edit post
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>
          <button className="btn btn-primary btn-sm" disabled={busy}>
            Save post
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setEdit(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <p className="post-content preserve-text">{p.content}</p>
      )}
      {p.project && (
        <Link className="linked-project" href={`/app/projects/${p.project.id}`}>
          <span className="icon-tile">
            <Code2 size={20} />
          </span>
          <div>
            <small>AN OPPORTUNITY TO COLLABORATE</small>
            <strong>{p.project.title}</strong>
          </div>
          <ArrowUpRight size={20} />
        </Link>
      )}
      <div className="post-interactions">
        <button
          className={p.likes.length ? "liked" : ""}
          aria-label={`${p.likes.length ? "Unlike post" : "Like post"}, ${p._count.likes} Likes`}
          disabled={busy}
          onClick={() =>
            act(
              "like",
              { id: p.id },
              p.likes.length ? "Like removed." : "Post liked.",
            )
          }
        >
          <Heart size={18} fill={p.likes.length ? "currentColor" : "none"} />
          {p._count.likes} Likes
        </button>
        <Link href={`/app/community/${p.id}`}>
          <MessageCircle size={18} />
          {p._count.comments} Comments
        </Link>
        <div className="post-tools">
          {p.authorId === user.id ? (
            <>
              <button onClick={() => setEdit(!edit)} aria-label="Edit post">
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setDeleting(!deleting)}
                aria-label="Delete post"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button onClick={() => setReport(!report)} aria-label="Report post">
              <Flag size={16} />
            </button>
          )}
        </div>
      </div>
      {deleting && (
        <div className="delete-confirm">
          <span>Delete this post and its comments?</span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setDeleting(false)}
          >
            Keep post
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={() => act("deletePost", { id: p.id }, "Post deleted.")}
          >
            Delete post
          </button>
        </div>
      )}
      {report && (
        <form
          className="report-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await act(
              "report",
              { id: p.id, reason },
              "Report sent to the moderation team.",
            );
            if (r) setReport(false);
          }}
        >
          <label>
            Why are you reporting this post?
            <input
              required
              minLength={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button className="btn btn-outline btn-sm" disabled={busy}>
            Submit report
          </button>
        </form>
      )}
      {p.comments.map((c: Data) => (
        <div className="comment" key={c.id}>
          <Avatar name={c.author.name} />
          <div>
            <strong>{c.author.name}</strong>
            <p>{c.content}</p>
          </div>
        </div>
      ))}
      <form
        className="comment-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await act(
            "comment",
            { id: p.id, content: comment },
            "Comment added.",
          );
          if (r) setComment("");
        }}
      >
        <Avatar name={user.name} />
        <input
          aria-label="Add a comment"
          placeholder="Add to the conversation…"
          required
          maxLength={1500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="icon-button"
          aria-label="Send comment"
          disabled={busy || !comment.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </article>
  );
}
function Messages({
  conversations,
  user,
  act,
  revision,
}: {
  conversations: Data[];
  user: Viewer;
  act: any;
  revision: number;
}) {
  const query = useSearchParams(),
    [selected, setSelected] = useState(query.get("conversation") || ""),
    [messages, setMessages] = useState<Data[]>([]),
    [text, setText] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (!selected) return;
    let live = true;
    const load = () =>
      request(`messages?id=${selected}`)
        .then((d) => {
          if (live) {
            setMessages(d.reverse());
            setError("");
          }
        })
        .catch((e) => {
          if (live) setError(e.message);
        });
    load();
    const timer = setInterval(load, 5000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [selected, revision]);
  const conversation = conversations.find((c) => c.id === selected),
    other = conversation
      ? conversation.aId === user.id
        ? conversation.b
        : conversation.a
      : null;
  return (
    <div className="messages-shell">
      <aside className="conversation-list">
        <h3>Conversations</h3>
        <Link className="text-link" href="/app/people">
          <Plus size={15} />
          Start a conversation
        </Link>
        {conversations.map((c) => {
          const person = c.aId === user.id ? c.b : c.a;
          return (
            <button
              className={selected === c.id ? "selected" : ""}
              onClick={() => setSelected(c.id)}
              key={c.id}
            >
              <Avatar name={person.name} />
              <div>
                <strong>{person.name}</strong>
                <p>{c.messages[0]?.content || "Say hello."}</p>
              </div>
              {c._count.messages > 0 && (
                <span className="count-badge">{c._count.messages}</span>
              )}
            </button>
          );
        })}
      </aside>
      <section className="message-pane">
        {!selected ? (
          <Empty
            title="Say hello to a new possibility."
            text="Choose a conversation or discover people to connect with."
          />
        ) : (
          <>
            <div className="message-pane-header">
              <Avatar name={other?.name || "Campus member"} />
              <div>
                <strong>{other?.name || "Conversation"}</strong>
                <small>Private conversation · Updates every 5 seconds</small>
              </div>
            </div>
            {error && <div className="alert error">{error}</div>}
            <div className="message-history" aria-live="polite">
              {messages.map((m) => (
                <div
                  className={`message-bubble ${m.senderId === user.id ? "mine" : ""}`}
                  key={m.id}
                >
                  <p>{m.content}</p>
                  <small>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              ))}
              {!messages.length && !error && (
                <p className="muted">
                  A simple hello is a good place to start.
                </p>
              )}
              <p className="field-hint">Showing the latest 100 messages.</p>
            </div>
            <form
              className="message-input"
              onSubmit={async (e) => {
                e.preventDefault();
                const r = await act(
                  "message",
                  { id: selected, content: text },
                  "Message sent.",
                );
                if (r) setText("");
              }}
            >
              <input
                aria-label="Message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                maxLength={4000}
                placeholder="Write a thoughtful hello…"
              />
              <button
                className="btn btn-primary"
                disabled={!text.trim()}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
