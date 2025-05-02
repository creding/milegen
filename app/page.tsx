import { LoginModal } from "@/components/auth/LoginModal";
import {
  HeroSection,
  StepsSection,
  CTASection,
  SEOSection,
} from "@/components/homepage";
import { createClient } from "@/lib/supabaseServerClient";

import { Metadata } from "next";

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
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ login: string }>;
}) {
  const { login } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <>
      <HeroSection user={user} />
      <StepsSection user={user} />
      <CTASection user={user} />
      <SEOSection />
      {login === "true" && <LoginModal />}
    </>
  );
}
