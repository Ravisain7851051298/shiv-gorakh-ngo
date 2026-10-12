import ProfileCard from "@/components/dashboard/ProfileCard";

const STATUS_COLORS = {
  ACTIVE: {
    card: "border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-white",
    accent: "bg-emerald-500",
    icon: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
  },
  INACTIVE: {
    card: "border-slate-200 bg-gradient-to-br from-slate-100/80 via-white to-white",
    accent: "bg-slate-400",
    icon: "bg-slate-200 text-slate-700",
    badge: "bg-slate-200 text-slate-700",
  },
  SUSPENDED: {
    card: "border-rose-200 bg-gradient-to-br from-rose-50/90 via-white to-white",
    accent: "bg-rose-500",
    icon: "bg-rose-100 text-rose-700",
    badge: "bg-rose-100 text-rose-800",
  },
};

const DEFAULT_COLOR = {
  card: "border-slate-200 bg-white",
  accent: "bg-slate-300",
  icon: "bg-slate-100 text-slate-600",
  badge: "bg-slate-100 text-slate-600",
};

export default function VolunteerProfileCard({ profile, onView, onEdit, onDelete }) {
  const status = profile.status || "UNKNOWN";
  const color = STATUS_COLORS[status] || DEFAULT_COLOR;

  return (
    <ProfileCard
      color={color}
      label={status}
      onDelete={onDelete}
      onEdit={onEdit}
      onView={onView}
      profile={profile}
      summary={profile.experience || profile.skills?.join(", ") || "No experience details provided."}
    />
  );
}
