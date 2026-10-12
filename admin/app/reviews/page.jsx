import FeedbackManagement from "@/components/dashboard/FeedbackManagement";

export const metadata = {
  title: "Reviews & Feedback Management | Shiv Gorakh Foundation Dashboard",
  description: "View community feedback with full account details, moderate reviews, and perform CRUD operations.",
};

export default function ReviewsPage() {
  return <FeedbackManagement />;
}
