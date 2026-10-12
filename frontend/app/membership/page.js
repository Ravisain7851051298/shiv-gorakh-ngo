import Image from "next/image";
import Link from "next/link";
import MembershipPortal from "@/components/MembershipPortal";

export const metadata = { title: "Membership | Shiv Gorakh Welfare Foundation", description: "Connect with Shiv Gorakh Welfare Foundation to learn about membership and community participation." };

export default function MembershipPage() {
  return (
    <main>
      <div id="membership-portal">
        <MembershipPortal />
      </div>
    </main>
  );
}
