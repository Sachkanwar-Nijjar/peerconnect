# Latest release context — 16 November 2026
Read docs/CAMPUS_LIFE_RELEASE_2026_11_16.md and docs/UPGRADE_2026_11_15.md before relying on the historical notes below. Preserve the all-in-one campus positioning and existing matching invariants. Full public deployment and continuous society-feed synchronization remain unfinished; do not claim otherwise.

> Update — 13 November 2026: read docs/LATEST_STATUS.md first. A complete 26/26 browser run, 12 unit tests, typecheck, lint, final production build and zero-known-vulnerability audit passed. Startup identity/readiness, bounded JSON handling, news selection/retry and admin paging fixes are implemented. Earlier counts and the investigation list below are historical context. Original application data was preserved.

# Continuation priorities

These are audit targets and opportunities, not claims that every item is broken. Verify before changing. New broad frontend/backend improvement work is authorized; preserve the accepted product and data.

## First session
1. Confirm folder, inventory files and read the master prompt/knowledge/requirements. Inspect original running services to avoid editing one copy while viewing another.
2. Preserve the supplied snapshot and establish a restorable checkpoint. Set up dependencies/config; restore only to an empty database or deliberately reuse the original. Never seed/reset valuable data.
3. Run typecheck, lint, nine unit tests, production build, full browser suite and dependency audit on an isolated test database. Report current results distinctly from historical evidence.
4. Exercise student/faculty/moderator/admin workflows and real failure paths. Check API permission leaks, ownership bypass, validation, malformed inputs, origin checks, duplicate requests, capacity races, session expiry/account disabling and messages.
5. Inspect every screen visually at desktop/tablet/mobile in both themes. Check focus, keyboard use, contrast, reduced motion, screen-reader labels, load/empty/error/retry states, readable density and overflow.

## Most useful improvements to investigate
- Audit launcher readiness: it currently checks listening ports, not whether the responding process is the intended project or whether PostgreSQL has completed recovery. It can say READY before the database is usable. Make startup truthful, portable and resistant to port conflicts without killing unrelated processes.
- Improve first-run setup: current launcher assumes dependencies, .env, schema and data are already prepared. Simplify safe install/migration/restore flow for a beginner; never automatically overwrite populated data.
- Refactor the large workspace.tsx and accumulated CSS into coherent modules/tokens without a rewrite or visual regression. Some historical orbit artwork/marketing text remains outside Campus Home; evaluate quietly against the user's premium restrained preference.
- CampusHighlights and HomeFeed make separate posts reads; assess deduplication, stable ordering/loading and more visible retry/error states. News currently derives only from the first fetched page; decide whether a dedicated existing-content query is warranted without inventing news or broadening permissions.
- Inspect news title truncation, visual variety and archive imagery treatment. Do not use archive campus images as evidence of a specific current event. Improve editorial browsing with actual data and licensed assets.
- Review bounded discovery/search behavior and server/client efficiency with real measurements. Preserve precise matching semantics and pagination/authorization.
- Check fresh-install compatibility on current supported Node/npm/OS. Lockfile matters; upgrade dependencies only for a demonstrated reason and rerun checks. Windows build workaround is scoped to output directories and should not be broadened carelessly.
- Review test stability and add meaningful coverage for actual changes. Run one clean full 22-case suite after fixes rather than relying only on historical combined reruns. Keep auth form hydration readiness checks.

## Optional later production work
Password recovery, proven SMTP, real faculty verification, shared rate limiting, backups/restore drills, logs/monitoring, security headers/CSP, larger-scale queries and independent deployment configuration need explicit design and appropriate testing. Explain what remains local/demo-only. Prepare deployment instructions if useful, but ask before public exposure, account/service creation, paying or uploading the private snapshot. Do not invent live credentials or a hosted link.

## Finish each improvement batch
Update docs and tests, supply actual screenshots and a working local link, explain opening it in plain language, preserve a changelog and continuation note, and list anything unverified. Do not claim all conceivable future work is complete.
