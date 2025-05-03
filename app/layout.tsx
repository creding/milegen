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
  title: "Milegen - Mileage Log Generator",
  description:
    "Create compliant mileage logs for tax deduction or reimbursement with Milegen",
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
        <GoogleAnalytics gaId="G-P9624TGV6Q" />
      </body>
    </html>
  );
}
