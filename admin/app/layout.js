import "./globals.css";
import Providers from "./providers";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata = {
  title: "Foundation Dashboard",
  description: "Administration dashboard for Shiv Gorakh Welfare Foundation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <DashboardLayout>{children}</DashboardLayout>
        </Providers>
      </body>
    </html>
  );
}
