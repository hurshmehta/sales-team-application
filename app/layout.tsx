import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hurshmehta.com"),
  title: "Join Hursh Mehta's Life Insurance Sales Team | Get Licensed, Get Leads, Work Remote",
  description:
    "Join Hursh Mehta's life insurance sales team. No experience needed. We cover your $200 pre-licensing course, pay for your leads, and mentor you 1-on-1. 100% remote. Apply in 2 minutes.",
  keywords: [
    "how to become a life insurance agent",
    "join a life insurance team",
    "life insurance agent jobs",
    "sell life insurance",
    "life insurance sales team",
    "get licensed life insurance",
    "life insurance agent no experience",
    "remote life insurance agent",
    "Hursh Mehta",
  ],
  alternates: {
    canonical: "https://hurshmehta.com",
  },
  openGraph: {
    title: "Join Hursh Mehta's Life Insurance Sales Team",
    description:
      "No experience needed. We cover your $200 pre-licensing course, pay for your leads, and mentor you 1-on-1. 100% remote. Apply in 2 minutes.",
    url: "https://hurshmehta.com",
    siteName: "Hursh Mehta",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Structured data so AI search and search engines can cite the site:
// the team as an organization, the FAQ, and the site itself.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Hursh Mehta",
      alternateName: "Hursh Mehta Life Insurance Team",
      url: "https://hurshmehta.com",
      description:
        "Life insurance sales team in California. New agents need no experience. The team covers the $200 pre-licensing course, pays for leads, and mentors agents 1-on-1. 100% remote.",
      founder: {
        "@type": "Person",
        name: "Hursh Mehta",
        jobTitle: "Licensed California life and health insurance broker",
      },
      sameAs: [
        "https://www.instagram.com/hursh.mehta",
        "https://www.tiktok.com/@hursh.mehta",
        "https://www.youtube.com/@hurshmehtawins",
      ],
    },
    {
      "@type": "WebSite",
      name: "Hursh Mehta",
      url: "https://hurshmehta.com",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need sales experience?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Most of our agents started with none. You'll learn the products, follow proven scripts and practice with your mentor before you talk to a single client.",
          },
        },
        {
          "@type": "Question",
          name: "What does it cost to get started?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You pay the state fees for your exam, license, and fingerprinting, usually $200–$400 total depending on your state. We cover the $200 pre-licensing course ourselves, and there's no fee to join the team.",
          },
        },
        {
          "@type": "Question",
          name: "Is this salary or commission?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Commission. You're an independent contractor and you earn on every policy you write. There's no ceiling, and your income depends on the work you put in.",
          },
        },
        {
          "@type": "Question",
          name: "Is this an MLM?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. You earn from selling real insurance policies to real clients, with no product to buy or inventory to stock. Agents who choose to build a team can also earn on their team's sales, which is how insurance agencies have always worked.",
          },
        },
        {
          "@type": "Question",
          name: "Can I do this part-time?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Plenty of agents start with 10–15 hours a week around school or another job, then go full-time once it's working.",
          },
        },
        {
          "@type": "Question",
          name: "Will I have to call friends and family?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You don't have to. We show you how to work with people who have already asked for coverage, so your conversations start warm.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
