import ContentCollection from "@/components/dashboard/ContentCollection";

export const metadata = {
  title: "Campaigns Management | Shiv Gorakh Foundation Dashboard",
  description: "Create, edit, and track fundraising and relief campaigns.",
};

export default function CampaignsPage() {
  return <ContentCollection resource="campaigns" />;
}
