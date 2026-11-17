import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  GraduationCap,
  Layers,
  MessageCircle,
  Search,
  Sparkles,
  Users,
  Network,
} from "lucide-react";
import { Brand } from "@/components/brand";
export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Brand />
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#community">Community</a>
        </div>
        <div className="nav-actions">
          <Link href="/login">Log in</Link>
          <Link className="btn btn-primary" href="/register">
            Join your campus <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="pill">
              <span className="live-dot" /> Built for the Thapar community
            </span>
            <h1>
              Your campus. Your people.
              <br />
              Make it <span>yours.</span>
            </h1>
            <p>
              Campus conversations, society events, projects and courses — all
              in one place. Find what’s happening at Thapar and the people to
              experience it with.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-large" href="/register">
                Get Started <ArrowRight size={18} />
              </Link>
              <a className="btn btn-outline btn-large" href="#features">
                Explore Features
              </a>
            </div>
            <div className="hero-trust">
              <span className="avatar-stack">
                <i>AS</i>
                <i>MK</i>
                <i>RA</i>
                <i>NK</i>
              </span>
              <div>
                <strong>Big ideas start with the right people.</strong>
                <small>Your next collaborator could be right here.</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="preview-top">
              <span>
                <Network size={17} /> YOUR NEXT BIG THING
              </span>
              <span className="window-dots">● ● ●</span>
            </div>
            <div className="preview-content">
              <div className="preview-heading">
                <span className="eyebrow">A CAMPUS FULL OF POSSIBILITIES</span>
                <h2>Good ideas. Great teams.</h2>
                <p>A little curiosity. The perfect skill match.</p>
              </div>
              <div className="preview-project">
                <div className="project-icon">
                  <Code2 />
                </div>
                <div>
                  <span className="eyebrow">FEATURED DEMO PROJECT</span>
                  <h3>Smart Attendance System</h3>
                  <p>Make everyday campus life a little smarter.</p>
                </div>
                <span className="tag">Technology</span>
              </div>
              <div className="chip-row">
                <span className="chip">Python</span>
                <span className="chip">ML</span>
                <span className="chip">React</span>
                <span className="chip">SQL</span>
              </div>
              <div className="match-preview">
                <div className="avatar">A</div>
                <div>
                  <strong>Candidate A</strong>
                  <small>All four required skills</small>
                </div>
                <div className="score">
                  100%<small>skill match</small>
                </div>
              </div>
              <div className="progress">
                <span style={{ width: "100%" }} />
              </div>
              <div className="preview-note">
                <Check size={16} /> Transparent matching. Real possibilities.
              </div>
            </div>
            <div className="floating-note">
              <Sparkles size={20} />
              <div>
                <strong>Your skills belong somewhere.</strong>
                <small>Find the project that needs them.</small>
              </div>
            </div>
          </div>
        </section>
        <section className="landing-campus-notice">
          <div>
            <span>ON THE CAMPUS RADAR · NOVEMBER 2026</span>
            <h2>Saturnalia, without the endless group-chat scrolling.</h2>
            <p>
              Explore the published 20–23 November schedule, save your plans,
              and find society updates in your campus home.
            </p>
          </div>
          <Link className="btn btn-primary" href="/app">
            Explore campus life <ArrowRight size={16} />
          </Link>
        </section>
        <section className="landing-strip">
          <span>ONE CAMPUS. ENDLESS POSSIBILITIES.</span>
          <div>
            <Code2 /> Build projects
          </div>
          <div>
            <GraduationCap /> Explore research
          </div>
          <div>
            <Users /> Find your team
          </div>
          <div>
            <MessageCircle /> Connect with campus
          </div>
        </section>
        <section id="how" className="landing-section">
          <span className="eyebrow">FROM “WHAT IF” TO “WE BUILT IT”</span>
          <h2>Your next chapter starts here.</h2>
          <p>You bring the curiosity. We help you find the connection.</p>
          <div className="feature-grid">
            {[
              {
                n: "01",
                icon: Users,
                title: "Show what makes you, you.",
                text: "Build a profile around your skills, interests, and the things you want to explore.",
              },
              {
                n: "02",
                icon: Search,
                title: "Find your kind of project.",
                text: "Discover student ideas and faculty research opportunities that fit your strengths.",
              },
              {
                n: "03",
                icon: Layers,
                title: "Make it happen, together.",
                text: "Apply, form a team, and start the conversation. Turn a shared interest into something real.",
              },
            ].map((f) => (
              <article className="feature-card" key={f.n}>
                <span className="step-number">{f.n}</span>
                <f.icon size={27} />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="features" className="feature-band">
          <div>
            <span className="eyebrow">LESS GUESSWORK. MORE CONNECTION.</span>
            <h2>
              The right skills.
              <br />
              The right people.
            </h2>
            <p>
              Our matching is simple by design: matching required skills divided
              by total required skills. See exactly where a candidate fits, and
              what skills are still needed.
            </p>
            <Link href="/register" className="text-link">
              Find your next team <ArrowRight size={18} />
            </Link>
          </div>
          <div className="formula-card">
            <span className="eyebrow">A MATCH YOU CAN EXPLAIN</span>
            {[
              ["Candidate A", "Python · ML · React · SQL", 100],
              ["Candidate B", "Python · ML · SQL", 75],
              ["Candidate C", "Python · SQL", 50],
            ].map(([name, skills, score]) => (
              <div className="formula-person" key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{score}%</span>
                </div>
                <small>{skills}</small>
                <div className="progress">
                  <span style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
            <small>
              Illustrative demo fixture. Skill overlap does not measure
              proficiency.
            </small>
          </div>
        </section>
        <section id="community" className="landing-section community-intro">
          <div>
            <span className="eyebrow">MORE THAN A PROJECT BOARD</span>
            <h2>A little closer to your campus.</h2>
            <p>
              Ask a question. Share an idea. Discover an opportunity. A focused
              space for the conversations that help your community grow.
            </p>
            <div className="chip-row">
              {[
                "Academic questions",
                "Project opportunities",
                "Campus updates",
                "Society events",
              ].map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="community-sample">
            <div className="author-line">
              <span className="avatar violet">MK</span>
              <div>
                <strong>Mira Kapoor</strong>
                <small>Fictional faculty · Demo announcement</small>
              </div>
            </div>
            <span className="tag">Research opportunity</span>
            <h3>Curious about responsible AI?</h3>
            <p>
              We’re exploring accessible learning tools and looking for students
              who enjoy Python and machine learning.
            </p>
            <Link className="linked-project" href="/login">
              <GraduationCap size={18} /> Explore research on PeerConnect{" "}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
        <section className="final-cta">
          <span className="eyebrow">YOUR PEOPLE. YOUR POTENTIAL.</span>
          <h2>
            Something great starts
            <br />
            with a connection.
          </h2>
          <Link href="/register" className="btn btn-white btn-large">
            Join PeerConnect <ArrowRight size={18} />
          </Link>
          <p>For students and faculty. Built around collaboration.</p>
        </section>
      </main>
      <footer>
        <Brand />
        <span>Connect. Collaborate. Create.</span>
        <a
          className="landing-photo-credit"
          href="/images/CREDITS.txt"
          target="_blank"
          rel="noreferrer"
        >
          Campus photo credits
        </a>
        <small>
          UCS503 academic project · TIET · No university endorsement implied
        </small>
      </footer>
    </div>
  );
}
