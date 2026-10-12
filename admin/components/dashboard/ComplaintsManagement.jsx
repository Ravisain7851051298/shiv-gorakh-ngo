"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFilter,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
  FiX,
  FiMessageSquare,
  FiCheck,
  FiCopy,
} from "react-icons/fi";
import { contentApi, getContentImageUrl } from "@/lib/authApi";

const CATEGORIES = [
  "All Categories",
  "Rescue Operation",
  "Animal Abuse / Cruelty Incident",
  "Field Logistics & Medical Aid",
  "ID Card / Credential Issue",
  "Membership / Donation Inquiry",
  "General Grievance",
  "Other",
];

const STATUS_TABS = ["All", "Pending Review", "In Progress", "Resolved", "Closed"];
const PRIORITIES = ["All Priorities", "Urgent", "High", "Medium", "Low"];

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function ComplaintsManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [searchQuery, setSearchQuery] = useState("");

  // Ticket Detail / Resolution Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusDraft, setStatusDraft] = useState("Pending Review");
  const [remarksDraft, setRemarksDraft] = useState("");
  const [savingResolution, setSavingResolution] = useState(false);

  async function loadComplaints() {
    setLoading(true);
    try {
      const res = await contentApi.get("/complaints/admin/all");
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  // Summary counts
  const counts = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "Pending Review").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress").length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const closed = complaints.filter((c) => c.status === "Closed").length;
    return { total, pending, inProgress, resolved, closed };
  }, [complaints]);

  // Filtered List
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Status tab filter
      if (activeStatus !== "All" && c.status !== activeStatus) {
        return false;
      }
      // Category filter
      if (categoryFilter !== "All Categories" && c.category !== categoryFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== "All Priorities" && c.priority !== priorityFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ticketId = (c.ticketId || "").toLowerCase();
        const userName = (c.userName || c.user?.name || "").toLowerCase();
        const userEmail = (c.userEmail || c.user?.email || "").toLowerCase();
        const userPhone = (c.userPhone || c.user?.phone || "").toLowerCase();
        const subject = (c.subject || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();

        if (
          !ticketId.includes(q) &&
          !userName.includes(q) &&
          !userEmail.includes(q) &&
          !userPhone.includes(q) &&
          !subject.includes(q) &&
          !desc.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [complaints, activeStatus, categoryFilter, priorityFilter, searchQuery]);

  function openTicketModal(ticket) {
    setSelectedTicket(ticket);
    setStatusDraft(ticket.status || "Pending Review");
    setRemarksDraft(ticket.adminRemarks || "");
  }

  function closeTicketModal() {
    setSelectedTicket(null);
    setRemarksDraft("");
  }

  async function handleSaveResolution(e) {
    e.preventDefault();
    if (!selectedTicket) return;

    setSavingResolution(true);
    try {
      const res = await contentApi.patch(`/complaints/admin/${selectedTicket._id}`, {
        status: statusDraft,
        adminRemarks: remarksDraft,
      });

      if (res.data?.success) {
        toast.success(`Ticket ${selectedTicket.ticketId} updated successfully`);
        const updated = res.data.data;
        setComplaints((prev) =>
          prev.map((c) => (c._id === selectedTicket._id ? { ...c, ...updated } : c))
        );
        setSelectedTicket((prev) => (prev ? { ...prev, ...updated } : null));
        closeTicketModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update ticket resolution");
    } finally {
      setSavingResolution(false);
    }
  }

  function handleExportCsv() {
    if (!complaints.length) {
      toast.error("No complaints to export");
      return;
    }

    const headers = [
      "Ticket ID",
      "Submitter Name",
      "Email",
      "Phone",
      "Role",
      "Category",
      "Priority",
      "Subject",
      "Status",
      "Created Date",
      "Admin Remarks",
    ];

    const rows = filteredComplaints.map((c) => [
      c.ticketId || "",
      c.userName || c.user?.name || "Anonymous",
      c.userEmail || c.user?.email || "",
      c.userPhone || c.user?.phone || "",
      c.userRole || c.user?.role || "user",
      c.category || "",
      c.priority || "",
      c.subject || "",
      c.status || "",
      c.createdAt ? new Date(c.createdAt).toLocaleString("en-IN") : "",
      c.adminRemarks || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `complaints_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Complaints roster exported to CSV!");
  }

  function copyText(txt) {
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    toast.success(`Copied: ${txt}`);
  }

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Complaints &amp; Inquiries Management
            </h1>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800">
              {complaints.length} Total
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monitor and resolve member grievances, rescue operation reports, credential inquiries, and field requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadComplaints}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
            title="Refresh list"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={13} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition cursor-pointer"
          >
            <FiDownload size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Tickets
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {counts.total}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">All logged grievances</span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
              Pending Review
            </span>
            {counts.pending > 0 && (
              <span className="size-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <span className="text-2xl font-black text-amber-900 mt-1 block">
            {counts.pending}
          </span>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting action</span>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
            In Progress
          </span>
          <span className="text-2xl font-black text-blue-900 mt-1 block">
            {counts.inProgress}
          </span>
          <span className="text-[11px] text-blue-700 font-medium">Under investigation</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Resolved
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">
            {counts.resolved}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">Successfully handled</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Closed
          </span>
          <span className="text-2xl font-black text-slate-700 mt-1 block">
            {counts.closed}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Archived tickets</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        {/* Top row: Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((st) => {
              const isActive = activeStatus === st;
              const countBadge =
                st === "All"
                  ? counts.total
                  : st === "Pending Review"
                  ? counts.pending
                  : st === "In Progress"
                  ? counts.inProgress
                  : st === "Resolved"
                  ? counts.resolved
                  : counts.closed;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setActiveStatus(st)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-white text-slate-700"
                    }`}
                  >
                    {countBadge}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredComplaints.length} of {complaints.length} tickets
          </span>
        </div>

        {/* Bottom row: Search & Dropdowns */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Search Box */}
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search by ticket ID, user name, email, phone, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 cursor-pointer"
          >
            {PRIORITIES.map((pri) => (
              <option key={pri} value={pri}>
                {pri}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Complaints Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        {loading ? (
          <div className="p-12 text-center">
            <FiRefreshCw className="mx-auto h-7 w-7 animate-spin text-orange-500" />
            <p className="mt-3 text-sm font-semibold text-slate-600">Loading complaints &amp; inquiries...</p>
          </div>
        ) : filteredComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID</th>
                  <th className="px-5 py-3.5">Submitter Details</th>
                  <th className="px-5 py-3.5">Subject &amp; Category</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Date Logged</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((ticket) => {
                  const user = ticket.user || {};
                  const userName = ticket.userName || user.name || "Anonymous User";
                  const userEmail = ticket.userEmail || user.email || "";
                  const userPhone = ticket.userPhone || user.phone || "";
                  const userRole = ticket.userRole || user.role || "volunteer";
                  const avatarUrl = user.profilePicture ? getContentImageUrl(user.profilePicture) : "";
                  const initials = userName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const isUrgent = ticket.priority === "Urgent";
                  const isHigh = ticket.priority === "High";

                  return (
                    <tr
                      key={ticket._id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Ticket ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            {ticket.ticketId}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(ticket.ticketId)}
                            className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Copy ticket ID"
                          >
                            <FiCopy size={11} />
                          </button>
                        </div>
                      </td>

                      {/* Submitter Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={userName}
                              className="size-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="grid size-9 place-items-center rounded-full bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{userName}</span>
                              <span
                                className={`rounded-full px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                  userRole === "volunteer"
                                    ? "bg-orange-100 text-orange-800"
                                    : userRole === "member"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {userRole}
                              </span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                              {userEmail && (
                                <a
                                  href={`mailto:${userEmail}`}
                                  className="flex items-center gap-1 hover:text-orange-600 transition"
                                >
                                  <FiMail size={10} />
                                  <span>{userEmail}</span>
                                </a>
                              )}
                              {userPhone && (
                                <a
                                  href={`tel:${userPhone}`}
                                  className="flex items-center gap-1 hover:text-orange-600 transition font-medium"
                                >
                                  <FiPhone size={10} />
                                  <span>{userPhone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Category */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-bold text-slate-900 line-clamp-1 text-sm">
                          {ticket.subject}
                        </p>
                        <span className="inline-block mt-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {ticket.category || "General Grievance"}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isUrgent
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : isHigh
                              ? "bg-orange-100 text-orange-800 border border-orange-300"
                              : ticket.priority === "Medium"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isUrgent && <span className="size-1.5 rounded-full bg-rose-600 animate-ping" />}
                          <span>{ticket.priority || "Medium"}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDate(ticket.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            ticket.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : ticket.status === "In Progress"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : ticket.status === "Closed"
                              ? "bg-slate-100 text-slate-500 border border-slate-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {ticket.status === "Resolved" && <FiCheck size={11} />}
                          <span>{ticket.status}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openTicketModal(ticket)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition cursor-pointer"
                        >
                          <FiEye size={12} />
                          <span>Review &amp; Resolve</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FiMessageSquare className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-base font-semibold text-slate-700">
              No complaints or inquiries found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {searchQuery || activeStatus !== "All" || categoryFilter !== "All Categories"
                ? "Try clearing your filters or search keywords."
                : "When users report issues or ask questions via their portal, tickets will appear here."}
            </p>
          </div>
        )}
      </div>

      {/* Ticket Inspection & Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4.5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                  <FiAlertCircle size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      {selectedTicket.ticketId}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        selectedTicket.priority === "Urgent"
                          ? "bg-rose-100 text-rose-800"
                          : selectedTicket.priority === "High"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-bold text-slate-900 line-clamp-1">
                    {selectedTicket.subject}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeTicketModal}
                className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Submitter Quick Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                  Submitter Information
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-full bg-orange-100 text-orange-800 font-bold text-sm">
                      {(selectedTicket.userName || selectedTicket.user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {selectedTicket.userName || selectedTicket.user?.name || "Anonymous Member"}
                      </h4>
                      <p className="text-xs text-slate-500 capitalize">
                        Role: <strong className="text-slate-800">{selectedTicket.userRole || selectedTicket.user?.role || "Volunteer"}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Quick Contact Buttons */}
                  <div className="flex items-center gap-2">
                    {(selectedTicket.userPhone || selectedTicket.user?.phone) && (
                      <>
                        <a
                          href={`tel:${selectedTicket.userPhone || selectedTicket.user?.phone}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                        >
                          <FiPhone size={11} />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/91${String(selectedTicket.userPhone || selectedTicket.user?.phone).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
                        >
                          <FiMessageSquare size={11} />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}
                    {(selectedTicket.userEmail || selectedTicket.user?.email) && (
                      <a
                        href={`mailto:${selectedTicket.userEmail || selectedTicket.user?.email}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                      >
                        <FiMail size={11} />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-semibold text-slate-800">{selectedTicket.category || "General Grievance"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Logged On</span>
                    <span className="font-semibold text-slate-800">{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Description Block */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Detailed Grievance / Inquiry Description
                </span>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Admin Resolution Form */}
              <form onSubmit={handleSaveResolution} className="rounded-2xl border border-orange-200 bg-orange-50/30 p-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-950 block">
                  Admin Resolution &amp; Remarks
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Update Ticket Status
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 cursor-pointer"
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Resolution Remarks / Action Taken
                  </label>
                  <textarea
                    rows={4}
                    value={remarksDraft}
                    onChange={(e) => setRemarksDraft(e.target.value)}
                    placeholder="Enter resolution notes, action taken, response communicated to the volunteer/member, or closure justification..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    These remarks will be visible to the member when they check their grievance status in their personal portal.
                  </p>
                </div>

                {selectedTicket.resolvedAt && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <FiCheckCircle size={12} />
                    <span>Previously marked resolved on {formatDate(selectedTicket.resolvedAt)}</span>
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-orange-200/60">
                  <button
                    type="button"
                    onClick={closeTicketModal}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingResolution}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {savingResolution ? (
                      <>
                        <FiRefreshCw className="animate-spin" size={12} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck size={13} />
                        <span>Save Resolution &amp; Update</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
