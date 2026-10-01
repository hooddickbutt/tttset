import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/providers";
import { appUrl } from "@/lib/network";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans-app",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif-app",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-app",
});

const description =
  "Send, receive and manage digital assets through a simple, transparent payment experience. Keel is an independent app and is not affiliated with Robinhood or X.";

export const metadata: Metadata = {
  metadataBase: appUrl ? new URL(appUrl) : undefined,
  title: {
    default: "Keel — Payments, built onchain",
    template: "%s — Keel",
  },
  description,
  applicationName: "Keel",
  openGraph: {
    title: "Keel — Payments, built onchain",
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keel — Payments, built onchain",
    description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        <Providers>
          <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
            Skip to content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
