import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export async function currentUser() {
  const token = (await cookies()).get("peerconnect_session")?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: digest(token) },
    include: {
      user: {
        include: {
          profile: { include: { skills: { include: { skill: true } } } },
        },
      },
    },
  });
  return session &&
    session.expiresAt > new Date() &&
    session.user.verified &&
    !session.user.disabled
    ? session.user
    : null;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await db.session.create({ data: { id: digest(token), userId, expiresAt } });
  (await cookies()).set("peerconnect_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.SESSION_SECURE === "true" ||
      process.env.APP_URL?.startsWith("https://") === true,
    path: "/",
    expires: expiresAt,
  });
}
export async function logout() {
  const jar = await cookies(),
    token = jar.get("peerconnect_session")?.value;
  if (token) await db.session.deleteMany({ where: { id: digest(token) } });
  jar.delete("peerconnect_session");
}
