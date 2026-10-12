import ContentCollection from "@/components/dashboard/ContentCollection";

export const metadata = {
  title: "News & Blogs Management | Shiv Gorakh Foundation Dashboard",
  description: "Publish, edit, and manage news announcements, updates, and blogs.",
};

export default function BlogsPage() {
  return <ContentCollection resource="blogs" />;
}
