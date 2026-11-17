import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

function run(module, args = []) {
  const result = spawnSync(process.execPath, [require.resolve(module), ...args], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("prisma/build/index.js", ["generate"]);
// Preview branches must never migrate or seed the production database.
if (process.env.VERCEL_ENV === "production") {
  if (!process.env.DATABASE_URL) throw new Error("Production DATABASE_URL is required.");
  run("prisma/build/index.js", ["migrate", "deploy"]);
  // Official course catalog only; never run the local demonstration seed here.
  run("tsx/cli", ["scripts/seed-learning.ts"]);
}
run("next/dist/bin/next", ["build", "--webpack"]);
