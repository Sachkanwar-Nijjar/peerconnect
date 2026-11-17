"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="auth-page">
      <div className="card">
        <h1>Something interrupted the connection.</h1>
        <p>
          Please try again. If this continues, check that the database is
          running.
        </p>
        <button className="btn btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
