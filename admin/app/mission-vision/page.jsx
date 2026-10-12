import ContentCollection from "@/components/dashboard/ContentCollection";

export const metadata = {
  title: "Mission & Vision Management | Shiv Gorakh Foundation Dashboard",
  description: "Create, edit, and manage foundation mission statements, vision declarations, and core values.",
};

export default function MissionVisionPage() {
  return <ContentCollection resource="mission-vision" />;
}
