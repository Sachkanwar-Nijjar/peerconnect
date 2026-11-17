"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiResponse } from "@/lib/api-response";
export function RecoveryForm() {
  const token = useSearchParams().get("token"),
    [message, setMessage] = useState(""),
    [link, setLink] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <main className="recovery-page">
      <Link href="/">PeerConnect.</Link>
      <section className="learn-card">
        <h1>{token ? "Choose a new password" : "Get back to your campus"}</h1>
        <p>
          {token
            ? "Your other sessions will be signed out."
            : "We will email a recovery link to your university address."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const f = Object.fromEntries(new FormData(e.currentTarget));
            try {
              const d = await apiResponse(
                await fetch("/api/auth/" + (token ? "reset" : "forgot"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...f, ...(token ? { token } : {}) }),
                }),
              );
              setMessage(d.message);
              setLink(d.resetUrl || "");
            } catch (err) {
              setMessage((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {token ? (
            <label>
              New password
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={10}
                maxLength={128}
              />
            </label>
          ) : (
            <label>
              University email
              <input type="email" name="email" required autoComplete="email" />
            </label>
          )}
          <button className="btn btn-primary" disabled={busy}>
            {busy
              ? "Please wait…"
              : token
                ? "Update password"
                : "Send recovery link"}
          </button>
        </form>
        {message && <p role="status">{message}</p>}
        {link && (
          <p>
            Local development delivery:{" "}
            <Link href={link}>Open recovery link</Link>
          </p>
        )}
        <Link href="/login">Back to login</Link>
      </section>
    </main>
  );
}
