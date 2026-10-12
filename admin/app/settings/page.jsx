import NgoSettingsManagement from "@/components/dashboard/NgoSettingsManagement";

export const metadata = {
  title: "NGO & Contact Settings | Admin Dashboard",
  description: "Manage NGO profile, branding logo, founder details, contact info, and website metadata.",
};

export default function SettingsPage() {
  return <NgoSettingsManagement />;
}
