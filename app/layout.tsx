import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./print.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { theme } from "@/theme/theme";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { ReactNode } from "react";
import milegenHeroBkg from "@/images/milegen-hero-bkg.webp";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MileGen - IRS-Compliant Mileage Logs in Minutes",
  description:
    "Generate professional, IRS-compliant mileage logs quickly and easily. Save time, maximize tax deductions, and protect yourself from audits.",
  keywords:
    "mileage log, IRS compliant, tax deduction, business miles, mileage tracking, mileage calculator, tax documentation, real estate mileage, sales professional mileage",
  openGraph: {
    title: "MileGen - IRS-Compliant Mileage Logs in Minutes",
    description:
      "Generate IRS-compliant mileage logs in minutes. Maximize tax deductions and protect yourself from audits.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MileGen - IRS-Compliant Mileage Logs in Minutes",
      },
    ],
    siteName: "MileGen",
    locale: "en_US",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-mantine-color-scheme="light">
      <head>
        <link
          rel="preload"
          href={milegenHeroBkg.src}
          as="image"
          type="image/webp"
        />
      </head>
      <body
        className={inter.className}
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <QueryProvider>
          <MantineProvider defaultColorScheme="light" theme={theme}>
            <Notifications position="top-right" />
            <Nav />
            <main>{children}</main>
            <Footer />
          </MantineProvider>
        </QueryProvider>
        <SpeedInsights />
        <Analytics />
        <GoogleAnalytics gaId="G-4TGRDR4SWF" />
      </body>
    </html>
  );
}
