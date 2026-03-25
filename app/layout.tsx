import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = "https://taxationistheft.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TIT | AI-Powered Tax Assistant for South Africans",
    template: "%s | TIT Tax",
  },
  description:
    "Upload your bank statements, let AI find your deductions, and pay the least tax legally possible. Built for South African taxpayers.",
  keywords: [
    "South Africa tax",
    "SARS",
    "tax deductions",
    "bank statement analysis",
    "personal income tax",
    "tax calculator",
    "South African tax return",
    "SARS tax filing",
    "tax refund South Africa",
    "AI tax assistant",
    "tax deductions South Africa",
    "income tax calculator South Africa",
    "SARS eFiling helper",
    "freelancer tax South Africa",
    "home office deduction SARS",
    "medical tax credits South Africa",
    "tax help Johannesburg",
    "tax assistant Cape Town",
    "tax deductions Durban",
    "SARS help Pretoria",
    "tax consultant Sandton",
    "income tax Gauteng",
    "tax return Western Cape",
    "tax filing KwaZulu-Natal",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteUrl,
    siteName: "TIT Tax",
    title: "TIT | AI-Powered Tax Assistant for South Africans",
    description:
      "Upload your bank statements, let AI find your deductions, and pay the least tax legally possible.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TIT Tax — AI-Powered Tax Assistant for South Africans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TIT | AI-Powered Tax Assistant for South Africans",
    description:
      "Upload your bank statements, let AI find your deductions, and pay the least tax legally possible.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TIT Tax",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#0060c9" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme');
                  if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "TIT Tax",
              url: siteUrl,
              description:
                "AI-powered tax assistant for South African taxpayers. Upload bank statements, find deductions, pay the least tax legally possible.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "ZAR",
                description: "1 free trial analysis",
              },
              aggregateRating: undefined,
              featureList: [
                "AI-powered bank statement analysis",
                "Automatic tax deduction identification",
                "SARS-compliant tax reports",
                "Support for all major South African banks",
                "Profession-specific deduction detection",
              ],
            }),
          }}
        />
        <AuthProvider>
          <Toaster position="top-right" />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
