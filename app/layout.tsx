import type { Metadata } from "next";
import { Inter, Anton, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "../components/ui/Analytics";
import { siteData } from "../data/site";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import IntroSplash from "../components/intro-splash";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const mrsSaintDelafield = Mrs_Saint_Delafield({
  variable: "--font-mrs-saint-delafield",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteData.domain),
  title: siteData.seoTitle,
  description: siteData.seoDescription,
  keywords: ["AI Automation", "AI Calling Agents", "Web Developer", "Freelance", "Next.js", "React"],
  alternates: {
    canonical: siteData.domain,
  },
  openGraph: {
    title: siteData.seoTitle,
    description: siteData.seoDescription,
    url: siteData.domain,
    siteName: siteData.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteData.seoTitle,
    description: siteData.seoDescription,
    creator: "@arhamsuhail",
  },
  icons: {
    icon: "/arham-wordmark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Person", "ProfessionalService"],
    name: siteData.name,
    url: siteData.domain,
    jobTitle: "AI-focused Developer",
    description: siteData.seoDescription,
    email: siteData.email,
    telephone: siteData.whatsappNumber,
    sameAs: [siteData.linkedin, siteData.github],
  };

  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} ${mrsSaintDelafield.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var freq = '${(siteData as { introFrequency?: string }).introFrequency || "always"}';
                var isSeen = freq === 'session' && sessionStorage.getItem('introSeen') === '1';
                if (isSeen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  document.documentElement.setAttribute('data-intro-seen', '1');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-body bg-bg text-text selection:bg-ice selection:text-bg flex flex-col min-h-screen">
        <IntroSplash />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
