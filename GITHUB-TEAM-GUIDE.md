# Sharing PeerConnect on GitHub

The current project folder is the only local working copy. GitHub stores its source, documentation and change history. It does not host this working backend automatically.

## Upload from this laptop
1. Install GitHub Desktop from https://desktop.github.com/ and sign in to your GitHub account.
2. File > Add local repository > Choose this PeerConnect-Complete folder > Add repository.
3. In Changes, review the files. Source folders app, components, lib, prisma, public, scripts, tests, e2e, docs and safe configuration/examples should be included. Installed packages, runtime binaries, builds, private settings and database snapshots are ignored.
4. Enter the summary Initial PeerConnect upload. Click Commit to main.
5. Click Publish repository. Use name peerconnect and keep Keep this code private checked. Publish to your personal account.
6. Repository > View on GitHub opens the project page. Share its URL after inviting teammates in Settings > Collaborators > Add people.

## Teammates
After accepting the invitation they can read all uploaded source/docs on GitHub. To work locally, use Code > Open with GitHub Desktop and choose their own local folder. They should read README.md and this guide.

A GitHub checkout excludes the Windows runtime, node_modules, builds, local database and database exports. It is therefore much smaller than the portable bundle. OPEN-WEBSITE.cmd needs the portable runtime and cannot run from a plain GitHub clone by itself.

To run a source checkout, install Node.js 24 LTS, open PowerShell in the project directory and run:

```powershell
npm ci
Copy-Item .env.example .env
npm run db:generate
npm run db:local
```

Keep that database terminal open. In a second PowerShell window in the same folder:

```powershell
npm run db:migrate
npm run db:seed
npx tsx scripts/seed-learning.ts
npm run dev
```

Open http://127.0.0.1:3000 in Chrome. The included demo seed creates fictional accounts for local testing. Teammates use their own local databases; changes are not shared live until a hosted database/app is configured. Existing local work is not reset by cloning. Do not use the demo seed on a public deployment or an existing shared database.

## Working together
Before editing, Fetch origin / Pull origin. Create a branch for each feature. Commit changes with a short explanation, Push origin, then create a pull request for review. The owner merges approved pull requests. Never upload .env or database snapshots to bypass an ignore rule.

On this laptop, keep editing this same folder. After later changes, use Changes > Commit to main > Push origin (or a feature branch). No new ZIP or duplicate local project folder is needed.
