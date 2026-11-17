import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
// Pre-create the shared output directory to avoid concurrent mkdir failures on Windows.
const output = process.env.BUILD_OUTPUT_DIR || ".next";
const routes = [
  "reset-password",
  "login",
  "register",
  "verify-email",
  "_not-found",
  "_global-error",
  "api/auth/[action]",
  "api/health",
  "api/data/[resource]",
  "app/[[...path]]",
];
for (const path of [
  "static/chunks/app",
  "static/media",
  "types/app/api",
  "server/app/index.segments",
  ...routes.flatMap((route) => [
    `static/chunks/app/${route}`,
    `server/app/${route}`,
    `types/app/${route}`,
  ]),
  ...["reset-password", "login", "register", "verify-email", "_not-found", "_global-error"].map(
    (page) => `server/app/${page}.segments/${page}`,
  ),
]) {
  await mkdir(`${output}/${path}`, { recursive: true });
}
const result = spawnSync(
  process.execPath,
  [
    "--require",
    fileURLToPath(new URL("./windows-build-fs.cjs", import.meta.url)),
    require.resolve("next/dist/bin/next"),
    "build",
    "--webpack",
  ],
  { stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);
