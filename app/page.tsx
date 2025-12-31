import { LoginModal } from "@/components/auth/LoginModal";
import { SignupModal } from "@/components/auth/SignupModal";
import {
  HeroSection,
  TrustSection,
  StepsSection,
  BenefitsSection,
  TestimonialsSection,
  PricingSection,
  FinalCTA,
  SEOSection,
} from "@/components/homepage";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MileGen - Generate IRS-Compliant Mileage Logs in Minutes",
  description:
    "Create professional, IRS-compliant mileage logs in under 2 minutes. Join 5,000+ professionals saving time and maximizing tax deductions with MileGen.",
  keywords:
    "mileage log, IRS compliant, tax deduction, business miles, mileage tracking, mileage calculator, tax documentation, mileage log generator",
  openGraph: {
    title: "MileGen - Generate IRS-Compliant Mileage Logs in Minutes",
    description:
      "Create IRS-compliant mileage logs in minutes. Maximize tax deductions and protect yourself from audits.",
    url: "https://milegen.us",
    siteName: "MileGen",
    locale: "en_US",
    type: "website",
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ login: string; signup: string }>;
}) {
  const { login, signup } = await searchParams;
  return (
    <>
      <HeroSection />
      <TrustSection />
      <StepsSection />
      <BenefitsSection />
      <TestimonialsSection />
      <PricingSection />
      <SEOSection />
      <FinalCTA />
      {login === "true" && <LoginModal />}
      {signup === "true" && <SignupModal />}
    </>
  );
}
