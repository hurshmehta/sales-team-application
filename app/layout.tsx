import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Join Our Sales Team | Hursh Mehta",
  description:
    "See if you qualify to join our life insurance sales team. Answer a few quick questions and book a 1-on-1 call.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
