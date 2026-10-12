import ServicesView from "@/components/services/ServicesView";

export const metadata = {
  title: "Our Services & Animal Welfare Facilities | Shiv Gorakh Foundation",
  description:
    "Explore round-the-clock emergency animal ambulance rescue, trauma surgery, daily feeding drives, anti-rabies vaccination, and lifetime sanctuary care in Rampur.",
  openGraph: {
    title: "Our Services | Shiv Gorakh Welfare Foundation",
    description:
      "Explore 24/7 rescue, mobile animal ambulance, trauma healthcare, and welfare drives across Rampur.",
    url: "https://shivgorakh.org.in/our-services",
  },
};

export default function OurServicesPage() {
  return <ServicesView />;
}
