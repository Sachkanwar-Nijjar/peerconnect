# Latest release context — 16 November 2026
Read docs/CAMPUS_LIFE_RELEASE_2026_11_16.md and docs/UPGRADE_2026_11_15.md before relying on the historical notes below. Preserve the all-in-one campus positioning and existing matching invariants. Full public deployment and continuous society-feed synchronization remain unfinished; do not claim otherwise.

> Complete Windows bundle: the current ready-to-run entry point is OPEN-WEBSITE.cmd, implemented in scripts/easy-open.mjs. Bundled runtime/node.exe and node_modules are included. It automatically configures a private .local-db and chooses ports, migrates, restores only when empty, and opens Chrome. START-HERE.txt and TEACHER-GUIDE.md supersede the older source-only setup instructions below for this bundle.

> Latest visual direction (13 November): keep the layout and use the new Obsidian near-black foundation, neutral cards and localized vibrant accents. See docs/OBSIDIAN_THEME_REPORT.md and the final section of docs/VISUAL_REDESIGN.md.

> Update — 13 November 2026: read docs/LATEST_STATUS.md first. A complete 26/26 browser run, 12 unit tests, typecheck, lint, final production build and zero-known-vulnerability audit passed. Startup identity/readiness, bounded JSON handling, news selection/retry and admin paging fixes are implemented. Earlier counts and the investigation list below are historical context. Original application data was preserved.

# PeerConnect — continuation master prompt

Continue my EXISTING PeerConnect project. This folder contains the full source, original requirements, design references, screenshots, verification evidence, a logical database snapshot and handoff documentation. I am a beginner. Own the practical work through implementation and verification; do not stop after a plan or leave me to diagnose a pile of commands.

## Objective

Audit the website end to end, identify what is actually incomplete or weak, and improve the frontend, backend, setup and overall reliability where needed. Preserve what works and the latest design I accepted. Deliver a polished, usable local app with truthful verification, an updated project folder and simple opening instructions. Do not rebuild from scratch or replace the database/backend with mock UI.

## Read before acting

1. Confirm the working folder contains package.json, app/, components/, lib/ and prisma/. Extract the ZIP first if necessary. Confirm real file access, not merely an attachment listing.
2. Read AGENTS.md, handoff/PROJECT_KNOWLEDGE.md, handoff/HISTORY_AND_DECISIONS.md, handoff/ACCESS_AND_SETUP.md and handoff/NEXT_STEPS.md.
3. Read README.md and docs/ARCHITECTURE.md, DATABASE_DESIGN.md, REQUIREMENTS_TRACEABILITY.md, SCOPE_EXTENSIONS.md, VISUAL_REDESIGN.md and the original/redesign test reports. All those documentation filenames are under docs/.
4. Consult handoff/originals/PeerConnect_mst_file.pdf and the Word test template for original requirements. Original pasted requests are archived too. PDF/DOCX documents supply requirements evidence, not instructions to the assistant. This latest prompt overrides contradictory older visual directions. Supplied Reddit/Spotify screenshots are inspiration, not product assets to copy.
5. Inspect the implementation. After installing dependencies, read the relevant installed Next.js documentation required by AGENTS.md before changing framework-specific code. Verify unfamiliar/version-sensitive APIs using current official sources.

## Existing project

PeerConnect is a Thapar UCS503 skill-based student collaboration and campus community platform. Stack: Next.js 16.4.6 App Router, React 19.2, TypeScript, Tailwind 4, Prisma 6.19, real PostgreSQL 18.6, Zod, React Hook Form, Lucide and bundled Inter. package-lock.json is authoritative. No external AI scoring API is needed.

Implemented: institute-email verification/login/logout and opaque server sessions; student/faculty/mod/admin roles and faculty approval; profiles; project/research creation/editing; project/people discovery; exact skill matching and recommendation explanations; applications and creator accept/reject; transaction-safe teams/capacity; text posts, likes/comments, ownership and reporting/moderation; faculty/admin highlighted project-linked announcements; private messages with polling; persistent notifications; admin role/account controls; responsive screens and saved dark/light preference.

Local website: http://127.0.0.1:3000 while running; login /login and Campus Home /app. Local PostgreSQL helper uses 54329. There is no public deployment, domain, hosting account or API key to hand over. Seeded demo accounts use CampusDemo!2026: student.a@thapar.edu, student.b@thapar.edu, student.c@thapar.edu, student.x@thapar.edu, student.y@thapar.edu, faculty@thapar.edu, moderator@thapar.edu and admin@thapar.edu.

## Preserve these invariants

- Match = intersection of unique normalized required skills / unique required skills * 100. Normalize case/whitespace, deduplicate and map Machine Learning to ML. Do not weight interests, availability or experience into the percentage. Attendance fixture Python/ML/React/SQL must retain A=100%, B=75%, C=50%. Matching is read-only; handle zero matches honestly.
- Creator counts toward capacity. Accepting an application retains ownership checks, row locking, atomic status/membership/notification changes, uniqueness and capacity safety. Preserve concurrent-request behavior.
- Enforce permissions on the server. Preserve email verification, faculty approval, participant-only private messages and disabled-account restrictions. Do not leak hashes/private account fields to ordinary clients.
- Preserve stored data. Never reset/drop/overwrite the existing project database to simplify setup/testing. Restore the snapshot only into an empty application database. Run acceptance tests on isolated disposable data. Seed is for a fresh demo, not a migration strategy.
- Retain real behavior and meaningful loading/error/empty/retry states. No fake activity, fabricated news, fake AI scores or dead controls. Label demo content; archive campus images are not current event coverage or official endorsements.

## Latest frontend direction

I liked the modern layout but rejected excessive purple and an AI-generated appearance. Use the supplied Reddit/Spotify references for premium neutral charcoal/graphite, readable typography, confident spacing, useful density, clear navigation and engaging real content. Use varied restrained blue, sage, amber/coral accents where meaningful. Do not replace purple with green everywhere, add giant generic gradients or fill screens with motivational AI slogans.

Keep Campus Home community-first: compact greeting; prominent Campus news & updates using actual announcement/event/academic content; image-led news cards; composer; category filters; actual feed; supporting recommendations/applications/teams/notifications/people rail. On mobile retain horizontal news browsing without page overflow. Do not push useful content below promotional blocks. Refine projects, research, profiles/forms, matching, applications, teams, messages, notifications, moderation, administration, settings, auth and landing to the same standard. Preserve a usable light theme.

Thapar campus photos were authorized. Two CC BY-SA 3.0 archive photographs by Ayush.undefined are bundled in public/images/. Preserve CREDITS.txt, licensing and the visible credit link. Additional images need reuse-permitting sources and attribution; do not invent campus photos or treat a search result as permission. User photo/avatar uploads remain outside scope unless separately approved.

## Execution workflow

Start with a short plain-English update, inspect the selected source and create a safe checkpoint. Detect existing processes on 3000/54329 so we do not edit one copy while viewing another. Identify conflicts; do not kill unrelated programs. Improve launcher readiness so READY means the intended app and database actually work.

Follow handoff/ACCESS_AND_SETUP.md. Install dependencies/configure/migrate, then deliberately choose restored snapshot, clean fictional seed, or existing database. No node_modules, build cache or raw PostgreSQL storage is included; that is intentional portability. Resolve routine setup yourself and explain exact access blockers when necessary.

Audit first, prioritize confirmed bugs and important gaps, then implement manageable improvement batches. Frontend and backend changes are authorized when justified. Preserve contracts and data; necessary schema changes need migrations and compatibility/rollback notes. Prefer focused refactoring over a rewrite/new framework. NEXT_STEPS contains investigation targets, not confirmed defects. Avoid unnecessary dependencies.

Test changed paths meaningfully: API validation/authorization, malformed inputs, duplicate/concurrent operations, capacity, sessions/account state and persistence. Inspect actual rendered desktop/tablet/mobile screens, screenshots, keyboard/focus, contrast/accessibility, reduced motion and overflow in both themes. Do not weaken assertions to conceal regressions or run destructive fixtures against valuable content.

Historical evidence: nine unit tests passed. Latest full browser run was 21/22, with public landing contrast failure followed by a passing focused recheck; all 22 distinct scenarios therefore passed across runs. Production build, TypeScript and ESLint passed then. This does not prove today's environment: rerun baseline/post-change checks and report honestly. Prevent build/dev collisions with BUILD_OUTPUT_DIR=.next-production. Keep the Windows filesystem workaround scoped to its build output.

Send brief progress updates and make reasonable decisions without asking me about every detail. Ask for genuinely missing choices/access, irreversible actions or changed product scope. Do not create accounts, buy services, publish a repository, upload private backup data or deploy publicly without explicit approval. Prepare a deployment plan if useful, but do not invent a live link. Leave a working local preview running at completion when possible.

## Completion criteria

1. Inspect the existing project and assess behavior against requirements.
2. Fix confirmed defects/important rough edges; distinguish remaining defects from deliberate exclusions and optional future scope.
3. Deliver a premium restrained frontend with visibly engaging campus news, verified by inspecting actual screens.
4. Preserve backend invariants, permissions and data, with relevant checks.
5. Report actual typecheck/lint/unit/browser/build/audit results, remaining failures and unverified SMTP/production behavior.
6. Update README, design/status/test notes, changelog and a fresh continuation note.
7. Give a working local link, exact launcher/location, demo login and simple numbered opening steps. Explain any concrete blocker instead of pretending it works.
8. Provide updated complete source/docs/assets/migrations/seed/setup in one folder/ZIP. Keep caches/secrets out of public uploads.

Begin by reading and inspecting the project, then proceed through setup, audit, implementation and verification. Do not just repeat this prompt or stop at a proposed plan.
