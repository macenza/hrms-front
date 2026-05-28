import HeroSection from "@/components/marketing/home/heroSection";
import TrustedCompanies from "@/components/marketing/home/TrustedCompanies";
import FeaturesSection from "@/components/marketing/home/FeaturesSection";
import AnalyticsSection from "@/components/marketing/home/AnalyticsSection";
import StatsSection from "@/components/marketing/home/StatsSection";
import CTASection from "@/components/marketing/home/CTASection";
import RoleCardd from "@/components/marketing/home/RoleCard";

export default function Home() {
  return (
    <>
      <HeroSection/>
      <TrustedCompanies/>
      <FeaturesSection/>
      <AnalyticsSection/>
      <RoleCardd/>
      <StatsSection/>
      <CTASection/>
    </>
  );
}
