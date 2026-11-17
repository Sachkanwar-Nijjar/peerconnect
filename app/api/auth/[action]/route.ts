import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { createSession, digest, logout } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { AppError } from "@/lib/service";
import { readJsonObject, RequestBodyError } from "@/lib/request-body";
const attempts = new Map<string, { count: number; reset: number }>();
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    if (
      req.headers.get("origin") &&
      req.headers.get("origin") !==
        new URL(process.env.APP_URL || req.url).origin
    )
      throw new AppError("Request origin rejected.", 403);
    const { action } = await params;
    const input = await readJsonObject(req);
    const key = String(input.email || "").toLowerCase();
    const now = Date.now();
    let entry = attempts.get(key);
    if (!entry || entry.reset < now) {
      entry = { count: 0, reset: now + 60000 };
      attempts.set(key, entry);
    }
    if (++entry.count > 20)
      throw new AppError("Please wait a minute before trying again.", 429);
    if (attempts.size > 10000) attempts.clear();
    if (action === "register") {
      const p = registerSchema.parse(input);
      const domains = (process.env.UNIVERSITY_DOMAINS || "thapar.edu")
        .split(",")
        .map((s) => s.trim().toLowerCase());
      if (!domains.includes(p.email.split("@")[1]))
        throw new AppError("Use an eligible university email address.");
      if (await db.user.findUnique({ where: { email: p.email } }))
        throw new AppError("This email is already registered.", 409);
      const dev =
        process.env.NODE_ENV !== "production" &&
        process.env.DEV_EMAIL_VERIFICATION === "true";
      if (!dev && !process.env.SMTP_URL)
        throw new AppError(
          "Email delivery is not configured. Contact the administrator.",
          503,
        );
      const raw = randomBytes(32).toString("hex");
      const user = await db.user.create({
        data: {
          name: p.name,
          email: p.email,
          passwordHash: await hash(p.password, 12),
          requestedFaculty: !!p.faculty,
          tokens: {
            create: {
              id: digest(raw),
              expiresAt: new Date(Date.now() + 86400000),
            },
          },
        },
      });
      const verificationUrl = `${process.env.APP_URL || req.nextUrl.origin}/verify-email?token=${raw}`;
      if (!dev) {
        try {
          await nodemailer.createTransport(process.env.SMTP_URL!).sendMail({
            from: process.env.EMAIL_FROM,
            to: p.email,
            subject: "Verify your PeerConnect account",
            text: `Confirm your university email: ${verificationUrl}`,
          });
        } catch {
          await db.user.delete({ where: { id: user.id } });
          throw new AppError(
            "Verification email could not be sent. Please try registration again.",
            503,
          );
        }
      }
      return NextResponse.json({
        message: "Check your email to verify your account.",
        ...(dev ? { verificationUrl } : {}),
        facultyPending: !!p.faculty,
      });
    }
    if (action === "verify") {
      const { token } = z.object({ token: z.string().min(20) }).parse(input);
      await db.$transaction(async (tx) => {
        const t = await tx.verificationToken.findUnique({
          where: { id: digest(token) },
        });
        if (!t || t.expiresAt < new Date())
          throw new AppError("Verification link is invalid or expired.");
        await tx.verificationToken.delete({ where: { id: t.id } });
        await tx.user.update({
          where: { id: t.userId },
          data: { verified: true },
        });
      });
      return NextResponse.json({
        message: "Email verified. Your account is active. You can now log in.",
      });
    }
    if (action === "forgot") {
      const { email } = z
        .object({ email: z.email().transform((s) => s.trim().toLowerCase()) })
        .parse(input);
      const dev =
        process.env.NODE_ENV !== "production" &&
        process.env.DEV_EMAIL_VERIFICATION === "true";
      if (!dev && !process.env.SMTP_URL)
        throw new AppError(
          "Email recovery is not configured. Contact the administrator.",
          503,
        );
      const user = await db.user.findUnique({ where: { email } });
      const response = {
        message:
          "If this is an active account, a recovery link will be sent to its university email.",
      };
      if (!user || !user.verified || user.disabled)
        return NextResponse.json(response);
      const raw = randomBytes(32).toString("hex");
      await db.$transaction(async (tx) => {
        await tx.verificationToken.deleteMany({
          where: { userId: user.id, id: { startsWith: "reset:" } },
        });
        await tx.verificationToken.create({
          data: {
            id: "reset:" + digest(raw),
            userId: user.id,
            expiresAt: new Date(Date.now() + 1800000),
          },
        });
      });
      const resetUrl = `${process.env.APP_URL || req.nextUrl.origin}/reset-password?token=${raw}`;
      if (!dev)
        try {
          await nodemailer
            .createTransport(process.env.SMTP_URL!)
            .sendMail({
              from: process.env.EMAIL_FROM,
              to: email,
              subject: "Reset your PeerConnect password",
              text: "This link expires in 30 minutes: " + resetUrl,
            });
        } catch {
          throw new AppError(
            "Recovery email could not be sent. Please try again.",
            503,
          );
        }
      return NextResponse.json({ ...response, ...(dev ? { resetUrl } : {}) });
    }
    if (action === "reset") {
      const p = z
        .object({
          token: z.string().min(20).max(128),
          password: z.string().min(10).max(128),
        })
        .parse(input);
      const passwordHash = await hash(p.password, 12);
      await db.$transaction(async (tx) => {
        const id = "reset:" + digest(p.token);
        const t = await tx.verificationToken.findUnique({ where: { id } });
        if (!t || t.expiresAt < new Date())
          throw new AppError("Recovery link is invalid or expired.");
        const user = await tx.user.findUnique({ where: { id: t.userId } });
        if (!user || user.disabled || !user.verified)
          throw new AppError("Account unavailable.", 403);
        await tx.verificationToken.delete({ where: { id } });
        await tx.user.update({
          where: { id: t.userId },
          data: { passwordHash },
        });
        await tx.session.deleteMany({ where: { userId: t.userId } });
        await tx.verificationToken.deleteMany({
          where: { userId: t.userId, id: { startsWith: "reset:" } },
        });
      });
      return NextResponse.json({
        message: "Password updated. Please log in again.",
      });
    }
    if (action === "login") {
      const { email, password } = z
        .object({
          email: z.email().transform((s) => s.toLowerCase().trim()),
          password: z.string().max(128),
        })
        .parse(input);
      const user = await db.user.findUnique({ where: { email } });
      if (!user || !(await compare(password, user.passwordHash)))
        throw new AppError("Email or password is incorrect.", 401);
      if (!user.verified)
        throw new AppError("Your email is not verified.", 403);
      if (user.disabled) throw new AppError("This account is disabled.", 403);
      await createSession(user.id);
      return NextResponse.json({ message: "Welcome back." });
    }
    if (action === "logout") {
      await logout();
      return NextResponse.json({ message: "Logged out." });
    }
    throw new AppError("Action not found.", 404);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        {
          error: error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        },
        { status: 400 },
      );
    if (error instanceof AppError || error instanceof RequestBodyError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    if ((error as { code?: string }).code === "P2002")
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 },
      );
    console.error(error);
    return NextResponse.json(
      { error: "Unable to complete this request." },
      { status: 500 },
    );
  }
}
