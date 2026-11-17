# PeerConnect — teacher demonstration and source guide

Prepared 13 November 2026. This folder is a complete Windows x64 presentation copy of the current project, with source, installed dependencies, a verified production build, original requirements, local data snapshot and an automatic launcher. The full source remains readable/editable; it is not just screenshots or a static mockup.

## What we built

**PeerConnect: Skill-Based Student Collaboration & Campus Community Platform**, an academic UCS503 project for the Thapar community. It connects skill discovery to project/research applications, teams and communication. It uses a real PostgreSQL database and server-side authorization. Demo people/events are fictional and labeled. Campus archive photography is licensed and credited, not evidence of current university events.

Development was assisted by ChatGPT/Codex for implementation, review, debugging, documentation and tests. Explain the actual code and decisions honestly; do not claim all code was independently handwritten or that third-party libraries were written by the team. Framework/library code is in node_modules; project-specific code is in app, components, lib, prisma and scripts. No AI model is called to calculate matching scores.

## Where everything is

| Folder/file | Purpose | What to show |
| --- | --- | --- |
| app/page.tsx | Public homepage | Landing page composition |
| app/layout.tsx | Root layout, font and stylesheet imports | App structure |
| app/globals.css and app/midnight.css | Shared styling and latest Obsidian black palette | Responsive layouts and theme tokens |
| components/workspace.tsx | Main authenticated frontend | Campus Home, project/profile/matching/community/message/admin screens and interactions |
| components/auth-form.tsx | Login, registration and verification interface | Form state and server requests |
| components/brand.tsx and components/ui/ | Local wordmark/shared controls | UI reuse |
| app/api/auth/[action]/route.ts | Authentication HTTP endpoints | Register, verify, login, logout |
| app/api/data/[resource]/route.ts | Authenticated data/mutation HTTP boundary | Current-user checks, origin checks, error mapping |
| app/api/health/route.ts | Database-aware readiness | Launcher checks the actual app |
| lib/auth.ts | Sessions and cookie security | Opaque tokens, hashed session IDs, expiry |
| lib/service.ts | Backend application rules, queries and transactions | Permissions, applications, team capacity, messages, moderation |
| lib/matching.ts | Pure deterministic matching | Exact formula and normalization |
| lib/validation.ts | Server-side input schemas | Zod validation |
| lib/request-body.ts and lib/api-response.ts | Bounded input and readable request failures | Robust failure handling |
| lib/db.ts | Shared Prisma client | Database access |
| prisma/schema.prisma | Database models, relations and constraints | ER structure and unique keys |
| prisma/migrations/ | Versioned SQL schema | Reproducible schema creation |
| prisma/seed.ts | Fictional initial records and matching fixtures | Known demo cases |
| tests/ | Unit tests | Matching/validation and request safety |
| e2e/ | Browser/API acceptance and visual tests | Permissions, persistence, concurrency, responsive/accessibility checks |
| docs/ | Architecture, database design, requirement traceability, demo script, test reports and screenshots | Evidence and explanations |
| handoff/originals/ | Original SRS PDF, test-template Word file, user requests and visual references | Requirements supplied before implementation |
| handoff/database/ | Portable JSON content backup | Data transfer without copying a live PostgreSQL directory |
| public/images/ | Thapar archive images and CREDITS.txt | Attribution and license |
| scripts/easy-open.mjs | Automatic launcher for this folder | Private database, first restore, ports, Chrome opening |
| scripts/portable-data.mjs | Logical export/empty-database restore | Backup/recovery |
| package.json/package-lock.json | Dependency declarations and locked versions | Stack and repeatable setup |
| runtime/ | Bundled Node.exe and license notices | No separate Node installation needed |
| node_modules/ | Installed third-party libraries, engines and their license files | Runtime/build dependencies, not original team code |
| .next-production/ | Verified optimized build | Generated output; source is elsewhere |

## Stack and architecture

Next.js 16.4.6 App Router, React 19.2, TypeScript, Tailwind 4, Lucide and locally bundled Inter form the interface. React Hook Form and Zod support forms/validation. Prisma 6.19 maps server operations to PostgreSQL 18.6. Bcrypt hashes passwords; Node crypto creates session secrets; Nodemailer supports separately configured real mail. The installed Node version is recorded in PACKAGE-INVENTORY.json.

This is a **modular monolith**: browser -> Next.js route handler -> authenticated/validated service -> Prisma -> PostgreSQL. Frontend and backend intentionally live in the same repository. Private data is persisted in PostgreSQL, not browser storage. Browser local storage is used for appearance preference.

The portable launcher runs a separate local PostgreSQL cluster in this folder's .local-db, not the original project's database. On first opening it applies migrations and restores the included content only if the application database is empty. It checks the PostgreSQL data directory before using it. Later openings retain saved data. Ports are chosen automatically; WEBSITE-LINK.txt records the current website address.

## Core features to demonstrate

Verified university registration/login; student/faculty/moderator/admin roles; faculty approval; profiles and skill discovery; project/research creation/editing; exact matching; applications and creator review; capacity-safe teams; text posts/likes/comments/reports; linked highlighted announcements; private messages and unread state; notifications; moderation/admin controls; responsive dark/light UI.

1. Open OPEN-WEBSITE.cmd and sign in as student.a@thapar.edu.
2. Show Campus Home news, categories, projects, people and profile.
3. Log out; sign in as faculty@thapar.edu.
4. Open Manage Projects -> Smart Attendance System -> Find Teammates. Explain 100%, 75% and 50% fixtures.
5. Demonstrate a student's application and creator review using two separate browser sessions if needed. Capacity includes the creator.
6. Show community discussion, a faculty-linked announcement and private messages.
7. Optionally sign in as moderator@thapar.edu or admin@thapar.edu and show the role-specific controls.
8. Open the source files above, schema and docs/REQUIREMENTS_TRACEABILITY.md; then show the actual test reports. All seeded account passwords are CampusDemo!2026.

## Explain the matching algorithm

Score = matching unique required skills / all unique required skills x 100. Labels are trimmed, lowercased and deduplicated; Machine Learning aliases to ML. Interests, availability and experience do not change this percentage. The attendance fixture requires Python, ML, React and SQL: A has 4/4=100%, B 3/4=75%, C 2/4=50%. Zero-score candidates are excluded; matching does not write records. Recommendation tie-breaking is explained separately from the percentage.

## Explain team safety and security

The creator counts toward team capacity. Application acceptance locks the project row in a transaction, checks ownership/status/capacity, creates membership and changes status/notification atomically. Unique constraints prevent duplicate applications/memberships. This avoids overfilling a team when requests arrive together.

Passwords use bcrypt cost 12. Random session secrets live in HttpOnly/SameSite cookies; only SHA256 digests are stored server-side. Enabled/verified state and role are checked server-side. Private messages are participant-only; creator review and faculty research permissions are checked in the backend. Inputs are validated and bounded. Rendering uses React escaping and Prisma queries.

## What was verified

The latest full functional audit passed 26 browser/API scenarios and 12 unit tests, plus typecheck, lint and production build. It used an isolated QA database. The later appearance-only update passed a production build and five visual scenarios; the separate development server stalled at login hydration for the light-theme check, which then passed on the actual running app. These are recorded results, not a claim that every visual check passed in one run. See docs/LATEST_STATUS.md, docs/CURRENT_TEST_RESULTS.json and docs/OBSIDIAN_THEME_REPORT.md. Original application content was checked unchanged across 17 exported tables during the audit. Fresh portable first-start verification is recorded in PORTABLE-VERIFICATION.txt.

## Academic demo versus real production

This is a local academic implementation. Real SMTP delivery, password recovery, independent faculty identity verification, shared rate limiting, public hosting and production-scale load testing require further work. The local registration screen supplies a simulated verification link; it does not actually email Thapar. Image/avatar uploads, video, followers, payments and task boards are deliberately excluded. Messaging polls every five seconds. No paid service, hosted domain or external AI key is needed to demonstrate this bundle.

## Keeping and editing the project

Keep the whole folder for an easy demo. Move/copy it only after stopping the website. To transfer new work, close the app first and copy the folder. For a source-only transfer, the earlier PeerConnect-Codex-Handoff ZIP is smaller but requires dependencies to be installed. For future Codex work, select this folder and read 01-MASTER-PROMPT.md and current status reports. If code changes, rerun the documented tests/build rather than treating the included generated build as newly verified.
