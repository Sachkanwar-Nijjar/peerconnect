> Complete Windows bundle: the current ready-to-run entry point is OPEN-WEBSITE.cmd, implemented in scripts/easy-open.mjs. Bundled runtime/node.exe and node_modules are included. It automatically configures a private .local-db and chooses ports, migrates, restores only when empty, and opens Chrome. START-HERE.txt and TEACHER-GUIDE.md supersede the older source-only setup instructions below for this bundle.

> Updated launcher: readiness now verifies the database schema and app identity. A different source folder already on port 3000 is refused. To run this portable copy alongside the original, deliberately configure a free local APP_URL port (for example 3002); both copies still share data unless DATABASE_URL is separately configured. See docs/LATEST_STATUS.md.

# Access, first setup and recovery

## Copies and current location

Original working folder:
`C:\Users\Sachkaran Singh\Documents\Codex\2026-11-12\files-mentioned-by-the-user-peerconnect\outputs\PeerConnect`

The portable project root is its sibling PeerConnect-Codex-Handoff. It can be copied elsewhere. Commands below run from the selected root. Dependencies, running services and browser state do not transfer with the folder. Both example configurations target the same database by default: a second source folder does not isolate its data. Never restore/seed over the original.

## Website and access

Website http://127.0.0.1:3000, login /login, Campus Home /app. These work only on the computer serving the app while it runs. No public domain/hosting is configured.

All seeded demo accounts use `CampusDemo!2026`:

| Role | Email |
| --- | --- |
| Student A, 100% attendance fixture | student.a@thapar.edu |
| Student B, 75% | student.b@thapar.edu |
| Student C, 50% | student.c@thapar.edu |
| Extra students | student.x@thapar.edu; student.y@thapar.edu |
| Faculty Mira Kapoor | faculty@thapar.edu |
| Moderator | moderator@thapar.edu |
| Administrator | admin@thapar.edu |

test.student@thapar.edu is a test-created account, not a recommended demo login. The snapshot preserves test artifacts as well as current demo content. It is not a pristine seed.

## First setup: Codex should handle this

Use Node meeting Next's >=20.9 prerequisite with npm; original environment used Node 24.22.1. Choose a currently maintained official Node release. Verify node --version and npm --version. Do not depend on the old WindowsApps runtime path. If PowerShell blocks npm.ps1, use npm.cmd on Windows.

Install/configure without overwriting existing settings:

```powershell
npm.cmd ci
# Only if .env does not already exist:
Copy-Item .env.example .env
npm.cmd run db:generate
```

Original .env matched .env.example at packaging; no hosted credentials are needed. Keep .env out of public repos. For independent PostgreSQL, configure DATABASE_URL and skip the embedded helper. Never run two helpers on the same raw data directory.

Terminal 1, for a new embedded local database:

```powershell
npm.cmd run db:local
```

Wait for `PeerConnect PostgreSQL ready`, not just an open socket. Keep it open. Terminal 2:

```powershell
npm.cmd run db:migrate
# CHOOSE ONE for an EMPTY database:
node scripts/portable-data.mjs restore handoff/database/peerconnect-snapshot.json
# OR clean original fictional fixtures instead of snapshot:
# npm.cmd run db:seed
npm.cmd run dev
```

On macOS/Linux use npm rather than npm.cmd. Restore checks that every application table is empty and inserts rows in dependency order inside a transaction. It excludes prior sessions/verification tokens. Do not seed after restoring: seed upserts and changes fixture state. Deliberately reusing the original database requires neither restore nor seed. Check migration status before applying changes.

After first setup, `node scripts/launch.mjs` or Windows OPEN-PEERCONNECT.cmd is the convenience route. It assumes dependencies, .env, schema and data exist. It checks fixed ports and may reuse existing processes: confirm which source folder they serve. scripts/database.ts uses fixed local settings/54329 rather than parsing arbitrary DATABASE_URL; custom ports require a reviewed change or independent PostgreSQL.

## Local configuration

- DATABASE_URL: postgresql://peerconnect:local_demo_only@127.0.0.1:54329/peerconnect?schema=public
- APP_URL: http://127.0.0.1:3000; align browser origin/test baseURL.
- UNIVERSITY_DOMAINS: thapar.edu.
- DEV_EMAIL_VERIFICATION: true for local simulated links.
- DEMO_PASSWORD: CampusDemo!2026 for seed/test fixtures.
- SMTP_URL, EMAIL_FROM, SESSION_SECURE: not configured for production. Real deployment requires actual mail settings, DEV_EMAIL_VERIFICATION=false, HTTPS APP_URL and SESSION_SECURE=true.

## Verify/rebuild

Use a disposable test database configured in environment/settings and an app connected to that same database. E2E tests modify accounts, projects, applications and messages. Never point them at valuable content.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npx.cmd playwright install chromium
npm.cmd run test:e2e
# Separate output if dev stays running:
$env:BUILD_OUTPUT_DIR='.next-production'
npm.cmd run build
```

Unset BUILD_OUTPUT_DIR in that terminal afterwards if returning to default .next. To serve a .next-production build, set the same value for npm start. Default build/start both use .next. Do not overwrite development output with a concurrent build. ESLint ignores both known output folders.

Original machine-only fallback: workspace/work/package/bin/npm-cli.js supplied npm; workspace/work/browsers stored Playwright browsers. These are excluded. Normal Node/npm and Playwright installation is the portable solution.

## Snapshot

Export selected DB: `node scripts/portable-data.mjs export handoff/database/NEW-NAME.json`.
Restore only into an empty DB: `node scripts/portable-data.mjs restore handoff/database/peerconnect-snapshot.json`.
Run from project root; the helper resolves installed dependencies there. Keep the supplied known snapshot until another export is verified. Restore was tested against the committed migration in a new isolated database: all 17 exported table counts matched; sessions/tokens were absent. The temporary verification database was removed after checking.

No raw .local-db copy is included: copying a running PostgreSQL directory is not a portable backup. JSON includes account hashes/content and should remain private. Migration plus snapshot reconstruct application state. Package binaries, browser sessions, processes and full conversation transcript are not transferred.

## Troubleshooting

- Local link fails: start the selected app/DB and verify actual HTTP/data responses. It is not hosted publicly.
- Launcher shows code: run the actual .cmd in File Explorer or Win+R using its quoted full current path.
- Missing dependencies/settings: complete first setup; launcher is not an installer.
- Occupied ports: identify original app/DB, do not kill unrelated processes or silently attach the wrong DB.
- Restore refuses populated DB: reuse it or prepare a separate empty DB; do not erase existing content to bypass safety.
- Registration: allowed institute domain, open local simulated verification link, then log in. Faculty privileges need admin approval.
- Cloud cannot see Windows files: select the local project or explicitly transfer files into that environment. Cloud does not inherit local running processes/browser sign-ins.

Beginner guide checked against official [Projects and chats](https://learn.chatgpt.com/docs/projects?surface=app) and [Codex environments](https://learn.chatgpt.com/docs/environments/modes), 12 November 2026. Labels vary by app version; use the local primary-folder workflow first.
