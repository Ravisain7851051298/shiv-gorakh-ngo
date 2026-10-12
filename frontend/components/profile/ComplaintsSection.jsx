"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/authApi";
import getUserFacingError from "@/lib/getUserFacingError";

const CATEGORIES = [
  "Rescue Operation",
  "Animal Abuse / Cruelty Incident",
  "Field Logistics & Medical Aid",
  "ID Card / Credential Issue",
  "Membership / Donation Inquiry",
  "General Grievance",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function ComplaintsSection({
  complaints = [],
  onRefresh,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    subject: "",
    category: "General Grievance",
    priority: "Medium",
    description: "",
  });

  async function handleSubmitComplaint(e) {
    e.preventDefault();
    if (!formData.subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/v1/complaints", formData);
      if (res.data?.success) {
        toast.success(res.data.message || "Your complaint ticket has been submitted successfully!");
        setFormData({
          subject: "",
          category: "General Grievance",
          priority: "Medium",
          description: "",
        });
        setFormOpen(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error(getUserFacingError(err, "Failed to submit grievance ticket."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Grievance & Issue Resolution Desk
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
            My Complaints & Inquiries
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            File grievance tickets regarding field rescues, emergency logistics, animal cruelty incidents, or ID credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen(!formOpen)}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-orange hover:opacity-95 text-white px-5 py-2.5 text-xs font-bold shadow-md transition"
        >
          <span>{formOpen ? "Close Ticket Form" : "+ File New Complaint"}</span>
        </button>
      </div>

      {/* New Complaint Form Modal / Card */}
      {formOpen && (
        <section className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 sm:p-8 shadow-md">
          <div className="border-b border-rose-100 pb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Submit a New Grievance / Query Ticket
            </h3>
            <span className="text-xs text-rose-700 font-semibold">Priority Escalated</span>
          </div>

          <form onSubmit={handleSubmitComplaint} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Subject / Issue Summary *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stray animal trauma response delay in Civil Lines"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-rose-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Priority Urgency *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-rose-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Detailed Description & Facts *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Please provide full details, location, animal condition or specific inquiry so foundation leadership can respond swiftly..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white p-4 text-xs text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-brand-orange hover:opacity-95 text-white px-6 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {submitting ? "Registering Ticket…" : "Submit Complaint Ticket"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tickets List */}
      <section className="space-y-4">
        {complaints.length > 0 ? (
          complaints.map((ticket) => {
            const statusColor =
              ticket.status === "Resolved" || ticket.status === "Closed"
                ? "bg-emerald-100 text-emerald-800"
                : ticket.status === "In Progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-amber-100 text-amber-800";

            const priorityBadge =
              ticket.priority === "Urgent"
                ? "bg-rose-600 text-white"
                : ticket.priority === "High"
                ? "bg-rose-100 text-rose-800"
                : "bg-slate-100 text-slate-700";

            return (
              <div
                key={ticket._id}
                className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {ticket.ticketId || `TKT-${ticket._id.slice(-6).toUpperCase()}`}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {ticket.category || "General"}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityBadge}`}>
                      {ticket.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColor}`}>
                      {ticket.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif text-base font-bold text-slate-900">
                    {ticket.subject}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>

                {/* Admin Remarks Section */}
                {ticket.adminRemarks && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <span>🛡️</span> <span>Foundation Admin Resolution / Reply:</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed">{ticket.adminRemarks}</p>
                    {ticket.resolvedAt && (
                      <p className="text-[10px] text-emerald-600 pt-1">
                        Resolved on: {new Date(ticket.resolvedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
            <span className="text-3xl block">💬</span>
            <h3 className="font-serif text-lg font-bold text-slate-800">
              No complaint or inquiry tickets registered yet.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Whenever you encounter a field rescue bottleneck, cruelty incident, or question regarding your credentials, you can log a ticket here for priority resolution.
            </p>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold transition"
            >
              + File First Complaint Ticket
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
