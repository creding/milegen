import { Inter } from "next/font/google";
import "./globals.css";
import "./print.css";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Analytics } from "@vercel/analytics/react";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { theme } from "@/theme/theme";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Milegen - Mileage Log Generator",
  description:
    "Create compliant mileage logs for tax deduction or reimbursement with Milegen",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <MantineProvider theme={theme}>
          <Notifications position="top-right" />
          <Nav />
          <main>{children}</main>
          <Footer />
        </MantineProvider>
        <SpeedInsights />
        <Analytics />
        <GoogleAnalytics gaId="G-P9624TGV6Q" />
      </body>
    </html>
  );
}
