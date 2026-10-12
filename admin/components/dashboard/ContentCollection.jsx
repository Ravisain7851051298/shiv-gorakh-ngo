"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiImage,
  FiPlus,
  FiTrash2,
  FiX,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiUsers,
  FiSearch,
  FiPhone,
  FiMail,
  FiDownload,
  FiRefreshCw,
  FiUserCheck,
  FiEye,
  FiMapPin,
  FiCopy,
  FiMessageSquare,
  FiCheck,
} from "react-icons/fi";
import { CONTENT_COLLECTIONS } from "@/constants/dashboard";
import { getContentImageUrl, contentApi } from "@/lib/authApi";
import { createImageFormData } from "@/store/contentThunks";
import ImageCarousel from "@/components/dashboard/ImageCarousel";
import { deleteEvent, fetchEvents, updateEvent, createEvent } from "@/store/eventsSlice";
import { deleteGallery, fetchGalleries, updateGallery, createGallery } from "@/store/galleriesSlice";
import { deleteStory, fetchStories, updateStory, createStory } from "@/store/storiesSlice";
import { deleteProgram, fetchPrograms, updateProgram, createProgram } from "@/store/programsSlice";
import { deleteBlog, fetchBlogs, updateBlog, createBlog } from "@/store/blogsSlice";
import { deleteCampaign, fetchCampaigns, updateCampaign, createCampaign } from "@/store/campaignsSlice";
import { deleteCertificate, fetchCertificates, updateCertificate, createCertificate } from "@/store/certificatesSlice";
import { deleteMissionVision, fetchMissionVisions, updateMissionVision, createMissionVision } from "@/store/missionVisionSlice";

const resourceActions = {
  events: { fetchAll: fetchEvents, create: createEvent, update: updateEvent, remove: deleteEvent },
  galleries: { fetchAll: fetchGalleries, create: createGallery, update: updateGallery, remove: deleteGallery },
  stories: { fetchAll: fetchStories, create: createStory, update: updateStory, remove: deleteStory },
  programs: { fetchAll: fetchPrograms, create: createProgram, update: updateProgram, remove: deleteProgram },
  blogs: { fetchAll: fetchBlogs, create: createBlog, update: updateBlog, remove: deleteBlog },
  campaigns: { fetchAll: fetchCampaigns, create: createCampaign, update: updateCampaign, remove: deleteCampaign },
  certificates: { fetchAll: fetchCertificates, create: createCertificate, update: updateCertificate, remove: deleteCertificate },
  "mission-vision": { fetchAll: fetchMissionVisions, create: createMissionVision, update: updateMissionVision, remove: deleteMissionVision },
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-matroska",
];

function getItemId(item) {
  return item?._id ?? item?.id;
}

function getImageUrls(value) {
  return Array.isArray(value) ? value.filter((url) => typeof url === "string" && url) : [];
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function formatCurrency(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

export default function ContentCollection({ resource }) {
  const config = CONTENT_COLLECTIONS[resource];
  const actions = resourceActions[resource];
  const dispatch = useDispatch();
  const sliceState = useSelector((state) => state[config?.stateKey || resource]);
  const items = sliceState?.items || [];
  const loading = sliceState?.loading || false;
  const mutationLoading = sliceState?.mutationLoading || false;
  const error = sliceState?.error || null;

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formError, setFormError] = useState("");

  // Event Attendees Inspection State (Active when resource === "events")
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeesList, setAttendeesList] = useState([]);
  const [attendeesError, setAttendeesError] = useState("");
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState("All");
  const [updatingRsvpId, setUpdatingRsvpId] = useState(null);
  const [selectedAttendeeDetail, setSelectedAttendeeDetail] = useState(null);

  useEffect(() => {
    if (actions?.fetchAll) {
      dispatch(actions.fetchAll({ page: 1, limit: 50 }));
    }
  }, [dispatch, actions, resource]);

  function getEmptyForm() {
    const base = { title: "", description: "", date: "" };
    if (config?.customFields) {
      config.customFields.forEach((f) => {
        base[f.name] = f.type === "select" && f.options?.length ? f.options[0] : "";
      });
    }
    return base;
  }

  function openCreateForm() {
    setEditingItem(null);
    setForm(getEmptyForm());
    setSelectedFiles([]);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(item) {
    setEditingItem(item);
    const initialForm = {
      title: item.title || "",
      description: item.description || "",
      date: item.date ? toDateInputValue(item.date) : "",
    };
    if (config?.customFields) {
      config.customFields.forEach((f) => {
        initialForm[f.name] = item[f.name] ?? (f.type === "select" && f.options?.length ? f.options[0] : "");
      });
    }
    setForm(initialForm);
    setSelectedFiles([]);
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingItem(null);
    setForm(getEmptyForm());
    setSelectedFiles([]);
    setFormError("");
  }

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith("video/")) {
        setFormError(`File "${file.name}" is not an accepted format (JPEG, PNG, WebP, MP4, WebM, MOV).`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFormError(`File "${file.name}" exceeds the 100MB size limit.`);
        return false;
      }
      return true;
    });
    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 10));
    e.target.value = "";
  }

  function removeSelectedFile(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.title?.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!form.description?.trim()) {
      setFormError("Description is required.");
      return;
    }

    try {
      const payload = { ...form };
      if (config?.dateField && form.date) {
        payload.date = new Date(form.date).toISOString();
      }

      const formData = createImageFormData(payload, selectedFiles);

      if (editingItem) {
        await dispatch(actions.update({ id: getItemId(editingItem), formData })).unwrap();
        toast.success(`${config.itemLabel || "Item"} updated successfully!`);
      } else {
        await dispatch(actions.create(formData)).unwrap();
        toast.success(`${config.itemLabel || "Item"} created successfully!`);
      }

      closeForm();
    } catch (saveError) {
      setFormError(typeof saveError === "string" ? saveError : "Unable to save this item. Please try again.");
    }
  }

  async function removeItem(item) {
    const itemTitle = item.title || `this ${config.title.toLowerCase()} item`;
    if (!window.confirm(`Delete "${itemTitle}"? This action cannot be undone.`)) return;
    try {
      await dispatch(actions.remove(getItemId(item))).unwrap();
      toast.success(`"${itemTitle}" deleted.`);
    } catch {
      setFormError(`Unable to delete "${itemTitle}". Please try again.`);
    }
  }

  // ========================================================
  // Event Attendees Inspection Actions
  // ========================================================
  async function openAttendeesModal(event) {
    setSelectedEventForAttendees(event);
    setAttendeesModalOpen(true);
    setAttendeesLoading(true);
    setAttendeesError("");
    setAttendeeSearch("");
    setAttendeeStatusFilter("All");

    try {
      const eventId = getItemId(event);
      const res = await contentApi.get(`/events/${eventId}/attendees`);
      if (res.data?.success) {
        setAttendeesList(res.data.data || []);
      } else {
        setAttendeesError("Could not retrieve attendees list.");
      }
    } catch (err) {
      setAttendeesError(
        err.response?.data?.message || err.message || "Failed to load attendees list."
      );
    } finally {
      setAttendeesLoading(false);
    }
  }

  function closeAttendeesModal() {
    setAttendeesModalOpen(false);
    setSelectedEventForAttendees(null);
    setAttendeesList([]);
    setAttendeesError("");
  }

  async function updateAttendeeStatus(rsvpId, newStatus) {
    if (!selectedEventForAttendees) return;
    setUpdatingRsvpId(rsvpId);
    try {
      const eventId = getItemId(selectedEventForAttendees);
      const res = await contentApi.patch(`/events/${eventId}/attendees/${rsvpId}`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`RSVP updated to ${newStatus}`);
        setAttendeesList((prev) =>
          prev.map((r) => (r._id === rsvpId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update attendee status.");
    } finally {
      setUpdatingRsvpId(null);
    }
  }

  function handleExportAttendeesCsv() {
    if (!attendeesList.length || !selectedEventForAttendees) return;
    const headers = ["Name", "Email", "Phone", "Role", "ID Number", "Status", "Joined Date"];
    const rows = attendeesList.map((r) => [
      r.user?.name || "Anonymous",
      r.user?.email || "",
      r.user?.phone || "",
      r.user?.role || "User",
      r.user?.volunteerId || r.user?.memberId || "",
      r.status || "Confirmed",
      r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedTitle = (selectedEventForAttendees.title || "event").replace(/[^a-z0-9]/gi, "_");
    link.setAttribute("download", `${sanitizedTitle}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Attendee list exported to CSV!");
  }

  // Filtered Attendees
  const filteredAttendees = useMemo(() => {
    return attendeesList.filter((a) => {
      // Status filter
      if (attendeeStatusFilter !== "All" && a.status !== attendeeStatusFilter) {
        return false;
      }
      // Search filter
      if (attendeeSearch.trim()) {
        const q = attendeeSearch.toLowerCase();
        const name = (a.user?.name || "").toLowerCase();
        const email = (a.user?.email || "").toLowerCase();
        const phone = (a.user?.phone || "").toLowerCase();
        const role = (a.user?.role || "").toLowerCase();
        const idNum = (a.user?.volunteerId || a.user?.memberId || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !role.includes(q) && !idNum.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [attendeesList, attendeeStatusFilter, attendeeSearch]);

  if (!config) {
    return <div className="p-8 text-center text-red-500">Resource config not found for "{resource}"</div>;
  }

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">{config.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 active:scale-95 cursor-pointer"
          onClick={openCreateForm}
          type="button"
        >
          <FiPlus />
          Add {config.addLabel}
        </button>
      </div>

      {(error || formError) && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <span>{formError || error}</span>
          {formError && (
            <button aria-label="Dismiss error" onClick={() => setFormError("")} type="button">
              <FiX />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 animate-pulse">
          Loading {config.title.toLowerCase()}...
        </p>
      ) : items.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const images = getImageUrls(item.imageUrls).map(getContentImageUrl).filter(Boolean);

            // Calculation for Campaign Progress
            const isCampaign = resource === "campaigns";
            const target = Number(item.targetAmount || 0);
            const raised = Number(item.raisedAmount || 0);
            const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
            const attendeesCount = item.attendeesCount ?? item.rsvpsCount ?? 0;

            return (
              <li
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md"
                key={getItemId(item) ?? index}
              >
                {images.length ? (
                  <ImageCarousel images={images} title={item.title || config.title} />
                ) : item.videoUrl ? (
                  <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center text-white">
                    {item.videoUrl.includes("youtube.com") || item.videoUrl.includes("youtu.be") ? (
                      <iframe
                        src={item.videoUrl.replace("watch?v=", "embed/")}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    ) : (
                      <video src={getContentImageUrl(item.videoUrl)} controls className="h-full w-full object-contain" />
                    )}
                    <span className="absolute top-2 right-2 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                      🎥 Video
                    </span>
                  </div>
                ) : (
                  <div className="grid h-44 place-items-center bg-slate-100 text-slate-400">
                    <FiImage className="h-9 w-9" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  {/* Badges / Meta row */}
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {/* Category pill */}
                    {item.category && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-700">
                        {item.category}
                      </span>
                    )}
                    {/* Certificate type badge */}
                    {item.certificateType && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                        {item.certificateType}
                      </span>
                    )}
                    {/* Mission/Vision Type badge */}
                    {item.type && (
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                        {item.type}
                      </span>
                    )}
                    {item.order !== undefined && item.order !== null && item.order !== 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        #{item.order}
                      </span>
                    )}
                    {/* Status badge */}
                    {item.status && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          item.status === "Active" || item.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "Urgent"
                            ? "bg-rose-50 text-rose-700 animate-pulse"
                            : item.status === "Completed"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 line-clamp-2">
                    {item.title || "Untitled"}
                  </h3>

                  {/* Campaign Specific Progress */}
                  {isCampaign && (
                    <div className="mt-3 rounded-xl bg-orange-50/60 p-3">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">
                          Raised: <strong className="text-emerald-700 font-bold">{formatCurrency(raised)}</strong>
                        </span>
                        <span className="text-slate-500">Goal: {formatCurrency(target)}</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="mt-1 block text-right text-[10px] font-bold text-orange-700">
                        {percent}% Funded
                      </span>
                    </div>
                  )}

                  {/* EVENT SPECIFIC: ATTENDEE COUNT & PARTICIPATION STRIP */}
                  {resource === "events" && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => openAttendeesModal(item)}
                        className="w-full flex items-center justify-between rounded-xl bg-orange-50/80 border border-orange-200/90 p-3 text-xs text-orange-950 hover:bg-orange-100 hover:border-orange-300 transition group shadow-2xs cursor-pointer"
                      >
                        <span className="flex items-center gap-2 font-bold text-orange-900">
                          <span className="grid size-6 place-items-center rounded-lg bg-orange-200 text-orange-800 text-[11px]">
                            <FiUsers size={12} />
                          </span>
                          <span>{attendeesCount} {attendeesCount === 1 ? "Person" : "Persons"} Joined</span>
                        </span>
                        <span className="text-[11px] font-bold text-orange-700 group-hover:text-orange-900 flex items-center gap-1 underline">
                          <span>Who Joined</span>
                          <span>→</span>
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Certificate Specific details */}
                  {resource === "certificates" && (
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      {item.certificateNumber && (
                        <p><span className="text-slate-400">ID:</span> <span className="font-mono font-bold text-slate-800">{item.certificateNumber}</span></p>
                      )}
                      {item.recipientName && (
                        <p><span className="text-slate-400">Recipient:</span> <span className="font-medium text-slate-700">{item.recipientName}</span></p>
                      )}
                      {item.issuingAuthority && (
                        <p><span className="text-slate-400">Authority:</span> <span className="text-slate-700">{item.issuingAuthority}</span></p>
                      )}
                    </div>
                  )}

                  {/* Mission/Vision Specific details */}
                  {resource === "mission-vision" && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                      {item.tagline && (
                        <p className="italic text-slate-500">"{item.tagline}"</p>
                      )}
                      {Array.isArray(item.points) && item.points.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {item.points.slice(0, 3).map((pt, i) => (
                            <li className="flex items-start gap-1.5 text-xs text-slate-600" key={i}>
                              <span className="mt-0.5 text-orange-500 font-bold">•</span>
                              <span className="line-clamp-1">{pt}</span>
                            </li>
                          ))}
                          {item.points.length > 3 && (
                            <li className="text-[11px] text-slate-400 font-medium">
                              +{item.points.length - 3} more highlights
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Program Specific details */}
                  {resource === "programs" && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {item.location && <span>📍 {item.location}</span>}
                      {item.beneficiaries && <span>🎯 {item.beneficiaries}</span>}
                    </div>
                  )}

                  {/* Blog Specific details */}
                  {resource === "blogs" && item.author && (
                    <p className="mt-1 text-xs text-slate-400">By {item.author}</p>
                  )}

                  {item.date && (
                    <p className="mt-2 text-xs text-slate-400">
                      📅 {formatDate(item.date || item.createdAt)}
                    </p>
                  )}

                  {item.description && (
                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                      {item.summary || item.description}
                    </p>
                  )}

                  {/* Card Actions */}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    {resource === "events" ? (
                      <button
                        aria-label={`View attendees for ${item.title}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-800 shadow-2xs transition hover:bg-orange-100 hover:border-orange-300 active:scale-95 cursor-pointer"
                        onClick={() => openAttendeesModal(item)}
                        type="button"
                      >
                        <FiUsers size={12} /> Who Joined ({attendeesCount})
                      </button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`Edit ${item.title || config.title}`}
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 active:scale-95 cursor-pointer"
                        onClick={() => openEditForm(item)}
                        type="button"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        aria-label={`Delete ${item.title || config.title}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 active:scale-95 cursor-pointer"
                        onClick={() => removeItem(item)}
                        type="button"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FiImage className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-base font-semibold text-slate-700">No {config.title.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-slate-500">Click "Add {config.addLabel}" to publish the first one.</p>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORM MODAL (CREATE / EDIT)                               */}
      {/* ======================================================== */}
      {formOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            aria-labelledby="content-form-title"
            aria-modal="true"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl"
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 via-white to-white px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800" id="content-form-title">
                  {editingItem ? `Edit ${config.itemLabel}` : `Add new ${config.itemLabel}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingItem ? "Update the details and save changes." : "Fill in the required information."}
                </p>
              </div>
              <button
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                onClick={closeForm}
                type="button"
              >
                <FiX />
              </button>
            </div>

            <form className="grid gap-4 p-6" onSubmit={handleFormSubmit}>
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Title input */}
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                Title / Headline *
                <input
                  className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 font-normal outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  name="title"
                  onChange={updateField}
                  required
                  placeholder={`Enter ${config.itemLabel.toLowerCase()} title...`}
                  value={form.title || ""}
                />
              </label>

              {/* Custom fields */}
              {config.customFields?.map((field) => (
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700" key={field.name}>
                  {field.label} {field.required ? "*" : ""}
                  {field.type === "select" ? (
                    <select
                      className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 font-normal outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                      name={field.name}
                      onChange={updateField}
                      value={form[field.name] || ""}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "number" ? (
                    <input
                      className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 font-normal outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                      name={field.name}
                      onChange={updateField}
                      placeholder={field.placeholder || ""}
                      type="number"
                      min={0}
                      value={form[field.name] ?? ""}
                    />
                  ) : (
                    <input
                      className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 font-normal outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                      name={field.name}
                      onChange={updateField}
                      placeholder={field.placeholder || ""}
                      value={form[field.name] || ""}
                    />
                  )}
                </label>
              ))}

              {/* Date Input */}
              {config.dateField && (
                <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                  Date & Time
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 font-normal outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    name="date"
                    onChange={updateField}
                    type="datetime-local"
                    value={form.date || ""}
                  />
                </label>
              )}

              {/* Description textarea */}
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                Description / Details *
                <textarea
                  className="min-h-28 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 font-normal outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  maxLength={10000}
                  name="description"
                  onChange={updateField}
                  required
                  placeholder={`Provide detailed information about this ${config.itemLabel}...`}
                  value={form.description || ""}
                />
              </label>

              {/* Image / Video Upload */}
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
                {config.allowVideos ? "Upload Photos & Video Recordings" : "Upload Images / Scans"}
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/ogg,video/x-matroska"
                  className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-normal transition hover:border-orange-300 hover:bg-orange-50/50 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:font-semibold file:text-orange-700 file:transition-colors hover:file:bg-orange-200"
                  multiple
                  onChange={handleFileChange}
                  type="file"
                />
                <span className="text-xs font-normal text-slate-500">
                  {config.allowVideos
                    ? "Upload up to 10 photos or video recordings (JPEG, PNG, WebP, MP4, WebM, MOV; max 100MB each)."
                    : "Upload up to 10 images (JPEG, PNG, WebP; max 100MB each)."}
                </span>

                {/* Existing Images / Videos */}
                {editingItem && getImageUrls(editingItem.imageUrls).length > 0 && (
                  <div className="mt-2 grid gap-1.5">
                    <span className="text-xs font-normal text-slate-500">
                      {getImageUrls(editingItem.imageUrls).length} saved file{getImageUrls(editingItem.imageUrls).length === 1 ? "" : "s"}:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {getImageUrls(editingItem.imageUrls).map((media, index) => {
                        const isVideo = /\.(mp4|webm|mov|ogv|mkv)$/i.test(media);
                        return isVideo ? (
                          <div
                            key={`${media}-${index}`}
                            className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-black border border-slate-200 flex items-center justify-center text-white"
                          >
                            <video src={getContentImageUrl(media)} className="h-full w-full object-cover" preload="metadata" />
                            <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-white">
                              🎥 Video
                            </span>
                          </div>
                        ) : (
                          <div
                            aria-label={`Saved image ${index + 1}`}
                            className="h-20 w-24 shrink-0 rounded-lg bg-cover bg-center border border-slate-200"
                            key={`${media}-${index}`}
                            role="img"
                            style={{ backgroundImage: `url("${getContentImageUrl(media)}")` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Newly Selected Files */}
                {selectedFiles.length > 0 && (
                  <ul className="grid gap-2 pt-2">
                    {selectedFiles.map((file, index) => (
                      <li className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700" key={`${file.name}-${index}`}>
                        <span className="truncate">{file.name}</span>
                        <button
                          aria-label={`Remove ${file.name}`}
                          className="rounded p-1 text-slate-500 hover:text-red-600"
                          onClick={() => removeSelectedFile(index)}
                          type="button"
                        >
                          <FiX />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </label>

              {/* Form Actions */}
              <div className="sticky bottom-0 -mx-6 mt-2 flex justify-end gap-3 border-t border-slate-100 bg-white/95 px-6 pb-1 pt-4 backdrop-blur sm:-mx-7 sm:px-7">
                <button
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                  disabled={mutationLoading}
                  onClick={closeForm}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 active:scale-95 disabled:opacity-60 cursor-pointer"
                  disabled={mutationLoading}
                  type="submit"
                >
                  {mutationLoading ? "Saving..." : editingItem ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* ATTENDEES INSPECTION MODAL (WHO JOINED THIS EVENT)       */}
      {/* ======================================================== */}
      {attendeesModalOpen && selectedEventForAttendees && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-3 sm:p-6 backdrop-blur-sm">
          <section
            aria-labelledby="attendees-modal-title"
            aria-modal="true"
            className="my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[92vh]"
            role="dialog"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 via-white to-white px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Event Roster
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    📅 {formatDate(selectedEventForAttendees.date)}
                  </span>
                </div>
                <h3 className="mt-1 text-xl font-serif font-bold text-slate-900" id="attendees-modal-title">
                  Participants for: {selectedEventForAttendees.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAttendeesModal(selectedEventForAttendees)}
                  disabled={attendeesLoading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                  title="Refresh list"
                >
                  <FiRefreshCw className={attendeesLoading ? "animate-spin text-orange-600" : ""} size={12} />
                  <span>Refresh</span>
                </button>

                {attendeesList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportAttendeesCsv}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100 transition cursor-pointer"
                    title="Export attendee list to CSV"
                  >
                    <FiDownload size={12} />
                    <span>Export CSV</span>
                  </button>
                )}

                <button
                  aria-label="Close attendees modal"
                  className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
                  onClick={closeAttendeesModal}
                  type="button"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Metrics Quick Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50/70 border-b border-slate-100">
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Joined
                </span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">
                  {attendeesList.length}
                </span>
                <span className="text-[11px] text-orange-600 font-semibold">Registered Attendees</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Confirmed
                </span>
                <span className="text-2xl font-black text-emerald-700 block mt-0.5">
                  {attendeesList.filter((a) => a.status === "Confirmed").length}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">Ready to Attend</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Attended
                </span>
                <span className="text-2xl font-black text-blue-700 block mt-0.5">
                  {attendeesList.filter((a) => a.status === "Attended").length}
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">Marked Present</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Cancelled
                </span>
                <span className="text-2xl font-black text-slate-400 block mt-0.5">
                  {attendeesList.filter((a) => a.status === "Cancelled").length}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">Withdrawn RSVPs</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status Filter Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                {["All", "Confirmed", "Attended", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAttendeeStatusFilter(st)}
                    className={`rounded-lg px-3.5 py-1.5 transition cursor-pointer ${
                      attendeeStatusFilter === st
                        ? "bg-white text-orange-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, role..."
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                {attendeeSearch && (
                  <button
                    type="button"
                    onClick={() => setAttendeeSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Attendees Body / Table */}
            <div className="flex-1 overflow-y-auto p-5">
              {attendeesLoading ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="animate-pulse flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-36 rounded bg-slate-200" />
                          <div className="h-3 w-48 rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="h-7 w-24 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : attendeesError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                  <p className="font-semibold">{attendeesError}</p>
                  <button
                    type="button"
                    onClick={() => openAttendeesModal(selectedEventForAttendees)}
                    className="mt-3 rounded-full bg-orange-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-700 cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredAttendees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <tr>
                        <th className="rounded-l-xl px-4 py-3">Participant</th>
                        <th className="px-4 py-3">Contact Details</th>
                        <th className="px-4 py-3">Role / ID</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Joined On</th>
                        <th className="px-4 py-3">RSVP Status</th>
                        <th className="rounded-r-xl px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAttendees.map((rsvp) => {
                        const user = rsvp.user || {};
                        const userInitials = (user.name || "SG")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();
                        const isUpdating = updatingRsvpId === rsvp._id;
                        const roleLabel = user.role || "User";
                        const idCardNum = user.volunteerId || user.memberId || rsvp.officialId || null;

                        return (
                          <tr key={rsvp._id} className="hover:bg-slate-50/80 transition">
                            {/* Participant Name & Avatar */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                {user.profilePicture ? (
                                  <img
                                    src={getContentImageUrl(user.profilePicture)}
                                    alt={user.name}
                                    className="size-9 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="grid size-9 place-items-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200">
                                    {userInitials}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{user.name || "Anonymous Member"}</p>
                                  {idCardNum && (
                                    <p className="font-mono text-[10px] text-slate-400">{idCardNum}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Contact Details */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-0.5">
                                {user.email && (
                                  <a
                                    href={`mailto:${user.email}`}
                                    className="flex items-center gap-1.5 text-slate-600 hover:text-orange-600 transition"
                                  >
                                    <FiMail size={11} className="text-slate-400" />
                                    <span>{user.email}</span>
                                  </a>
                                )}
                                {(user.phone || rsvp.phone) && (
                                  <a
                                    href={`tel:${user.phone || rsvp.phone}`}
                                    className="flex items-center gap-1.5 text-slate-600 hover:text-orange-600 transition font-medium"
                                  >
                                    <FiPhone size={11} className="text-slate-400" />
                                    <span>{user.phone || rsvp.phone}</span>
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* Role badge */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  roleLabel === "volunteer"
                                    ? "bg-orange-100 text-orange-800"
                                    : roleLabel === "member"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {roleLabel}
                              </span>
                            </td>

                            {/* Location */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                                <FiMapPin size={11} className="text-slate-400 shrink-0" />
                                <span>{rsvp.city || "Rampur"}</span>
                              </div>
                              {rsvp.emergencyContact?.name && (
                                <p className="text-[10px] text-amber-700 mt-0.5" title={`Emergency: ${rsvp.emergencyContact.phone || ''}`}>
                                  🚨 {rsvp.emergencyContact.name}
                                </p>
                              )}
                            </td>

                            {/* Joined Timestamp */}
                            <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                              {rsvp.createdAt
                                ? new Date(rsvp.createdAt).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </td>

                            {/* RSVP Status */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  rsvp.status === "Attended"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : rsvp.status === "Confirmed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}
                              >
                                {rsvp.status}
                              </span>
                            </td>

                            {/* Status Change Dropdown / Action */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedAttendeeDetail(rsvp)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition shadow-2xs cursor-pointer"
                                  title="View complete attendee profile & details"
                                >
                                  <FiEye size={11} />
                                  <span>Details</span>
                                </button>

                                {rsvp.status !== "Attended" && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => updateAttendeeStatus(rsvp._id, "Attended")}
                                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer disabled:opacity-50"
                                    title="Mark as attended"
                                  >
                                    <FiUserCheck size={11} />
                                    <span>Attended</span>
                                  </button>
                                )}

                                {rsvp.status !== "Confirmed" && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => updateAttendeeStatus(rsvp._id, "Confirmed")}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                                    title="Set confirmed"
                                  >
                                    <FiCheckCircle size={11} />
                                    <span>Confirmed</span>
                                  </button>
                                )}

                                {rsvp.status !== "Cancelled" && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => updateAttendeeStatus(rsvp._id, "Cancelled")}
                                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer disabled:opacity-50"
                                    title="Cancel RSVP"
                                  >
                                    <FiX size={11} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                  <FiUsers className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-base font-semibold text-slate-700">
                    {attendeeSearch || attendeeStatusFilter !== "All"
                      ? "No participants match this filter."
                      : "No participants have joined this event yet."}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {attendeeSearch || attendeeStatusFilter !== "All"
                      ? "Try clearing your search keyword or changing status tabs."
                      : "When volunteers or registered members join this camp via the website portal, their full details will appear here."}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredAttendees.length} of {attendeesList.length} participant{attendeesList.length === 1 ? "" : "s"}
              </span>

              <button
                type="button"
                onClick={closeAttendeesModal}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Full Attendee Profile Inspection Modal */}
      {selectedAttendeeDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                  <FiUsers size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Participant Full Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete registration details &amp; contact information
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAttendeeDetail(null)}
                className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Profile Bar */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                {selectedAttendeeDetail.user?.profilePicture ? (
                  <img
                    src={getContentImageUrl(selectedAttendeeDetail.user.profilePicture)}
                    alt=""
                    className="size-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="grid size-14 place-items-center rounded-2xl bg-orange-100 text-orange-800 font-bold text-lg border border-orange-200">
                    {(selectedAttendeeDetail.user?.name || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">
                      {selectedAttendeeDetail.user?.name || "Anonymous Member"}
                    </h4>
                    <span className="rounded-full bg-orange-100 px-2 py-0.2 text-[10px] font-bold uppercase text-orange-800">
                      {selectedAttendeeDetail.user?.role || "Member"}
                    </span>
                  </div>
                  {selectedAttendeeDetail.officialId && (
                    <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                      <span className="text-slate-400">Official ID:</span>
                      <strong className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {selectedAttendeeDetail.officialId}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Communications */}
              <div className="grid grid-cols-2 gap-2">
                {(selectedAttendeeDetail.user?.phone || selectedAttendeeDetail.phone) && (
                  <>
                    <a
                      href={`tel:${selectedAttendeeDetail.user?.phone || selectedAttendeeDetail.phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                    >
                      <FiPhone size={13} className="text-orange-500" />
                      <span>Call {selectedAttendeeDetail.user?.phone || selectedAttendeeDetail.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${String(selectedAttendeeDetail.user?.phone || selectedAttendeeDetail.phone).replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                    >
                      <FiMessageSquare size={13} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </>
                )}
                {selectedAttendeeDetail.user?.email && (
                  <a
                    href={`mailto:${selectedAttendeeDetail.user.email}`}
                    className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                  >
                    <FiMail size={13} className="text-blue-500" />
                    <span>Send Email ({selectedAttendeeDetail.user.email})</span>
                  </a>
                )}
              </div>

              {/* Location & Emergency Contact Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Location &amp; Emergency Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">City / Location</span>
                    <span className="font-semibold text-slate-800">
                      {selectedAttendeeDetail.city || "Rampur"},{" "}
                      {selectedAttendeeDetail.state || "Uttar Pradesh"}
                    </span>
                  </div>
                  {selectedAttendeeDetail.address && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Address</span>
                      <span className="font-semibold text-slate-800">
                        {selectedAttendeeDetail.address}
                        {selectedAttendeeDetail.pincode ? ` - ${selectedAttendeeDetail.pincode}` : ""}
                      </span>
                    </div>
                  )}
                  {selectedAttendeeDetail.emergencyContact && (
                    <div className="col-span-2 border-t border-slate-200/60 pt-2">
                      <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                      <span className="font-semibold text-slate-800">
                        {selectedAttendeeDetail.emergencyContact.name}{" "}
                        {selectedAttendeeDetail.emergencyContact.relationship
                          ? `(${selectedAttendeeDetail.emergencyContact.relationship})`
                          : ""}
                        {selectedAttendeeDetail.emergencyContact.phone
                          ? ` • 📞 ${selectedAttendeeDetail.emergencyContact.phone}`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Volunteer Skills (if available) */}
              {selectedAttendeeDetail.volunteerDetails && (
                <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-900 block">
                    Volunteer Capabilities &amp; Skills
                  </span>
                  {selectedAttendeeDetail.volunteerDetails.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAttendeeDetail.volunteerDetails.skills.map((sk) => (
                        <span key={sk} className="rounded-md bg-white border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedAttendeeDetail.volunteerDetails.experience && (
                    <p className="text-slate-600 text-[11px]">
                      <strong>Experience:</strong> {selectedAttendeeDetail.volunteerDetails.experience}
                    </p>
                  )}
                </div>
              )}

              {/* Event Registration Meta */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    RSVP Status
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      selectedAttendeeDetail.status === "Attended"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : selectedAttendeeDetail.status === "Confirmed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {selectedAttendeeDetail.status}
                  </span>
                </div>
                <p className="text-slate-600">
                  Joined on:{" "}
                  <strong>
                    {selectedAttendeeDetail.createdAt
                      ? new Date(selectedAttendeeDetail.createdAt).toLocaleString("en-IN")
                      : "N/A"}
                  </strong>
                </p>

                {/* Instant Status Switcher Inside Modal */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  {selectedAttendeeDetail.status !== "Attended" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateAttendeeStatus(selectedAttendeeDetail._id, "Attended")
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                    >
                      <FiUserCheck size={12} />
                      <span>Mark Attended</span>
                    </button>
                  )}
                  {selectedAttendeeDetail.status !== "Confirmed" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateAttendeeStatus(selectedAttendeeDetail._id, "Confirmed")
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <FiCheckCircle size={12} />
                      <span>Confirm RSVP</span>
                    </button>
                  )}
                  {selectedAttendeeDetail.status !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateAttendeeStatus(selectedAttendeeDetail._id, "Cancelled")
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
                    >
                      <FiX size={12} />
                      <span>Cancel RSVP</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-3">
              <button
                type="button"
                onClick={() => setSelectedAttendeeDetail(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
