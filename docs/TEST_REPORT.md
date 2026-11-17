# Executed test report

**Date:** 12 November 2026 (Asia/Calcutta). **Application:** PeerConnect. **Environment:** Windows, Node 24.22.1, Next.js 16.4.6, React 19, Prisma 6.19.0, real local PostgreSQL 18.6, Chromium 158 via Playwright, Vitest 5.1.0.

## Final results

| Check                              | Observed result                                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Vitest                             | **9 passed**, 0 failed                                                                                          |
| Playwright workflow/browser suite  | **20 passed**, 0 failed, 0 skipped, 0 flaky; final full run **83.03 seconds**                                   |
| TypeScript                         | Passed with no errors                                                                                           |
| ESLint                             | Passed with no errors or warnings                                                                               |
| Prisma schema and migration status | Valid; initial committed migration applied; schema up to date                                                   |
| Production build                   | Passed compilation, type checking, prerendering, optimization and build traces using the default build script   |
| Production server smoke            | Landing 200; unauthenticated private feed 401; login 200; authenticated dashboard 200 with four recommendations |
| Production verification boundary   | Registration without SMTP returned 503 and did not expose a development verification URL                        |
| Dependency audit                   | 0 known vulnerabilities in final npm audit snapshot                                                             |
| Database restart                   | Before and after: 9 users, 5 projects, 4 posts, 1 message; persistent records retained                          |

The 20 Playwright tests comprise ten original cases, six additional workflow/security checks, and four browser/UI/accessibility scenarios. Original cases use browser forms where relevant and authenticated HTTP requests plus database assertions for detailed state transitions; they are not twenty exclusively click-driven journeys. The later UI scenario separately exercises profile saving and community composing, refresh, liking, commenting and deletion in the rendered application.

## Original cases: actual detailed assertions

| Case  | Executed behavior                                                                                                                                                                                                                                | Result |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| TC-01 | Registration page; exact test.student@thapar.edu; development verification message; unverified login denied; no session/private access; single-use verification activates saved account; dup.student@thapar.edu rejected without a second record | Pass   |
| TC-02 | Correct credentials through login form reach dashboard; logout returns login; wrong password denied and creates no session                                                                                                                       | Pass   |
| TC-03 | New profile; Python/SQL, Django, Machine Learning, one project, 10 hours/week; add React; reject blank skills; stored profile unchanged after invalid update                                                                                     | Pass   |
| TC-04 | Create Smart Attendance System with Python/ML/React/SQL, technologies/interests and size four; listing present; missing skills rejected; database project count unchanged                                                                        | Pass   |
| TC-05 | Faculty creates research with Python/ML; students discover it; blank title rejected with no new project; student creation additionally forbidden                                                                                                 | Pass   |
| TC-06 | A/B/C ranked 100/75/50; matching skills correct; project and profile-skill data unchanged                                                                                                                                                        | Pass   |
| TC-07 | Rust/Kotlin fixture returns empty ranking; no candidate/application record created                                                                                                                                                               | Pass   |
| TC-08 | Browse; Smart search; project details/four skills; xyz123 empty result; project count unchanged                                                                                                                                                  | Pass   |
| TC-09 | Pending application persisted; creator notification stored; duplicate application rejected                                                                                                                                                       | Pass   |
| TC-10 | X/Y pending; accept X adds membership/status/notification; reject Y changes status/notification without membership; outsider cannot review                                                                                                       | Pass   |

Fixtures are checked before cleanup. The UI suite removes only named automated fixtures to restore the fictional presentation dataset. Its initial database cleanup is intended for this disposable local demo, never a real-user database.

## Extensions and negative paths

- Verified post creation, persistence on repeated reads and browser refresh, like/unlike, comment persistence, foreign ownership edit/delete rejection.
- Reporting and moderator hide/restore; hidden posts unavailable in ordinary feed/detail queries.
- Student highlighted announcements forbidden; faculty announcements link to actual research and the browser follows the correct project.
- Unauthenticated private API access denied; unsupported upload rejected with 415.
- Participant-only message read/send; outsider access denied; recipient messages/notifications persist.
- Admin management access denied to students; admin user list works; foreign-origin mutations denied; foreign key rejects an orphan application.
- Two simultaneous accepts compete for one remaining position: exactly one succeeds, the other returns 409; one member exists.
- Rendered student/faculty/admin/moderation screens; profile form save; required-skill filtering; complete post/comment/delete UI interactions.
- Landing and feed at desktop/tablet/mobile widths (1440, 768, 390): no horizontal document overflow.
- Axe WCAG 2 A/AA and WCAG 2.1 A/AA scans of the landing, student dashboard, campus feed and matching page: zero detected violations in the passing suite. This is an automated baseline, not a claim of complete WCAG certification.

## Visual review

Saved screenshots in docs/screenshots cover the landing, student/faculty dashboards, campus feed, discovery, matching, profile, messages, notifications and administration, plus mobile landing/feed. The main nine screens were visually reviewed. Spacing, responsive flow, text contrast, font consistency and real-data labels were checked. Inter is bundled locally; the interface does not depend on an external font request.

## Defects found and corrected

Earlier test attempts failed and are not counted as passes. The first browser launch lacked an accessible browser installation; Chromium was installed into the workspace for the test run. Sign-in initially rejected a valid browser Origin because Next.js's internal URL differed; checking the configured APP_URL fixed this while preserving the hostile-origin test. UI scans exposed faint text and icon naming mismatches; these were corrected and the full suite rerun. Auth submit is disabled until hydration to prevent an early native submission.

Windows build workers intermittently returned EPERM while creating output directories. The build script pre-creates expected outputs, uses one prerender worker and applies a Windows-only retry for mkdir under the selected build-output directory. It preserves unrelated filesystem errors and non-recursive semantics. The final default build and production-server smoke both passed. The database helper skips initialization when PG_VERSION already exists, so restarting does not attempt to recreate the cluster.

Dependency advisories found during installation were addressed with updated Nodemailer/Vitest and compatible overrides for the affected development-tool transitive dependencies. Prisma validation/migrations, lint, types, tests and production compilation were checked after these changes.

## Verification limits

SMTP delivery to a real university mailbox was not exercised; development verification and the production no-SMTP boundary were exercised. Image/profile-picture uploads are omitted; text posts and initials avatars are supported. Large-scale load testing, external faculty identity verification and multi-server operations are outside this classroom submission. Theme switching is implemented but the automated accessibility scans above cover the default light appearance. No public deployment was performed.

The source archive excludes dependencies, database files, local .env and generated build output. Reproduction commands and fictional credentials are in README.md; presentation flow is in DEMO_SCRIPT.md. QA servers are stopped after verification; start them with the documented commands.
