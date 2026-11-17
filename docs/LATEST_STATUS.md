> Current release: 16 November 2026. Read CAMPUS_LIFE_RELEASE_2026_11_16.md and UPGRADE_2026_11_15.md first. Campus-life-first homepage, 64 checked Saturnalia listings, society/department resources, course/mentor guidance. Latest checks: 19 unit tests and 16 isolated-database guidance checks; browser verification described in the release report. Automatic source checks do not guarantee a live schedule sync. Hosting and SMTP still need configuration.

> Learning upgrade, 15 November 2026: see UPGRADE_2026_11_15.md. New checks: 16 isolated-database guidance integration checks + existing 12 unit tests passed; typecheck, ESLint and production build passed. Browser review verified course search/detail, populated helpers, keyboard-capable request dialog and 390px/1440px layouts. Portable migration/start smoke test reached READY and /login returned 200 on port 3001. Earlier 26-browser-test results below remain historical; the full suite was not rerun for this release. Public deployment/SMTP and the deferred features listed in the upgrade report are not complete.

> Later appearance update: the Obsidian black palette is documented in VISUAL_REDESIGN.md and OBSIDIAN_THEME_REPORT.md. The functional audit below remains the prior verified backend baseline.

# Current verification â€” 13 November 2026

## Result
The final complete Playwright run passed **26/26** scenarios, with **0 failures, 0 skipped and 0 flaky**. It includes the original student/faculty/moderation/admin workflows, exact skill matching, application acceptance/capacity concurrency, private messages, persistence, responsive screens and accessibility checks. The final optimized production build passed after precreating Windows API type output directories. Twelve unit tests passed (nine matching/validation cases plus three request/response safety cases). TypeScript and ESLint passed. Dependency audit reported zero known vulnerabilities at execution time; this is not a guarantee against future findings.

## Fixes completed
- Launcher validates the migrated database and actual health endpoint before printing READY. Its non-sensitive identity distinguishes source folders and DB configurations, preventing accidental use of the wrong project on an occupied port. An unrelated-server refusal check passed without stopping that server.
- Auth/data APIs bound actual streamed request bytes to 64,000 and reject malformed/non-object JSON with controlled 400 responses; oversized requests receive 413. This applies even without a Content-Length header.
- Fractional page input is normalized to an integer. Admin account pagination advances by 50 rows with stable tie ordering rather than overlapping 12-row offsets. A regression checks the 50-row boundary.
- Campus news queries eligible visible posts across the database instead of filtering only the first general feed page. It prioritizes highlighted posts, caps the response at three, preserves authentication and excludes hidden content. A regression puts 13 newer general posts ahead of the news.
- News/feed failures provide retry controls; non-JSON server failures display a readable message. A browser check simulates failures and verifies recovery. Failed logout no longer silently navigates as though it succeeded.
- Windows build preparation now includes generated API type directories, alongside the existing limited directory-creation workaround.

## Data and environment
A logical content backup was saved before the audit. Browser tests ran against **peerconnect_qa_20261113** through port **3001**, not the original database. After the audit, all 17 application table contents matched the pre-audit snapshot (sessions/verification tokens excluded from exports). No schema migration or matching-rule change was needed. The user's actual preview remains at **http://127.0.0.1:3000** using the original database.

Main source: outputs/PeerConnect. Updated portable handoff is its sibling PeerConnect-Codex-Handoff. A previously copied Desktop folder is not automatically synchronized.

## Scope and remaining limits
This is a working local academic app, not a publicly hosted service. Real SMTP delivery, password recovery, independent faculty identity checks, distributed rate limiting, production operations and large-scale load testing remain separate production work. Uploads, videos, payments, followers and task boards are deliberate exclusions. No external account, paid service or public deployment was created.

See CURRENT_TEST_RESULTS.json and BUILD_LOG.txt for recorded evidence. Historical reports remain preserved with their original dates; this report supersedes earlier verification totals.
