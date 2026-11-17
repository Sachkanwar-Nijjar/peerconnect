# Campus life release — 16 November 2026

PeerConnect is an all-in-one Thapar campus app: news, society life, conversations, private messages, collaboration, courses and guidance. The homepage gives campus community and messages early navigation positions, features Saturnalia prominently, and gives conversations/messages/projects/courses four equally visible shortcuts directly below the spotlight on desktop and mobile.

## Added
- Saturnalia spotlight and the 64 public schedule records observed on the organizer's rendered website on 15 November 2026: Day 0 (20 Nov, 5 listings), Day 1 (21 Nov, 23), Day 2 (22 Nov, 25), Day 3 (23 Nov, 11). Main festival dates from its FAQ are 21–23 November 2026. No artist lineup, fee, duration or registration promise was invented.
- Day/category/search filters, expandable full schedule, local-device saved plans, and ICS calendar downloads in IST. Downloads contain a start time and do not invent an end time. Calendar files do not automatically track organizer changes.
- Organizer links for Saturnalia, Virsa, CCS, MARS, ACM, Team Fateh and VentureLab, with a society directory and organizer filter for campus updates.
- Checked summaries: the library's 18 November 2026 author workshop (3–5 pm, LT 201), HackTU 8.0 (6–7 February, page carries 2027 edition branding), startup opportunities, and clearly identified society spotlights.
- Campus toolkit: Nava Nalanda Library, catalogue, past papers, TSLAS, CSED (including COE/CSE programmes), ECED, EIED and official society directory. Some library resources need the campus network.
- Existing student posts/news and the community composer remain separate from organizer summaries. Existing messages, projects, research, teams and notifications remain available. The learning upgrade remains included.
- Responsive charcoal/warm-gold festival presentation with selective blue/green/coral accents, reduced-motion support and a light-theme alternative. The campus photo is an existing credited Thapar night photo, not claimed to be a current Saturnalia performance photograph.

## Automatic updates: exact behavior and limits
`lib/campus-feed.ts` checks three fixed public sources when the authenticated campus-feed API is requested, with a 15-minute per-process cache. It imports explicit public schema.org Event records embedded in HTML when available. No hidden endpoints are guessed. Requests have an 8-second timeout, 2 MB body limit and reject redirects. Text is rendered as text; upstream scripts/HTML are never executed.

These sites may render their schedules entirely with JavaScript and offer no supported structured feed. In that case, checked fallback schedule facts remain visible. Source status explicitly distinguishes a page check from a successful schedule import. This is NOT a complete live Saturnalia/society integration or a background news service. Society news summaries are checked snapshots, not automatically synchronized articles. A formal organizer feed/API or a reviewed ingestion adapter is still required for reliable ongoing full synchronization. The homepage and final documentation disclose this limitation.

Saved events use browser storage per account/device; they do not sync across devices. Exported calendars are one-time files. Registration links open the organizer schedule; PeerConnect does not register students or collect payments. New organizer feeds should have identity and date/time checks before enabling them.

## Primary sources
- https://www.saturnalia.in/ (FAQ: main dates) and https://www.saturnalia.in/events (four rendered day tabs)
- https://studentsocieties.thapar.edu/
- https://www.ssavirsa.in/ and https://sites.google.com/thapar.edu/virsa/events
- https://hacktu.ccstiet.com/ and its linked CCS main site https://www.ccstiet.com/
- https://acmthapar.in/
- https://in.linkedin.com/company/mars-tiet (links marstiet.com)
- https://teamfateh.com/
- https://venturelab.org.in/
- https://cl.thapar.edu/ and https://cl.thapar.edu/downloads/ImportantLinks-NNCL.pdf
- https://tslas.thapar.edu/ and https://csed.thapar.edu/

## Validation
19 unit tests (including 7 new campus tests) and 16 separate-database guidance integration checks pass. New campus tests cover four-day counts and uniqueness, IST-to-UTC calendar time, calendar injection escaping, malformed/unstructured source fallback, public structured Event parsing and ambiguous timezone rejection. Typecheck, ESLint and production build are required release checks.

Browser review covered the desktop home, day/category filtering, bookmarks/saved view, a successful SatHack .ics download, 390-pixel mobile layout without horizontal overflow, and corrected light-theme toolkit contrast. Full historical 26-scenario browser suite was not rerun for this release. Production hosting, live SMTP, comprehensive security/load testing and deferred features in UPGRADE_2026_11_15.md are not claimed complete.

## Important files
- components/campus-life.tsx: homepage campus experience
- lib/campus-catalog.ts: checked schedule facts, sources, societies/resources
- lib/campus-feed.ts: bounded source checks and structured-event imports
- lib/calendar.ts: ICS export
- app/campus-life.css: visual system and responsive layout
- components/learning-hub.tsx, lib/learning.ts: courses/guidance workflows
- prisma/migrations/202611150001_learning: additive learning schema migration

## Opening and further work
Use PeerConnect-Complete/OPEN-WEBSITE.cmd in File Explorer. It starts its private local database, deploys migrations, seeds the course starter catalog without resetting saved preferences, and opens Chrome on an available port. Keep the launcher window open. This folder includes bundled Windows Node/dependencies and a content snapshot; no separate software installation is required on Windows x64.

The source workspace is outputs/PeerConnect; the ready-to-run distribution is outputs/PeerConnect-Complete. Existing Desktop copies and older ZIPs do not synchronize. Public deployment still needs an appropriate host, managed PostgreSQL, verified sender/SMTP, HTTPS and production operations. See the Dockerfile, .env.production.example and learning upgrade report.
