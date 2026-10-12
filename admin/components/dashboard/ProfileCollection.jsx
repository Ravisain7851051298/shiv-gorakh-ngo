"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiUsers } from "react-icons/fi";
import MembershipProfileCard from "@/components/dashboard/MembershipProfileCard";
import VolunteerProfileCard from "@/components/dashboard/VolunteerProfileCard";
import { getProfileCardName, getProfileName } from "@/components/dashboard/ProfileCard";
import {
  deleteMembership,
  deleteVolunteer,
  fetchMembershipById,
  fetchMemberships,
  fetchVolunteerById,
  fetchVolunteers,
  updateMembership,
  updateVolunteer,
} from "@/store/profilesSlice";

const VOLUNTEER_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const MEMBERSHIP_TYPES = ["Basic", "Premium", "VIP"];
const VOLUNTEER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"];

function getId(profile) {
  return profile?._id ?? profile?.id;
}

function getProfileDisplayName(profile) {
  if (typeof getProfileName === "function") return getProfileName(profile);
  if (typeof getProfileCardName === "function") return getProfileCardName(profile);
  const user = profile?.user && typeof profile.user === "object" ? profile.user : {};
  return user.name || user.fullName || user.email || "Unnamed profile";
}

function getUser(profile) {
  return profile?.user && typeof profile.user === "object" ? profile.user : {};
}

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function ProfileField({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}

function TextInput({ value, onChange, name, type = "text", required = false }) {
  return (
    <input
      className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 font-normal outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
      name={name}
      onChange={onChange}
      required={required}
      type={type}
      value={value}
    />
  );
}

function ProfileDetails({ profile, resource }) {
  if (!profile) return null;
  const user = getUser(profile);
  const details = resource === "volunteers"
    ? [
      ["Status", profile.status],
      ["Email", user.email],
      ["Phone", user.phone],
      ["Address", [profile.address?.addressLine, profile.address?.city, profile.address?.state, profile.address?.pincode].filter(Boolean).join(", ")],
      ["Animal types", profile.animalTypes?.join(", ")],
      ["Skills", profile.skills?.join(", ")],
      ["Available days", profile.availability?.days?.join(", ")],
      ["Emergency available", profile.availability?.emergencyAvailable ? "Yes" : "No"],
      ["Experience", profile.experience],
    ]
    : [
      ["Membership type", profile.membershipType],
      ["Email", user.email],
      ["Phone", user.phone],
      ["Address", [profile.address, profile.city, profile.state, profile.zipCode].filter(Boolean).join(", ")],
      ["Start date", profile.startDate ? new Date(profile.startDate).toLocaleDateString() : ""],
      ["End date", profile.endDate ? new Date(profile.endDate).toLocaleDateString() : ""],
    ];

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {details.filter(([, value]) => value !== undefined && value !== null && value !== "").map(([label, value]) => (
        <div className="rounded-xl bg-slate-50 px-4 py-3" key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProfileCollection({ resource }) {
  const isVolunteer = resource === "volunteers";
  const state = useSelector((store) => store[resource]);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    experience: "",
    status: "ACTIVE",
    days: [],
    emergencyAvailable: false,
    membershipType: "Basic",
    endDate: "",
  });
  const fetchList = isVolunteer ? fetchVolunteers : fetchMemberships;
  const fetchDetail = isVolunteer ? fetchVolunteerById : fetchMembershipById;
  const updateProfile = isVolunteer ? updateVolunteer : updateMembership;
  const removeProfile = isVolunteer ? deleteVolunteer : deleteMembership;
  const title = isVolunteer ? "Volunteer profiles" : "Membership profiles";
  const singular = isVolunteer ? "volunteer" : "membership";
  const pageCount = Number(
    state.pagination.totalPages ??
    state.pagination.pages ??
    Math.ceil(Number(state.pagination.total || 0) / Number(state.pagination.limit || 20)),
  ) || 1;

  useEffect(() => {
    dispatch(fetchList({ page, limit: 20 }));
  }, [dispatch, fetchList, page]);

  function changeField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(profile) {
    setEditingProfile(profile);
    if (isVolunteer) {
      setForm({
        experience: profile.experience || "",
        status: profile.status || "ACTIVE",
        days: profile.availability?.days || [],
        emergencyAvailable: Boolean(profile.availability?.emergencyAvailable),
        membershipType: "Basic",
        endDate: "",
      });
    } else {
      setForm({
        experience: "",
        status: "ACTIVE",
        days: [],
        emergencyAvailable: false,
        membershipType: profile.membershipType || "Basic",
        endDate: toDateInput(profile.endDate),
      });
    }
    setFormError("");
    setDialog("edit");
  }

  async function showProfile(profile) {
    setFormError("");
    setDialog("details");
    try {
      await dispatch(fetchDetail(getId(profile))).unwrap();
    } catch (error) {
      setDialog(null);
      setFormError(typeof error === "string" ? error : `Unable to load ${singular} details.`);
    }
  }

  function toggleDay(day) {
    setForm((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((selected) => selected !== day)
        : [...current.days, day],
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setFormError("");
    const changes = isVolunteer
      ? {
        experience: form.experience.trim(),
        status: form.status,
        availability: {
          days: form.days,
          emergencyAvailable: form.emergencyAvailable,
        },
      }
      : {
        membershipType: form.membershipType,
        endDate: new Date(form.endDate).toISOString(),
      };

    try {
      await dispatch(updateProfile({ id: getId(editingProfile), changes })).unwrap();
      setDialog(null);
      setEditingProfile(null);
    } catch (error) {
      setFormError(typeof error === "string" ? error : `Unable to update ${singular}.`);
    }
  }

  async function deleteSelectedProfile(profile) {
    const name = getProfileDisplayName(profile);
    const profileId = getId(profile);
    if (!profileId) {
      setFormError(`Unable to delete ${singular}: missing profile ID.`);
      return;
    }
    if (!window.confirm(`Delete ${singular} profile for ${name}? This action cannot be undone.`)) return;
    try {
      setFormError("");
      await dispatch(removeProfile(profileId)).unwrap();
      setSuccessMessage(`${singular.charAt(0).toUpperCase() + singular.slice(1)} profile for ${name} deleted successfully.`);
      setTimeout(() => setSuccessMessage(""), 4000);
      dispatch(fetchList({ page, limit: 20 }));
    } catch (error) {
      setSuccessMessage("");
      setFormError(typeof error === "string" ? error : `Unable to delete ${singular} profile.`);
    }
  }

  return (
    <main className="px-4 py-8 sm:px-7 lg:px-9">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          View, update, and remove existing {singular} profiles.
        </p>
      </div>

      {successMessage && (
        <p className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
          {successMessage}
        </p>
      )}

      {(state.error || formError) && (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {formError || state.error}
        </p>
      )}

      {state.loading ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading profiles...</p>
      ) : state.items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.items.map((profile, index) => (
            isVolunteer ? (
              <VolunteerProfileCard
                key={getId(profile) || index}
                onDelete={() => deleteSelectedProfile(profile)}
                onEdit={() => startEdit(profile)}
                onView={() => showProfile(profile)}
                profile={profile}
              />
            ) : (
              <MembershipProfileCard
                key={getId(profile) || index}
                onDelete={() => deleteSelectedProfile(profile)}
                onEdit={() => startEdit(profile)}
                onView={() => showProfile(profile)}
                profile={profile}
              />
            )
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <FiUsers className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No {title.toLowerCase()} found</p>
        </div>
      )}

      {!state.loading && pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm text-slate-500">Page {page} of {pageCount}</span>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {(dialog === "edit" || dialog === "details") && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            aria-labelledby="profile-dialog-title"
            aria-modal="true"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800" id="profile-dialog-title">
                  {dialog === "edit" ? `Edit ${singular} profile` : `${singular} profile`}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {dialog === "edit" ? getProfileCardName(editingProfile) : getProfileCardName(state.currentProfile)}
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                onClick={() => setDialog(null)}
                type="button"
              >
                <FiX />
              </button>
            </div>

            {dialog === "details" ? (
              <div className="p-6">
                {state.detailLoading ? (
                  <p className="text-sm text-slate-500">Loading profile details...</p>
                ) : (
                  <ProfileDetails profile={state.currentProfile} resource={resource} />
                )}
              </div>
            ) : (
              <form className="grid max-h-[70vh] gap-5 overflow-y-auto p-6" onSubmit={saveProfile}>
                {isVolunteer ? (
                  <>
                    <ProfileField label="Status">
                      <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal" name="status" onChange={changeField} value={form.status}>
                        {VOLUNTEER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </ProfileField>
                    <ProfileField label="Experience">
                      <textarea
                        className="min-h-28 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 font-normal outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        maxLength={1000}
                        name="experience"
                        onChange={changeField}
                        value={form.experience}
                      />
                    </ProfileField>
                    <fieldset className="grid gap-3">
                      <legend className="text-sm font-semibold text-slate-700">Available days</legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {VOLUNTEER_DAYS.map((day) => (
                          <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600" key={day}>
                            <input checked={form.days.includes(day)} onChange={() => toggleDay(day)} type="checkbox" />
                            {day.toLowerCase()}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      <input
                        checked={form.emergencyAvailable}
                        name="emergencyAvailable"
                        onChange={(event) => setForm((current) => ({ ...current, emergencyAvailable: event.target.checked }))}
                        type="checkbox"
                      />
                      Available for emergency response
                    </label>
                  </>
                ) : (
                  <>
                    <ProfileField label="Membership type">
                      <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal" name="membershipType" onChange={changeField} value={form.membershipType}>
                        {MEMBERSHIP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </ProfileField>
                    <ProfileField label="Membership end date">
                      <TextInput name="endDate" onChange={changeField} required type="date" value={form.endDate} />
                    </ProfileField>
                  </>
                )}
                {formError && <p className="text-sm text-red-600" role="alert">{formError}</p>}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setDialog(null)} type="button">
                    Cancel
                  </button>
                  <button className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-700 disabled:opacity-60" disabled={state.mutationLoading} type="submit">
                    {state.mutationLoading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
