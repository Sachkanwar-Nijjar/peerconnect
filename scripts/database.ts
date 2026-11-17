import "dotenv/config";
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";
const postgres = new EmbeddedPostgres({
  databaseDir: ".local-db",
  user: "peerconnect",
  password: "local_demo_only",
  port: 54329,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});
if (!existsSync(".local-db/PG_VERSION")) await postgres.initialise();
await postgres.start();
try {
  await postgres.createDatabase("peerconnect");
} catch (error) {
  if (!String(error).includes("already exists")) throw error;
}
console.log(
  "PeerConnect PostgreSQL ready on 127.0.0.1:54329. Keep this terminal open.",
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, async () => {
    await postgres.stop();
    process.exit(0);
  });
setInterval(() => {}, 60000);
