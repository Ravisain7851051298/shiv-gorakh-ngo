import { FiEdit2, FiEye, FiTrash2, FiUsers } from "react-icons/fi";

export function getProfileCardName(profile) {
  const user = profile?.user && typeof profile.user === "object" ? profile.user : {};
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const profileUserId = typeof profile?.user === "string" ? profile.user : "";
  return user.name || user.fullName || fullName || user.email || (profileUserId ? `User ${profileUserId}` : "Unnamed profile");
}

export const getProfileName = getProfileCardName;

export default function ProfileCard({
  profile,
  label,
  color,
  summary,
  onView,
  onEdit,
  onDelete,
}) {
  const user = profile?.user && typeof profile.user === "object" ? profile.user : {};

  return (
    <li className={`overflow-hidden rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${color.card}`}>
      <div className={`-mx-5 -mt-5 mb-5 h-1.5 ${color.accent}`} />
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${color.icon}`}>
          <FiUsers />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-800">{getProfileCardName(profile)}</h3>
          <p className="mt-1 truncate text-xs text-slate-500">{user.email || "Email not provided"}</p>
          
        </div>
        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${color.badge}`}>
            {label}
          </span>
      </div>
      <p className="mt-4 line-clamp-2 min-h-10 text-sm text-slate-600">{summary}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200/70 pt-4">
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
          onClick={onView}
          type="button"
        >
          <FiEye /> View
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
          onClick={onEdit}
          type="button"
        >
          <FiEdit2 /> Edit
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white/80 px-3 py-2 text-xs font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 active:scale-95"
          onClick={onDelete}
          type="button"
        >
          <FiTrash2 /> Delete
        </button>
      </div>
    </li>
  );
}
