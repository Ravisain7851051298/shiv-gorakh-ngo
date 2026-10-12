"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "@/lib/authApi";
import getUserFacingError from "@/lib/getUserFacingError";
import { logout, updateProfile } from "@/store/authSlice";
import { fetchMembership } from "@/store/membershipSlice";
import { fetchVolunteer } from "@/store/volunteerSlice";
import MemberVolunteerDashboard from "@/components/profile/MemberVolunteerDashboard";
import DonorProfileView from "@/components/profile/DonorProfileView";

// Curated baseline events in case event records in DB are minimal
const BASELINE_EVENTS = [
  {
    _id: "event-base-1",
    title: "Mega Anti-Rabies Vaccination & Deworming Camp",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    description:
      "Free medical checkups, vaccination against rabies, and deworming treatments for stray dogs and community pets across Rampur city. Certified veterinarians and trained volunteers will be on site with transport vehicles.",
    location: "Foundation Rescue Ground, Civil Lines, Rampur",
  },
  {
    _id: "event-base-2",
    title: "Community Winter Feeder & Shelter Drive",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
    description:
      "Join us in setting up insulated bedding boxes and distributed feed points for community animals facing severe northern winter conditions. Open to youth, college students, and volunteer caregivers.",
    location: "Railway Station Road & Surrounding Clusters, Rampur",
  },
  {
    _id: "event-base-3",
    title: "Humane Animal Care & Safe Rescue Workshop",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    description:
      "Hands-on training session for volunteers on recognizing distress signs in street animals, safe handling of injured canines, wound dressing, and emergency hotline dispatch procedures.",
    location: "Community Center Hall, Rampur",
  },
];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, initialized, loading: authLoading } = useSelector((state) => state.auth);

  // Redux Slices
  const membership = useSelector((state) => state.membership.profile);
  const volunteer = useSelector((state) => state.volunteer.profile);

  // Auxiliary data states
  const [donations, setDonations] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  // Load all auxiliary data (donations, joined events, all events, complaints)
  const loadPortalData = useCallback(async () => {
    if (!user) return;

    // 1. Fetch donations
    try {
      const res = await api.get("/api/v1/donations/my");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setDonations(res.data.data);
      }
    } catch {
      // Non-blocking
    }

    // 2. Fetch joined events
    try {
      const res = await api.get("/api/v1/events/my-joined");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setJoinedEvents(res.data.data);
      }
    } catch {
      // Non-blocking
    }

    // 3. Fetch all upcoming events
    try {
      const res = await api.get("/api/v1/events/all");
      const list = res.data?.events || res.data?.data?.events || res.data?.data || [];
      if (res.data?.success && Array.isArray(list) && list.length > 0) {
        setAllEvents(list);
      } else {
        setAllEvents(BASELINE_EVENTS);
      }
    } catch {
      setAllEvents(BASELINE_EVENTS);
    }

    // 4. Fetch user complaints
    try {
      const res = await api.get("/api/v1/complaints/my");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setComplaints(res.data.data);
      }
    } catch {
      // Non-blocking
    }
  }, [user]);

  // Initial authentication & data bootstrap
  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login?redirect=%2Fprofile");
      return;
    }

    if (initialized && user) {
      dispatch(fetchVolunteer()).catch(() => {});
      dispatch(fetchMembership()).catch(() => {});
      loadPortalData();
    }
  }, [dispatch, initialized, user, router, loadPortalData]);

  // Save Account Profile
  async function handleSaveAccount(accountData) {
    const formData = new FormData();
    formData.append("name", accountData.name.trim());
    formData.append("email", accountData.email.trim());
    if (accountData.phone) formData.append("phone", accountData.phone.trim());

    if (accountData.avatarFile) {
      formData.append("profilePicture", accountData.avatarFile);
    } else if (accountData.removeAvatar) {
      formData.append("removeProfilePicture", "true");
    }

    const result = await dispatch(updateProfile(formData));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Account details updated successfully.");
    } else {
      toast.error(getUserFacingError(result.payload, "Failed to update account."));
      throw new Error(result.payload);
    }
  }

  // Logout Handler
  async function handleLogout() {
    await dispatch(logout());
    router.replace("/");
  }

  // Download Donation Receipt
  async function handleDownloadReceipt(d) {
    setDownloadingReceiptId(d._id);
    try {
      const response = await api.get(`/api/v1/donations/${d._id}/receipt`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const recName = d.receiptNumber || `Donation_Receipt_${d._id}`;
      link.setAttribute("download", `${recName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("80G Tax receipt downloaded successfully!");
    } catch (err) {
      toast.error(getUserFacingError(err, "Unable to download receipt."));
    } finally {
      setDownloadingReceiptId(null);
    }
  }

  // Loading State
  if (!initialized || !user) {
    return (
      <main className="grid min-h-[65vh] place-items-center bg-[#faf8f5] px-5">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-3 border-orange-200 border-t-orange-600" />
          <p className="text-xs font-semibold text-stone-600">
            {initialized ? "Redirecting to sign in…" : "Loading foundation portal…"}
          </p>
        </div>
      </main>
    );
  }

  // Determine user qualification: Is this user a registered Volunteer or Member?
  const userRole = (user?.role || "").toLowerCase();
  const isRegisteredVolunteer =
    Boolean(volunteer && (volunteer.status === "ACTIVE" || (!volunteer.status && volunteer.volunteerId))) ||
    userRole === "volunteer";
  const isRegisteredMember =
    Boolean(membership && membership.status === "Active") || userRole === "member";
  const isVolunteerOrMember = isRegisteredVolunteer || isRegisteredMember;

  // ==========================================
  // VIEW SELECTION:
  // - Registered Volunteers & Members get the full Dashboard Layout with 8 sidebar links
  // - Initial state (Donor / Pending applicant) gets the Donor profile view with status notifications
  // ==========================================
  if (isVolunteerOrMember) {
    return (
      <MemberVolunteerDashboard
        user={user}
        volunteer={volunteer}
        membership={membership}
        donations={donations}
        joinedEvents={joinedEvents}
        allEvents={allEvents}
        complaints={complaints}
        onLogout={handleLogout}
        onSaveAccount={handleSaveAccount}
        onRefreshData={loadPortalData}
        onDownloadReceipt={handleDownloadReceipt}
        downloadingReceiptId={downloadingReceiptId}
      />
    );
  }

  // Initial State: Philanthropic Donor or Pending Applicant
  return (
    <DonorProfileView
      user={user}
      volunteer={volunteer}
      membership={membership}
      donations={donations}
      onLogout={handleLogout}
      onSaveAccount={handleSaveAccount}
      onDownloadReceipt={handleDownloadReceipt}
      downloadingReceiptId={downloadingReceiptId}
    />
  );
}
