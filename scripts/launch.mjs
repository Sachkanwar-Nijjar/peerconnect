import "dotenv/config";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import { PrismaClient } from "@prisma/client";
import { runtimeId } from "./runtime-id.mjs";
const children = [];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const database = new PrismaClient();
function listening(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const finish = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(1000);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}
function run(args) {
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
    windowsHide: true,
  });
  child.on("error", (error) => console.error(error.message));
  children.push(child);
  return child;
}
function stopOwned() {
  for (const child of children) child.kill("SIGINT");
}
async function waitFor(check, label, child) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (child && (child.exitCode !== null || child.signalCode))
      throw Error(`${label} stopped. Check the message above.`);
    if (await check()) return;
    await delay(500);
  }
  throw Error(
    `${label} is not ready. Check database settings/migrations and messages above.`,
  );
}
async function main() {
  if (!existsSync("node_modules/next/dist/bin/next") || !existsSync(".env"))
    throw Error(
      "First setup is needed. Open README.md for installation instructions.",
    );
  const app = new URL(process.env.APP_URL || "http://127.0.0.1:3000");
  if (
    app.protocol !== "http:" ||
    !["127.0.0.1", "localhost"].includes(app.hostname) ||
    app.pathname !== "/"
  )
    throw Error(
      "This local launcher needs APP_URL=http://127.0.0.1:3000 (or another local port).",
    );
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log("\nPeerConnect — checking your database and website.\n");
  let dbChild;
  if (!(await listening(dbUrl.hostname, Number(dbUrl.port || 5432)))) {
    if (
      dbUrl.hostname !== "127.0.0.1" ||
      dbUrl.port !== "54329" ||
      dbUrl.pathname !== "/peerconnect"
    )
      throw Error(
        "Start your configured PostgreSQL server first. The bundled helper uses 127.0.0.1:54329/peerconnect.",
      );
    console.log("Starting your local database…");
    dbChild = run(["node_modules/tsx/dist/cli.mjs", "scripts/database.ts"]);
  }
  await waitFor(
    async () => {
      try {
        await database.user.count();
        return true;
      } catch {
        return false;
      }
    },
    "Database and application schema",
    dbChild,
  );
  await database.$disconnect();
  for (const args of [["node_modules/prisma/build/index.js","migrate","deploy"],["node_modules/tsx/dist/cli.mjs","scripts/seed-learning.ts"]]) {
    const child=run(args);
    await new Promise((resolve,reject)=>child.on("exit",code=>code===0?resolve():reject(Error("Database upgrade failed."))));
  }
  let appChild;
  if (!(await listening(app.hostname, Number(app.port || 80)))) {
    console.log("Starting PeerConnect…");
    appChild = run([
      "node_modules/next/dist/bin/next",
      "dev",
      "--webpack",
      "--hostname",
      app.hostname,
      "--port",
      app.port || "80",
    ]);
  }
  await waitFor(
    async () => {
      let response;
      try {
        response = await fetch(new URL("/api/health", app), {
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        return false;
      }
      let health;
      try {
        health = await response.json();
      } catch {
        throw Error(
          `Port ${app.port || 80} is serving another app or an older build. Stop only that app deliberately or choose a free APP_URL port.`,
        );
      }
      if (health.service !== "peerconnect" || health.instance !== runtimeId())
        throw Error(
          `Port ${app.port || 80} belongs to another project copy or database configuration. Choose the correct copy or another APP_URL port; nothing was stopped.`,
        );
      return response.ok && health.status === "ready";
    },
    "PeerConnect",
    appChild,
  );
  console.log(
    `\nREADY: ${app.origin}/login\nStudent: student.a@thapar.edu\nFaculty: faculty@thapar.edu\nUse the demo password from README.md.\nKeep this window open. Press Ctrl+C when finished.\n`,
  );
  if (process.argv.includes("--check")) return;
  if (process.argv.includes("--open") && process.platform === "win32") {
    const browser = spawn("explorer.exe", [`${app.origin}/login`], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    browser.on("error", () =>
      console.log(`Open ${app.origin}/login in your browser.`),
    );
    browser.unref();
  }
  await new Promise(() => {});
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    stopOwned();
    process.exit(0);
  });
main().catch(async (error) => {
  console.error(`\n${error.message}`);
  stopOwned();
  await database.$disconnect();
  process.exitCode = 1;
});
