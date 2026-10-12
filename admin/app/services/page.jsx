import ContentCollection from "@/components/dashboard/ContentCollection";

export const metadata = {
  title: "Our Services Management | Shiv Gorakh Foundation Dashboard",
  description: "Create, edit, and manage NGO services, rescue facilities, and emergency care drives.",
};

export default function ServicesPage() {
  return <ContentCollection resource="services" />;
}
