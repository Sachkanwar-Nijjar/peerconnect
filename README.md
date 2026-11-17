> GitHub/team source checkout: see [GITHUB-TEAM-GUIDE.md](GITHUB-TEAM-GUIDE.md). The one-click Windows launcher below requires the portable runtime/dependencies, which are excluded from GitHub. Use the guide’s source setup after cloning.

# Easy Windows opening

Double-click **OPEN-WEBSITE.cmd** in File Explorer. The bundled Windows x64 runtime and installed dependencies handle first setup and open Chrome. Keep the black window open. Read START-HERE.txt and TEACHER-GUIDE.md. This demonstration copy uses its own database and may choose a different local port. No external installation is needed for this prepared Windows bundle.

The developer instructions below describe the original source setup; they are not required for the easy launcher.

> Latest audit and fixes: [docs/LATEST_STATUS.md](docs/LATEST_STATUS.md). Local preview: http://127.0.0.1:3000/login.

# PeerConnect

**Skill-Based Student Collaboration & Campus Community Platform**  
Connect. Collaborate. Create.

A local full-stack UCS503 academic project for the Thapar community. Students and faculty discover projects, form skill-based teams, communicate privately and share campus opportunities. The original SRS and ten test cases are preserved in the implementation traceability documents.

## Requirements

Node.js 20.9 or newer (Node 22/24 recommended), npm, and PostgreSQL. A local PostgreSQL helper is included; no hosted or paid account is required. The application has not been publicly deployed.

## Run locally

From this project directory:

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:local
```

Keep the database terminal open. In a second terminal:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://127.0.0.1:3000. The database helper uses PostgreSQL on port 54329, stores its files in .local-db, and creates the peerconnect database. If using an existing PostgreSQL server, set DATABASE_URL and skip db:local. Do not run two database helpers for the same data directory. The embedded database helper is intended only for local development; use a managed, independently backed-up PostgreSQL instance for real deployment.

For the optimized local demonstration, run `npm run build` and then `npm start` instead of `npm run dev`. The build runner includes a Windows-only workaround for transient output-directory locks; other systems use ordinary filesystem behavior. Keep `APP_URL` aligned with the address you open in the browser.

## Demo credentials

All sample people and announcements are fictional. The example password is **CampusDemo!2026**, configured through DEMO_PASSWORD and used only by the local seed.

| Account                              | Email                                       |
| ------------------------------------ | ------------------------------------------- |
| Student A (all four matching skills) | student.a@thapar.edu                        |
| Student B (75% fixture)              | student.b@thapar.edu                        |
| Student C (50% fixture)              | student.c@thapar.edu                        |
| Additional students                  | student.x@thapar.edu / student.y@thapar.edu |
| Faculty / Mentor                     | faculty@thapar.edu                          |
| Moderator                            | moderator@thapar.edu                        |
| Admin                                | admin@thapar.edu                            |

New registrations require a thapar.edu email by default. Domains are configurable with UNIVERSITY_DOMAINS. Local development shows a simulated verification message with a link; click it, then log in. Faculty requests stay unprivileged until an administrator approves the role. Production requires SMTP_URL and EMAIL_FROM, DEV_EMAIL_VERIFICATION=false, an HTTPS APP_URL and SESSION_SECURE=true. Production never returns development verification links.

## Implemented workflow

Role-aware dashboards, profiles and editing, project/research creation/editing, search and categories, people discovery, transparent recommendations, exact skill matching, applications and creator review, transaction-safe teams, text community posts/likes/comments/reports, linked faculty announcements, private messaging with polling, persistent notifications, moderation, user roles/account disabling, responsive layouts and saved theme preference.

**Score = matching required skills / all unique required skills × 100.** Case and whitespace are normalized; Machine Learning and ML share one key. Availability, experience and interests do not alter this score. Project recommendations sort by skill overlap followed by shared interests, and display these reasons separately. The creator counts toward capacity.

The Smart Attendance System fixture uses Python, ML, React and SQL. Candidate A/B/C produce 100/75/50%. Systems Lab Explorer requires Rust/Kotlin and has no seeded matching student.

## Quality checks

With database, seed and development app running:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite includes exact TC-01–TC-10 outcomes and additional authorization, persistence, concurrency and responsive checks. It uses the development verification mechanism and is intended to run against the local demo database. It creates test.student@thapar.edu and test fixtures, and resets that test account at the start. Do not run against real user data. Actual execution results and limitations: docs/TEST_REPORT.md.

## Documentation

- docs/ARCHITECTURE.md: system boundaries, authorization and transactions.
- docs/DATABASE_DESIGN.md: revised ER diagram and constraints.
- docs/REQUIREMENTS_TRACEABILITY.md: all original FRs, business rules, stories and extensions.
- docs/SCOPE_EXTENSIONS.md: decisions, conflicts and omitted optional scope.
- docs/DEMO_SCRIPT.md: timed 6–8 minute presentation and viva notes.

## Limits

Text posts and initials avatars; image uploads are deliberately disabled and rejected. No video or social-media follower system. The message UI shows the latest 100 messages, with older history available through API pages. Classroom-scale search and recommendation queries are bounded; no production-scale benchmark is claimed. Authentication throttling is process-local. SMTP delivery requires separate configuration and is not proven by the development mailbox. Production operations, password recovery, external faculty identity checking and multi-instance hardening are outside this local submission.

## Framework references

Implementation setup was checked against the official [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation) and [Prisma 6 PostgreSQL connector documentation](https://www.prisma.io/docs/orm/v6/overview/databases/postgresql). Dependencies are locked in package-lock.json after installation.

## Visual refinement

Campus Home uses a graphite dark theme with restrained category accents and prominent campus news cards. See [design notes](docs/VISUAL_REDESIGN.md) and [verification](docs/REDESIGN_TEST_REPORT.md). Open http://127.0.0.1:3000/app while the local launcher is running.

