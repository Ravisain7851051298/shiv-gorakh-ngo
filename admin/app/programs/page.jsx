import ContentCollection from "@/components/dashboard/ContentCollection";

export const metadata = {
  title: "Programs Management | Shiv Gorakh Foundation Dashboard",
  description: "Create, edit, and manage foundation welfare programs.",
};

export default function ProgramsPage() {
  return <ContentCollection resource="programs" />;
}
