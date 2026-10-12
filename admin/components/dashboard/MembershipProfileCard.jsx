import ProfileCard from "@/components/dashboard/ProfileCard";

const MEMBERSHIP_COLORS = {
  Basic: {
    card: "border-sky-200 bg-gradient-to-br from-sky-50/80 via-white to-white",
    accent: "bg-sky-500",
    icon: "bg-sky-100 text-sky-700",
    badge: "bg-sky-100 text-sky-800",
  },
  Premium: {
    card: "border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-white",
    accent: "bg-violet-500",
    icon: "bg-violet-100 text-violet-700",
    badge: "bg-violet-100 text-violet-800",
  },
  VIP: {
    card: "border-amber-300 bg-gradient-to-br from-amber-50/90 via-white to-white",
    accent: "bg-amber-500",
    icon: "bg-amber-100 text-amber-800",
    badge: "bg-amber-100 text-amber-900",
  },
};

const DEFAULT_COLOR = {
  card: "border-slate-200 bg-white",
  accent: "bg-slate-300",
  icon: "bg-slate-100 text-slate-600",
  badge: "bg-slate-100 text-slate-600",
};

export default function MembershipProfileCard({ profile, onView, onEdit, onDelete }) {
  const membershipType = profile.membershipType || "Unknown";

  return (
    <ProfileCard
      color={MEMBERSHIP_COLORS[membershipType] || DEFAULT_COLOR}
      label={membershipType}
      onDelete={onDelete}
      onEdit={onEdit}
      onView={onView}
      profile={profile}
      summary={[profile.city, profile.state].filter(Boolean).join(", ") || "No address provided."}
    />
  );
}
