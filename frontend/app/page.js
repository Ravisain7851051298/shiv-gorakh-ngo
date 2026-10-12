import AboutSection from "../components/home/AboutSection";
import FeatureSection from "../components/home/FeatureSection";
import GetInvolvedSection from "../components/home/GetInvolvedSection";
import HomeHero from "@/components/home/HomeHero";
import MissionVisionSection from "@/components/home/MissionVisionSection";
import InitiativesSection from "../components/home/InitiativesSection";
import MediaSection from "../components/home/MediaSection";
import TrustProof from "../components/home/TrustProof";
import DonorSection from "@/components/home/TopDonations";
import FeedbackSection from "@/components/home/FeedbackSection";


export const metadata = {
  title: "Shiv Gorakh Welfare Foundation | Rampur, Uttar Pradesh",
  description: "Shiv Gorakh Welfare Foundation is a registered non-profit organization in Rampur, Uttar Pradesh, India. We work to improve the lives of underprivileged communities through education, healthcare, and social welfare initiatives.",
  openGraph: {
    title: "Shiv Gorakh Welfare Foundation | Rampur, Uttar Pradesh",
    description: "Shiv Gorakh Welfare Foundation is a registered non-profit organization in Rampur, Uttar Pradesh, India. We work to improve the lives of underprivileged communities through education, healthcare, and social welfare initiatives.",
    url: "https://shivgorakh.org.in",
    siteName: "Shiv Gorakh Welfare Foundation",
    images: [
      {
        url: "https://shivgorakh.org.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shiv Gorakh Welfare Foundation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <main>
        <HomeHero />
        <AboutSection />
        {/* <MissionVisionSection /> */}
        <InitiativesSection />
        <TrustProof />
        <DonorSection />
        <FeedbackSection />
        <GetInvolvedSection />
        <FeatureSection />
        <MediaSection />
      </main>
    </>
  );
}
