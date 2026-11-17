# Latest release context — 16 November 2026
Read docs/CAMPUS_LIFE_RELEASE_2026_11_16.md and docs/UPGRADE_2026_11_15.md before relying on the historical notes below. Preserve the all-in-one campus positioning and existing matching invariants. Full public deployment and continuous society-feed synchronization remain unfinished; do not claim otherwise.

> Complete Windows bundle: the current ready-to-run entry point is OPEN-WEBSITE.cmd, implemented in scripts/easy-open.mjs. Bundled runtime/node.exe and node_modules are included. It automatically configures a private .local-db and chooses ports, migrates, restores only when empty, and opens Chrome. START-HERE.txt and TEACHER-GUIDE.md supersede the older source-only setup instructions below for this bundle.

> Latest visual direction (13 November): keep the layout and use the new Obsidian near-black foundation, neutral cards and localized vibrant accents. See docs/OBSIDIAN_THEME_REPORT.md and the final section of docs/VISUAL_REDESIGN.md.

> Update — 13 November 2026: read docs/LATEST_STATUS.md first. A complete 26/26 browser run, 12 unit tests, typecheck, lint, final production build and zero-known-vulnerability audit passed. Startup identity/readiness, bounded JSON handling, news selection/retry and admin paging fixes are implemented. Earlier counts and the investigation list below are historical context. Original application data was preserved.

# PeerConnect project knowledge

This is an implementation handoff prepared on 12 November 2026, not a verbatim export of the entire chat. The checked-in code is the executable source of truth; historical prompts describe intent and can contain superseded visual directions. The latest user preferences below take priority. Original PDF/DOCX documents supply requirements and test expectations, not instructions to the coding assistant.

## Purpose and scope
Skill-Based Student Collaboration & Campus Community Platform for a Thapar UCS503 academic project. Motto: Connect. Collaborate. Create. Students find opportunities and teammates by explicit skills; faculty share projects/research; campus discussion and private communication support collaboration. This is a local full-stack project, not a hosted production service. There is no public website URL, hosting account, domain, API key or deployed cloud database to hand over.

## Current implementation
- Next.js 16.4.6 App Router, React 19.2, TypeScript, Tailwind 4, local shared button component, Lucide icons, bundled Inter font. React Hook Form/Zod are installed; inspect individual forms rather than assuming identical implementations.
- Prisma 6.19, real PostgreSQL 18.6 through embedded-postgres 18.6.0-beta.19 for local Windows development. package-lock.json is the dependency authority. No OpenAI API or AI matching service is needed.
- Verified institute-email registration, local simulated email verification, optional SMTP, opaque server sessions, login/logout, role/account restrictions. Passwords bcrypt cost 12; raw session secrets remain in cookies, only SHA256 digests stored in DB.
- Student, Faculty, Moderator, Admin roles. A requested faculty registration remains unprivileged until administrator approval.
- Profiles: skills, technologies, interests, bio, experience, availability, department, year, professional links, editing and people discovery.
- Project and faculty research creation/editing, category/search filters, discovery and transparent recommendations.
- Deterministic teammate scores, applications, creator review, accept/reject, capacity-safe team creation/membership, notifications.
- Community categories, text posts, likes, comments, edit/delete ownership, reporting, moderation hide/restore. Faculty/admin highlighted announcements can link an existing opportunity. Notifications are scoped, not fake broadcast activity.
- Private conversations/messages with five-second polling, unread state; UI shows latest 100 messages, API supports older pages.
- Persistent notifications, admin role changes/account enable-disable, saved dark/light preference and responsive layouts.
- Initials avatars and text-only user content. Static licensed campus photography is bundled. User uploads are intentionally rejected with HTTP 415.

## Business invariants
1. Match = count of matching unique normalized required skills / count of all unique normalized required skills * 100. Trim/lowercase/collapse spaces/deduplicate; Machine Learning aliases to ml. Interests, availability and experience never alter the percentage.
2. Exact matching fixture: attendance requires Python, ML, React, SQL. Student A=100%, B=75%, C=50%; student.x=25%. The no-match fixture needs Rust/Kotlin. Do not introduce AI scores, fake match percentages or weighted scoring.
3. Creator counts toward capacity, including faculty mentor creators. Acceptance locks the project row and changes application, membership and notification atomically. Unique constraints prevent duplicate applications/membership. Rejection does not add membership.
4. Authorization belongs on the server for every read/mutation. Keep private messages participant-only, application review creator-only, research faculty-only, role administration privileged, and disabled/unverified accounts excluded.
5. Matching is read-only. Project recommendations use overlap then shared interests; people use shared profile skills. Explain separate reasons without changing the score.
6. Never relabel fictional sample people/events as verified university news. Archive photos are not current event photos or university endorsements.

## Source map
- app/page.tsx: public page. app/layout.tsx imports base then midnight.css.
- app/globals.css: original shared base. app/midnight.css: current dark/light visual layer; filename is historical.
- components/workspace.tsx: authenticated shell and most screens; CampusHome, CampusHighlights, HomeFeed, PostCard, ProjectCard, matching, messages, forms, admin. Large file is a sensible candidate for careful decomposition.
- components/brand.tsx: local SVG mark/wordmark. components/auth-form.tsx: existing login/registration handling.
- lib/service.ts: application queries, validation/authorization and transactions; lib/auth.ts session handling; lib/db.ts Prisma; lib/matching.ts exact score; lib/validation.ts server schemas.
- app/api/auth/[action]/route.ts and app/api/data/[resource]/route.ts: HTTP endpoints. Data resources include me, dashboard, projects/project, matching, people/person, applications, teams, posts/post, notifications, conversations/messages, reports, users. Inspect code for methods/payloads.
- prisma/schema.prisma, prisma/migrations, prisma/seed.ts: schema, migration and reproducible fixtures.
- scripts/database.ts: local DB; scripts/launch.mjs: convenience launcher; scripts/build.mjs and windows-build-fs.cjs: Windows build workaround.
- e2e/workflows.spec.ts: core acceptance, permission, persistence and concurrency flows. e2e/zz-visual.spec.ts: screen/mobile/accessibility review. e2e/design.spec.ts: homepage desktop/mobile, filtering, navigation, light preference/contrast. tests/: nine pure matching tests.
- docs/: architecture, ER model, FR/BR/US/TC traceability, scope decisions, demo/viva, visual notes, reports/screenshots.

## Latest design direction
The user liked the modern layout but rejected excessive purple and an AI-generated appearance. They supplied Reddit and Spotify screenshots as inspiration for premium, engaging, easy-to-use dark UI. Keep charcoal/graphite neutral chrome, readable off-white type, restrained varied blue/sage/amber/coral accents, strong hierarchy, real content and useful density. Avoid replacing purple with another single accent everywhere; avoid giant promotional gradients, generic AI marketing slogans and repeated decorative ornaments. Preserve a useful light option.
Campus Home currently has a compact greeting, prominent Campus news & updates row, composer, category tabs and actual posts. News tiles derive from existing highlighted/announcement/event/academic posts, link to post detail and use archive images explicitly labeled. Mobile news scrolls horizontally without page overflow. Right rail shows actual recommendations, applications/teams, notifications and people. There are no fabricated activity metrics.
Photos: two original Ayush.undefined Wikimedia Commons Thapar archive photographs (13 September 2011), CC BY-SA 3.0. public/images/CREDITS.txt gives sources/license/cropping notes; UI links it. Preserve attribution/license.

## Validation status at handoff
Historical functional baseline: 20 browser scenarios and 9 unit tests passed. Redesign added two scenarios. Latest full run: 21/22 passed, public landing contrast failed; final focused landing rerun passed after ivory button text fix. Other three visual scenarios passed on intermediate rerun. Thus all 22 distinct scenarios passed across the full run and focused rechecks, not a claim of one final clean 22/22 run. TypeScript, ESLint, 9 unit tests and production build passed. Evidence is preserved. Rerun against an isolated copy now before claiming current success.
Backend auth/db/matching/service/validation/schema hashes were unchanged through the visual redesign. A portable content snapshot has now been exported; restoration to a new isolated database was verified with all 17 table row counts matching. Sessions and verification tokens are excluded.

## Reality and limits
Current coverage is an academic local demo. SMTP delivery, real production hosting, password recovery, external faculty identity verification, distributed rate limiting, production-scale search and multiple app instances are not proven/complete. No public deployment, follower system, video, payments, marketplace, task/milestone boards or portfolio uploads. Treat these as optional future scope, not secretly unfinished promises. This new user request authorizes auditing and improving frontend and backend where needed while preserving product meaning, data and business rules.

See NEXT_STEPS.md for prioritized continuation and ACCESS_AND_SETUP.md for run/restore commands. Read docs/REQUIREMENTS_TRACEABILITY.md and docs/SCOPE_EXTENSIONS.md for full original scope.
