import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";
import "./midnight.css";
import "./learning.css";
import "./campus-life.css";
export const metadata: Metadata = {
  title: {
    default: "PeerConnect — Connect. Collaborate. Create.",
    template: "%s | PeerConnect",
  },
  description:
    "Your all-in-one Thapar campus: society events, news, conversations, projects, courses and student guidance.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
