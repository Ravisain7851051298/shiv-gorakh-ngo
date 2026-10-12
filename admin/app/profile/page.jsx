import AdminProfileManagement from "@/components/dashboard/AdminProfileManagement";

export const metadata = {
  title: "Admin Profile | Shiv Gorakh Foundation Dashboard",
  description: "Manage administrator profile, email address, phone number, and avatar.",
};

export default function AdminProfilePage() {
  return <AdminProfileManagement />;
}
