import { LoginModal } from "@/components/auth/LoginModal";
import { SignupModal } from "@/components/auth/SignupModal";
import {
  HeroSection,
  StepsSection,
  CTASection,
  SEOSection,
} from "@/components/homepage";

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
    url: "https://milegen.com",
    siteName: "MileGen",
    locale: "en_US",
    type: "website",
  },
};

export default function Home({
  searchParams: { login, signup },
}: {
  searchParams: { login: string; signup: string };
}) {
  return (
    <>
      <HeroSection />
      <StepsSection />
      <CTASection />
      <SEOSection />
      {login === "true" && <LoginModal />}
      {signup === "true" && <SignupModal />}
    </>
  );
}
