"use client";
import { apiResponse } from "@/lib/api-response";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
const subscribe = () => () => {};
export function AuthForm({ mode }: { mode: "login" | "register" | "verify" }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const router = useRouter(),
    query = useSearchParams(),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [verification, setVerification] = useState(""),
    [busy, setBusy] = useState(false);
  const { register, handleSubmit } = useForm<{
    name: string;
    email: string;
    password: string;
    faculty: boolean;
  }>();
  async function submit(values: unknown) {
    setError("");
    setBusy(true);
    try {
      const r = await fetch(
        `/api/auth/${mode === "verify" ? "verify" : mode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "verify" ? { token: query.get("token") } : values,
          ),
        },
      );
      const data = await apiResponse(r);
      if (mode === "login") {
        router.push("/app");
        router.refresh();
      } else {
        setMessage(
          data.message +
            (data.facultyPending
              ? " Faculty privileges require admin approval."
              : ""),
        );
        setVerification(data.verificationUrl || "");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <Link href="/reset-password" className="recovery-link">Forgot your password?</Link>
      <aside className="auth-aside">
        <Brand />
        <div>
          <span className="eyebrow">CONNECT. COLLABORATE. CREATE.</span>
          <h1>
            A campus of talent.
            <br />A world of possibility.
          </h1>
          <p>
            Find the people who turn your “what if” into something worth
            building.
          </p>
          <div className="auth-art">
            <span>Python</span>
            <span>Design</span>
            <span>Research</span>
            <span>You.</span>
          </div>
        </div>
        <small>
          PeerConnect · Thapar community ·{" "}
          <a href="/images/CREDITS.txt" target="_blank" rel="noreferrer">
            Photo credits
          </a>
        </small>
      </aside>
      <section className="auth-content">
        <div className="mobile-brand">
          <Brand />
        </div>
        <div className="auth-form">
          <span className="icon-tile">
            <ShieldCheck />
          </span>
          <h1>
            {mode === "register"
              ? "Your next team starts here."
              : mode === "verify"
                ? "One step closer."
                : "Welcome back."}
          </h1>
          <p>
            {mode === "register"
              ? "Join your campus with your university email."
              : mode === "verify"
                ? "Verify your university email to activate your account."
                : "Your people and projects are waiting for you."}
          </p>
          {error && (
            <div className="alert error" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="alert success" role="status">
              {message}
            </div>
          )}
          {verification && (
            <div className="dev-mail">
              <strong>Local demo mailbox</strong>
              <p>Email delivery is simulated in development only.</p>
              <Link href={verification}>
                Open verification message <ArrowRight size={15} />
              </Link>
            </div>
          )}
          {!message && (
            <form onSubmit={handleSubmit(submit)}>
              {mode === "register" && (
                <label>
                  Full name
                  <input
                    {...register("name", { required: true, minLength: 2 })}
                    autoComplete="name"
                    required
                    placeholder="Your full name"
                  />
                </label>
              )}
              {mode !== "verify" && (
                <>
                  <label>
                    University email
                    <input
                      type="email"
                      {...register("email", { required: true })}
                      autoComplete="email"
                      required
                      placeholder="you@thapar.edu"
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      {...register("password", {
                        required: true,
                        minLength: mode === "register" ? 10 : 1,
                      })}
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
                      required
                      minLength={mode === "register" ? 10 : 1}
                      placeholder={
                        mode === "register"
                          ? "At least 10 characters"
                          : "Enter your password"
                      }
                    />
                  </label>
                </>
              )}
              {mode === "register" && (
                <label className="check-label">
                  <input type="checkbox" {...register("faculty")} /> I’m a
                  faculty member / mentor <small>Requires admin approval</small>
                </label>
              )}
              <Button className="full" disabled={busy || !hydrated}>
                {busy
                  ? "Please wait…"
                  : mode === "register"
                    ? "Create account"
                    : mode === "verify"
                      ? "Verify email"
                      : "Log in"}
                <ArrowRight size={16} />
              </Button>
            </form>
          )}
          {mode === "verify" || message ? (
            <Link href="/login" className="auth-switch">
              Continue to login
            </Link>
          ) : (
            <p className="auth-switch">
              {mode === "login"
                ? "New to PeerConnect?"
                : "Already part of the community?"}{" "}
              <Link href={mode === "login" ? "/register" : "/login"}>
                {mode === "login" ? "Create an account" : "Log in"}
              </Link>
            </p>
          )}
          <div className="auth-foot">
            <ShieldCheck size={15} /> A private space for verified university
            members.
          </div>
        </div>
      </section>
    </main>
  );
}
