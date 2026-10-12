import DonationManagement from "@/components/dashboard/DonationManagement";

export const metadata = {
  title: "Donation Management | Admin Dashboard",
  description: "Manage UPI ID, QR scanner image, bank credentials, and verify donor submissions.",
};

export default function DonationPage() {
  return <DonationManagement />;
}
