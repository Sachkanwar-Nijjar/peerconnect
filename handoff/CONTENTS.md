> Complete Windows bundle: the current ready-to-run entry point is OPEN-WEBSITE.cmd, implemented in scripts/easy-open.mjs. Bundled runtime/node.exe and node_modules are included. It automatically configures a private .local-db and chooses ports, migrates, restores only when empty, and opens Chrome. START-HERE.txt and TEACHER-GUIDE.md supersede the older source-only setup instructions below for this bundle.

# Package map

- 00-START-HERE.txt: beginner desktop-folder/ZIP instructions.
- 01-MASTER-PROMPT.md: complete continuation instruction to paste into Codex.
- 02-FIRST-MESSAGE.txt: short alternative that asks Codex to read the prompt.
- AGENTS.md: automatic project entry point plus original Next.js guidance.
- handoff/PROJECT_KNOWLEDGE.md: product, stack, features, invariants, source map, design and evidence.
- handoff/ACCESS_AND_SETUP.md: accounts, URLs, install/restore/start/test commands, troubleshooting.
- handoff/HISTORY_AND_DECISIONS.md: history and precedence of latest preferences.
- handoff/NEXT_STEPS.md: audit targets and practical improvement priorities.
- handoff/DATABASE_SNAPSHOT.md and database/: row inventory and portable content snapshot.
- handoff/originals/: PDF/DOCX requirements, original user prompts and Reddit/Spotify references.
- handoff/evidence/: raw historical browser reports/build/audit evidence. These are historical results, not a fresh test run of future code. audit evidence is not a current vulnerability guarantee.
- docs/: all existing academic/design/test documentation and rendered application screenshots.
- app/, components/, lib/, prisma/, public/, scripts/, tests/, e2e/: complete current implementation.
- package.json/package-lock.json/config files: reproducible project dependencies/configuration.
- MANIFEST-SHA256.json: SHA256 of every delivered file except the manifest itself.

Source files were copied from the completed working project. Only handoff entry-point documentation/AGENTS were adapted and the portable snapshot helper added. No new product changes were made for this packaging task. Installed dependencies, compiled output, raw PostgreSQL files, browser binaries, active tokens and caches are intentionally excluded. These can be recreated; they are not project source. Git history and a verbatim chat export were not available/included.
