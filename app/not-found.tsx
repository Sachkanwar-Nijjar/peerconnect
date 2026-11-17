import Link from "next/link";
export default function NotFound() {
  return (
    <main className="auth-page">
      <div className="card">
        <span className="eyebrow">404 · A little off campus</span>
        <h1>That page isn’t here.</h1>
        <p>Let’s get you back to your next collaboration.</p>
        <Link className="btn btn-primary" href="/app">
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
