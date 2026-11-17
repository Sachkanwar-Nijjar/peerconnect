import Link from "next/link";
export function OrbitMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`orbit-mark ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="24"
        cy="24"
        rx="19"
        ry="10"
        transform="rotate(-38 24 24)"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="10"
        ry="19"
        transform="rotate(-38 24 24)"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <circle cx="24" cy="24" r="4" fill="currentColor" />
      <circle
        cx="39"
        cy="13"
        r="4.5"
        fill="var(--orbit-node, #67e8f9)"
        stroke="var(--orbit-stroke, #111522)"
        strokeWidth="2"
      />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-icon">
        <OrbitMark />
      </span>
      <span>
        PeerConnect<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
