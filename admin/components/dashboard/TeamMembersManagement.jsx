"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiUserCheck,
  FiUsers,
  FiMail,
  FiPhone,
  FiUploadCloud,
  FiX,
  FiCheck,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
  FiFacebook,
  FiArrowUp,
  FiRefreshCw,
  FiEye,
} from "react-icons/fi";
import { contentApi, getContentImageUrl } from "@/lib/authApi";

const DEPARTMENTS = [
  "All",
  "Leadership & Board",
  "Veterinary & Medical Care",
  "Field Rescue Operations",
  "Community & Volunteer Force",
  "Advisory Board",
  "Administration & Accounts",
];

const POSITION_SUGGESTIONS = [
  "Founder & President",
  "Co-Founder & Secretary",
  "Managing Trustee",
  "Treasurer & Finance Head",
  "Chief Veterinary Surgeon",
  "Lead Field Rescue Coordinator",
  "Animal Welfare Inspector",
  "Senior Volunteer Lead",
  "Public Relations & Outreach Head",
  "Legal & Regulatory Advisor",
];

export default function TeamMembersManagement() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "Leadership & Board",
    bio: "",
    email: "",
    phone: "",
    order: 0,
    status: "Active",
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  async function loadTeamMembers() {
    setLoading(true);
    try {
      const res = await contentApi.get("/team-members");
      if (res.data?.success) {
        setMembers(res.data.items || res.data.teamMembers || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeamMembers();
  }, []);

  function handleOpenCreateModal() {
    setEditingMember(null);
    setFormData({
      name: "",
      position: "",
      department: "Leadership & Board",
      bio: "",
      email: "",
      phone: "",
      order: members.length + 1,
      status: "Active",
      linkedin: "",
      twitter: "",
      instagram: "",
      facebook: "",
    });
    setSelectedImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  }

  function handleOpenEditModal(member) {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      position: member.position || "",
      department: member.department || "Leadership & Board",
      bio: member.bio || "",
      email: member.email || "",
      phone: member.phone || "",
      order: member.order ?? 0,
      status: member.status || "Active",
      linkedin: member.socialLinks?.linkedin || "",
      twitter: member.socialLinks?.twitter || "",
      instagram: member.socialLinks?.instagram || "",
      facebook: member.socialLinks?.facebook || "",
    });
    setSelectedImageFile(null);
    setImagePreview(member.image ? getContentImageUrl(member.image) : "");
    setIsModalOpen(true);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file must be under 10MB");
        return;
      }
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please provide member name.");
      return;
    }
    if (!formData.position.trim()) {
      toast.error("Please provide member position/role in NGO.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("position", formData.position.trim());
      payload.append("department", formData.department.trim());
      payload.append("bio", formData.bio.trim());
      payload.append("email", formData.email.trim());
      payload.append("phone", formData.phone.trim());
      payload.append("order", String(formData.order || 0));
      payload.append("status", formData.status);

      payload.append(
        "socialLinks",
        JSON.stringify({
          linkedin: formData.linkedin.trim(),
          twitter: formData.twitter.trim(),
          instagram: formData.instagram.trim(),
          facebook: formData.facebook.trim(),
        })
      );

      if (selectedImageFile) {
        payload.append("image", selectedImageFile);
      }

      let res;
      if (editingMember) {
        res = await contentApi.put(`/team-members/${editingMember._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await contentApi.post("/team-members", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data?.success) {
        toast.success(
          editingMember
            ? "Team member updated successfully!"
            : "New team member added successfully!"
        );
        setIsModalOpen(false);
        loadTeamMembers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save team member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteModalItem) return;
    setDeleting(true);
    try {
      const res = await contentApi.delete(`/team-members/${deleteModalItem._id}`);
      if (res.data?.success) {
        toast.success("Team member deleted successfully.");
        setDeleteModalItem(null);
        loadTeamMembers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete team member.");
    } finally {
      setDeleting(false);
    }
  }

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (selectedDept !== "All" && m.department !== selectedDept) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchPos = m.position?.toLowerCase().includes(q);
        const matchDept = m.department?.toLowerCase().includes(q);
        const matchBio = m.bio?.toLowerCase().includes(q);
        if (!matchName && !matchPos && !matchDept && !matchBio) return false;
      }
      return true;
    });
  }, [members, selectedDept, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "Active").length;
    const leadership = members.filter(
      (m) => m.department?.includes("Leadership") || m.position?.toLowerCase().includes("president") || m.position?.toLowerCase().includes("trustee")
    ).length;
    const fieldOrMedical = members.filter(
      (m) => m.department?.includes("Veterinary") || m.department?.includes("Field") || m.department?.includes("Rescue")
    ).length;
    return { total, active, leadership, fieldOrMedical };
  }, [members]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Governance & Foundation Leadership
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            NGO Team Members
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage trustees, founders, veterinary surgeons, and on-ground team leads displayed on the public website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadTeamMembers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition disabled:opacity-50"
            title="Refresh list"
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin text-orange-600" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition"
          >
            <FiPlus size={15} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Team</span>
            <span className="grid size-8 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <FiUsers size={16} />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Registered Officials</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Status</span>
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <FiUserCheck size={16} />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-700">{stats.active}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Live on Public Site</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Trustees &amp; Board</span>
            <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <FiUsers size={16} />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{stats.leadership}</div>
          <span className="text-[11px] text-slate-400">Governance Level</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Field &amp; Medical</span>
            <span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <FiUserCheck size={16} />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{stats.fieldOrMedical}</div>
          <span className="text-[11px] text-slate-400">Rescue &amp; Vet Leads</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
        {/* Department Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search team member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Team Members List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <FiRefreshCw className="animate-spin inline-block mr-2" size={16} />
            Loading team members...
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
            {filteredMembers.map((member) => {
              const imageUrl = member.image ? getContentImageUrl(member.image) : "";
              const initials = (member.name || "SG")
                .split(" ")
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={member._id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all"
                >
                  <div>
                    {/* Header with Photo & Badge */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative size-16 shrink-0 rounded-2xl overflow-hidden border-2 border-orange-200 bg-orange-50">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={member.name}
                            className="size-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="grid size-full place-items-center bg-linear-to-br from-orange-400 to-amber-500 text-white font-bold text-lg">
                            {initials}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
                            member.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                          title={member.status}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200/60 truncate max-w-[130px]">
                            {member.department || "General"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{member.order || 0}
                          </span>
                        </div>

                        <h3 className="font-serif text-base font-bold text-slate-900 mt-1 truncate">
                          {member.name}
                        </h3>

                        <p className="text-xs font-semibold text-orange-600 truncate mt-0.5">
                          {member.position}
                        </p>
                      </div>
                    </div>

                    {/* Bio excerpt */}
                    {member.bio && (
                      <p className="mt-3.5 text-xs text-slate-600 line-clamp-3 leading-relaxed border-t border-slate-100 pt-2.5">
                        {member.bio}
                      </p>
                    )}

                    {/* Contact & Social Links */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 text-slate-400">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:text-orange-600 transition"
                          title={member.email}
                        >
                          <FiMail size={13} />
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="hover:text-orange-600 transition"
                          title={member.phone}
                        >
                          <FiPhone size={13} />
                        </a>
                      )}
                      {member.socialLinks?.linkedin && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-600 transition"
                          title="LinkedIn Profile"
                        >
                          <FiLinkedin size={13} />
                        </a>
                      )}
                      {member.socialLinks?.twitter && (
                        <a
                          href={member.socialLinks.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-sky-500 transition"
                          title="Twitter Profile"
                        >
                          <FiTwitter size={13} />
                        </a>
                      )}
                      {member.socialLinks?.instagram && (
                        <a
                          href={member.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-pink-600 transition"
                          title="Instagram"
                        >
                          <FiInstagram size={13} />
                        </a>
                      )}
                      {member.socialLinks?.facebook && (
                        <a
                          href={member.socialLinks.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-700 transition"
                          title="Facebook"
                        >
                          <FiFacebook size={13} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        member.status === "Active" ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      ● {member.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(member)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition"
                      >
                        <FiEdit2 size={11} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteModalItem(member)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete member"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <FiUsers size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-serif text-lg font-bold text-slate-800">
              No team members found
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "No members matched your search criteria."
                : "Add founders, doctors, and team leads to showcase them on the public team page."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition"
              >
                <FiPlus size={14} />
                <span>Add First Team Member</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  {editingMember ? "Update Official Record" : "Add Foundation Member"}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {editingMember ? `Edit ${editingMember.name}` : "New Team Member"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <FiX size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Photo Upload with Live Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Member Photo / Portrait
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative size-20 shrink-0 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <FiUploadCloud size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition">
                      <FiUploadCloud size={14} className="text-orange-600" />
                      <span>{selectedImageFile ? "Change Image" : "Upload Picture"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="mt-1 text-[11px] text-slate-400">
                      JPEG, PNG, WebP up to 10MB. High-res portrait photo recommended.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hari Om"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Position in NGO <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Founder & President"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    list="position-suggestions"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                  <datalist id="position-suggestions">
                    {POSITION_SUGGESTIONS.map((pos) => (
                      <option key={pos} value={pos} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Department & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department / Division
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500"
                  >
                    {DEPARTMENTS.filter((d) => d !== "All").map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500"
                    placeholder="1, 2, 3..."
                  />
                </div>
              </div>

              {/* Bio / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bio / Responsibilities Overview
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a brief overview of their dedication, achievements, and responsibilities at the foundation..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="member@shivgorakh.org.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Social Links Accordion / Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Social Links (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5">
                    <FiLinkedin className="text-blue-600 shrink-0" size={13} />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full bg-transparent outline-none text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5">
                    <FiTwitter className="text-sky-500 shrink-0" size={13} />
                    <input
                      type="url"
                      placeholder="Twitter / X URL"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="w-full bg-transparent outline-none text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5">
                    <FiInstagram className="text-pink-600 shrink-0" size={13} />
                    <input
                      type="url"
                      placeholder="Instagram URL"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full bg-transparent outline-none text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5">
                    <FiFacebook className="text-blue-700 shrink-0" size={13} />
                    <input
                      type="url"
                      placeholder="Facebook URL"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                      className="w-full bg-transparent outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Public Visibility
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Active members are visible on the public team-members page.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      status: formData.status === "Active" ? "Inactive" : "Active",
                    })
                  }
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    formData.status === "Active"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {formData.status}
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white hover:bg-orange-700 shadow-sm transition disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingMember
                    ? "Update Team Member"
                    : "Add Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={() => !deleting && setDeleteModalItem(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 mb-2">
              <span className="grid size-10 place-items-center rounded-full bg-rose-100">
                <FiTrash2 size={18} />
              </span>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Delete Team Member?
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Are you sure you want to remove <strong>{deleteModalItem.name}</strong> (
              {deleteModalItem.position}) from the NGO team? This action will permanently remove
              their profile from the public website.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
