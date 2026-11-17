import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync, realpathSync } from "node:fs";
import { resolve, dirname, join, delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
process.env.PATH = join(root, "runtime") + delimiter + (process.env.PATH || "");
const settingsFile = join(root, "portable-settings.json");
const lockFile = join(root, ".portable-launch.lock");
const dataDir = join(root, ".local-db");
const delay = ms => new Promise(r => setTimeout(r, ms));
let postgres, ownsDatabase = false, app, ownsLock = false, stopping = false;
function listening(port) {
  return new Promise(resolve => {
    const s = net.createConnection({ host: "127.0.0.1", port });
    const end = result => { s.destroy(); resolve(result); };
    s.setTimeout(800); s.once("connect", () => end(true));
    s.once("error", () => end(false)); s.once("timeout", () => end(false));
  });
}
async function freePort(start) {
  for (let port = start; port < start + 100; port++) {
    const free = await new Promise(resolve => {
      const s = net.createServer(); s.once("error", () => resolve(false));
      s.listen(port, "127.0.0.1", () => s.close(() => resolve(true)));
    });
    if (free) return port;
  }
  throw Error("No local port is available. Close an older PeerConnect window and try again.");
}
function configure(settings) {
  Object.assign(process.env, {
    DATABASE_URL: `postgresql://peerconnect:local_demo_only@127.0.0.1:${settings.dbPort}/peerconnect?schema=public`,
    APP_URL: `http://127.0.0.1:${settings.appPort}`,
    UNIVERSITY_DOMAINS: "thapar.edu", DEV_EMAIL_VERIFICATION: "true",
    DEMO_PASSWORD: "CampusDemo!2026", BUILD_OUTPUT_DIR: ".next",
    NEXT_TELEMETRY_DISABLED: "1",
  });
}
async function matchingWebsite(settings) {
  configure(settings);
  try {
    const r = await fetch(`${process.env.APP_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    const health = await r.json();
    const { runtimeId } = await import("./runtime-id.mjs");
    return r.ok && health.service === "peerconnect" && health.instance === runtimeId() && health.status === "ready";
  } catch { return false; }
}
function openBrowser(url) {
  if (process.argv.includes("--no-browser")) return;
  const candidates = [
    process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe"),
    process.env["PROGRAMFILES(X86)"] && join(process.env["PROGRAMFILES(X86)"], "Google/Chrome/Application/chrome.exe"),
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
  ].filter(Boolean);
  const chrome = candidates.find(p => existsSync(p));
  const browser = spawn(chrome || "explorer.exe", [url], { detached: true, stdio: "ignore", windowsHide: true });
  browser.on("error", () => console.log(`Open this address in Chrome: ${url}`)); browser.unref();
}
function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, env: process.env, stdio: "inherit", windowsHide: true });
    child.on("error", reject); child.on("exit", code => code === 0 ? resolve() : reject(Error("Setup stopped. See the message above; your existing data was not reset.")));
  });
}
async function cleanup() {
  if (stopping) return; stopping = true;
  if (app && app.exitCode === null) {
    if (process.platform === "win32") {
      // Only the Next.js process tree created by this launcher, never a port owner guessed by PID.
      await new Promise(resolve => {
        const stop = spawn("taskkill.exe", ["/PID", String(app.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
        stop.on("error", resolve); stop.on("exit", resolve);
      });
    } else app.kill("SIGINT");
    await Promise.race([new Promise(r => app.once("exit", r)), delay(4000)]);
  }
  if (ownsDatabase && postgres) {
    // Request PostgreSQL's own fast, checkpointed shutdown instead of force-killing it.
    await new Promise(resolve => {
      const ctl = join(root, "node_modules/@embedded-postgres/windows-x64/native/bin/pg_ctl.exe");
      const stop = spawn(ctl, ["-D", dataDir, "-m", "fast", "-w", "stop"], { windowsHide: true, stdio: "inherit" });
      stop.on("error", resolve); stop.on("exit", resolve);
    });
  }
  if (ownsLock && existsSync(lockFile)) unlinkSync(lockFile);
}
async function main() {
  console.log("\nPEERCONNECT — automatic local setup and launch\nKeep this window open while using the website.\n");
  if (process.platform !== "win32" || process.arch !== "x64") throw Error("This ready-to-run bundle is for Windows x64. See README.md for source setup on another platform.");
  if (!existsSync("node_modules/next/dist/bin/next")) throw Error("Extract the entire folder, including node_modules. No downloads or manual installation should be needed.");
  let settings = existsSync(settingsFile) ? JSON.parse(readFileSync(settingsFile, "utf8")) : null;
  if (settings && await matchingWebsite(settings)) {
    console.log(`Already running: ${process.env.APP_URL}/login`); openBrowser(`${process.env.APP_URL}/login`); return;
  }
  if (existsSync(lockFile)) {
    const previous = Number(readFileSync(lockFile, "utf8"));
    let active = true; try { process.kill(previous, 0); } catch { active = false; }
    if (active) throw Error("This copy is already starting. Return to its existing PeerConnect window and wait for READY.");
    unlinkSync(lockFile);
  }
  writeFileSync(lockFile, String(process.pid), { flag: "wx" }); ownsLock = true;
  let dbPort;
  const pidFile = join(dataDir, "postmaster.pid");
  if (existsSync(pidFile)) {
    const lines = readFileSync(pidFile, "utf8").split(/\r?\n/);
    if (resolve(lines[1]).toLowerCase() === resolve(dataDir).toLowerCase() && await listening(Number(lines[3]))) dbPort = Number(lines[3]);
  }
  settings = { dbPort: dbPort || await freePort(55439), appPort: await freePort(settings?.appPort || 3000) };
  configure(settings);
  writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  const config = ["DATABASE_URL", "APP_URL", "UNIVERSITY_DOMAINS", "DEV_EMAIL_VERIFICATION", "DEMO_PASSWORD", "BUILD_OUTPUT_DIR", "NEXT_TELEMETRY_DISABLED"].map(k => `${k}=${JSON.stringify(process.env[k])}`).join("\n");
  writeFileSync(".env", config + "\n");
  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  postgres = new EmbeddedPostgres({ databaseDir: dataDir, user: "peerconnect", password: "local_demo_only", port: settings.dbPort, persistent: true, autoRehydrateSymlinks: true, initdbFlags: ["--encoding=UTF8", "--locale=C"], postgresFlags: ["-h", "127.0.0.1"] });
  if (!dbPort) {
    console.log("Preparing this folder's private local database…");
    if (!existsSync(join(dataDir, "PG_VERSION"))) await postgres.initialise();
    await postgres.start(); ownsDatabase = true;
  }
  const pg = postgres.getPgClient("postgres", "127.0.0.1"); await pg.connect();
  try {
    const check = await pg.query("SELECT current_setting('data_directory') AS location");
    if (realpathSync(check.rows[0].location).toLowerCase() !== realpathSync(dataDir).toLowerCase()) throw Error("Database ownership check failed. No existing database was changed.");
    const existing = await pg.query("SELECT 1 FROM pg_database WHERE datname = 'peerconnect'");
    if (!existing.rowCount) await pg.query('CREATE DATABASE "peerconnect"');
  } finally { await pg.end(); }
  await run(["node_modules/prisma/build/index.js", "migrate", "deploy"]);
  const { PrismaClient } = await import("@prisma/client");
  const db = new PrismaClient();
  let hasUsers;
  try { hasUsers = await db.user.count() > 0; } finally { await db.$disconnect(); }
  if (!hasUsers) {
    console.log("Restoring the included project content for the first opening…");
    await run(["scripts/portable-data.mjs", "restore", "handoff/database/peerconnect-snapshot.json"]);
  }
  await run(["node_modules/tsx/dist/cli.mjs", "scripts/seed-learning.ts"]);
  console.log("Starting the website…");
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "127.0.0.1", "--port", String(settings.appPort)], { cwd: root, env: process.env, stdio: "inherit", windowsHide: true });
  app.on("error", error => console.error(error.message));
  const deadline = Date.now() + 120000;
  let ready = false;
  while (Date.now() < deadline && app.exitCode === null) {
    if (await matchingWebsite(settings)) { ready = true; break; }
    await delay(500);
  }
  if (!ready) throw Error("Website did not become ready. Keep the error message and show it to Codex.");
  await fetch(`${process.env.APP_URL}/login`, { signal: AbortSignal.timeout(60000) });
  const url = `${process.env.APP_URL}/login`;
  writeFileSync("WEBSITE-LINK.txt", url + "\nWorks while OPEN-WEBSITE.cmd is running.\n");
  console.log(`\nREADY — ${url}\nStudent: student.a@thapar.edu\nTeacher: faculty@thapar.edu\nPassword for both: CampusDemo!2026\n\nChrome opens automatically. Keep this window open.\nPress Ctrl+C here when finished.\n`);
  openBrowser(url);
  if (process.argv.includes("--smoke-test")) { await cleanup(); return; }
  await new Promise((resolve, reject) => app.once("exit", code => stopping || code === 0 ? resolve() : reject(Error("The website stopped. Reopen OPEN-WEBSITE.cmd."))));
  await cleanup();
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, async () => { await cleanup(); process.exit(0); });
main().catch(async error => { console.error(`\n${error.message}\n`); await cleanup(); process.exitCode = 1; });
