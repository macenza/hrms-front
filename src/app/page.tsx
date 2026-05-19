import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/layout/home/heroSection";
import TrustedCompanies from "@/components/layout/home/TrustedCompanies";
import FeaturesSection from "@/components/layout/home/FeaturesSection";
import AnalyticsSection from "@/components/layout/home/AnalyticsSection";
import Footer from "@/components/layout/home/Footer";
// import RolesCard from "@/components/layout/home/RoleCards";
import StatsSection from "@/components/layout/home/StatsSection";
import CTASection from "@/components/layout/home/CTASection";
import RoleCardd from "@/components/layout/home/RoleCard";

export default function Home() {
  return (
  <>
    <Navbar/>
    
    {/* <div style={{ textAlign: "center", marginTop: "100px" }}> */}
      
      <HeroSection/>
      <TrustedCompanies/>
      <FeaturesSection/>
      <AnalyticsSection/>
      <RoleCardd/>
      <StatsSection/>
      <CTASection/>

{/* <RoleCardd/> */}
      <Footer/>

      {/* <br /> */}
      
      {/* <Link href="/login">Go to Login</Link>
      <br />
      <Link href="/signup">Go to Signup</Link> */}
    {/* </div> */}
    </>
  );
}
