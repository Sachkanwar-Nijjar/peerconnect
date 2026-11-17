import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
export function runtimeId() {
  return createHash("sha256")
    .update(`${realpathSync(process.cwd())}\n${process.env.DATABASE_URL || ""}`)
    .digest("hex")
    .slice(0, 24);
}
