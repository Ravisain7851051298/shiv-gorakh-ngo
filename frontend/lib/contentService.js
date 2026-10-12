import api from "@/lib/authApi";

// Galleries
export async function getGalleries(params = { page: 1, limit: 30 }) {
  try {
    const { data } = await api.get("/api/v1/galleries/all", { params });
    return {
      success: true,
      items: data?.galleries || data?.data?.galleries || [],
      pagination: data?.pagination || null,
    };
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return {
      success: false,
      items: [],
      error: error.response?.data?.message || error.message || "Failed to load galleries",
    };
  }
}

export async function getGalleryById(id) {
  try {
    const { data } = await api.get(`/api/v1/galleries/${id}`);
    return {
      success: true,
      item: data?.gallary || data?.gallery || data?.data || null,
    };
  } catch (error) {
    console.error(`Error fetching gallery ${id}:`, error);
    return {
      success: false,
      item: null,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Stories
export async function getStories(params = { page: 1, limit: 30 }) {
  try {
    const { data } = await api.get("/api/v1/stories/all", { params });
    return {
      success: true,
      items: data?.stories || data?.data?.stories || [],
      pagination: data?.pagination || null,
    };
  } catch (error) {
    console.error("Error fetching stories:", error);
    return {
      success: false,
      items: [],
      error: error.response?.data?.message || error.message || "Failed to load stories",
    };
  }
}

export async function getStoryById(id) {
  try {
    const { data } = await api.get(`/api/v1/stories/${id}`);
    return {
      success: true,
      item: data?.story || data?.data || null,
    };
  } catch (error) {
    console.error(`Error fetching story ${id}:`, error);
    return {
      success: false,
      item: null,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Events
export async function getEvents(params = { page: 1, limit: 30 }) {
  try {
    const { data } = await api.get("/api/v1/events/all", { params });
    return {
      success: true,
      items: data?.events || data?.data?.events || [],
      pagination: data?.pagination || null,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    return {
      success: false,
      items: [],
      error: error.response?.data?.message || error.message || "Failed to load events",
    };
  }
}

export async function getEventById(id) {
  try {
    const { data } = await api.get(`/api/v1/events/${id}`);
    return {
      success: true,
      item: data?.event || data?.data || null,
    };
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    return {
      success: false,
      item: null,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Programs
export async function getPrograms(params = { page: 1, limit: 50 }) {
  try {
    const { data } = await api.get("/api/v1/programs/all", { params });
    return {
      success: true,
      items: data?.programs || data?.data?.programs || [],
      pagination: data?.pagination || null,
    };
  } catch (error) {
    console.error("Error fetching programs:", error);
    return {
      success: false,
      items: [],
      error: error.response?.data?.message || error.message || "Failed to load programs",
    };
  }
}

export async function getProgramById(id) {
  try {
    const { data } = await api.get(`/api/v1/programs/${id}`);
    return {
      success: true,
      item: data?.program || data?.data || null,
    };
  } catch (error) {
    console.error(`Error fetching program ${id}:`, error);
    return {
      success: false,
      item: null,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Blogs & News
export async function getBlogs(params = { page: 1, limit: 50 }) {
  try {
    const { data } = await api.get("/api/v1/blogs/all", { params });
    return {
      success: true,
      items: data?.blogs || data?.data?.blogs || [],
      pagination: data?.pagination || null,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      success: false,
      items: [],
      error: error.response?.data?.message || error.message || "Failed to load news & blogs",
    };
  }
}

export async function getBlogById(id) {
  try {
    const { data } = await api.get(`/api/v1/blogs/${id}`);
    return {
      success: true,
      item: data?.blog || data?.data || null,
    };
  } catch (error) {
    console.error(`Error fetching blog ${id}:`, error);
    return {
      success: false,
      item: null,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Campaigns
export async function getCampaigns(params = { page: 1, limit: 50 }) {
  try {
    const { data } = await api.get("/api/v1/campaigns/all", { params });
    return {
      success: true,
      items: data?.campaigns || data?.data?.campaigns || [],
      pagination: data?.pagination || null,
    };
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return {
      success: false,
      items: [],
      error: error.response?.data?.message || error.message || "Failed to load campaigns",
    };
  }
}

export async function getCampaignById(id) {
  try {
    const { data } = await api.get(`/api/v1/campaigns/${id}`);
    return {
      success: true,
      item: data?.campaign || data?.data || null,
    };
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);
    return {
      success: false,
      item: null,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Certificates
export async function getCertificates(params = { page: 1, limit: 50 }) {
  try {
    const { data } = await api.get("/api/v1/certificates/all", { params });
    return {
      success: true,
      items: data?.certificates || data?.data?.certificates || [],
      pagination: data?.pagination || null,
    };
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return {
      success: false,
      items: [],
      error: error.response?.data?.message || error.message || "Failed to load certificates",
    };
  }
}

export async function getCertificateById(id) {
  try {
    const { data } = await api.get(`/api/v1/certificates/${id}`);
    return {
      success: true,
      item: data?.certificate || data?.data || null,
    };
  } catch (error) {
    console.error(`Error fetching certificate ${id}:`, error);
    return {
      success: false,
      item: null,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Reviews & Feedback
export async function getFeedbacks(params = { page: 1, limit: 50 }) {
  try {
    const { data } = await api.get("/api/v1/feedbacks/public", { params });
    return {
      success: true,
      items: data?.feedbacks || [],
      stats: data?.stats || { totalReviews: 0, averageRating: 5.0, breakdown: {} },
      pagination: data?.pagination || null,
    };
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return {
      success: false,
      items: [],
      stats: { totalReviews: 0, averageRating: 5.0, breakdown: {} },
      error: error.response?.data?.message || error.message || "Failed to load reviews",
    };
  }
}

export async function submitFeedback(payload) {
  try {
    const { data } = await api.post("/api/v1/feedbacks/submit", payload);
    return {
      success: true,
      message: data?.message || "Feedback submitted successfully!",
      feedback: data?.feedback || null,
    };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to submit feedback",
    };
  }
}

// NGO Settings (Contact, Address, Email, Social links)
export async function getNgoSettings() {
  try {
    const { data } = await api.get("/api/v1/ngo-settings");
    return {
      success: true,
      data: data?.data || null,
    };
  } catch (error) {
    console.error("Error fetching NGO settings:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || "Failed to load NGO settings",
    };
  }
}

// Team Members
export async function getTeamMembers(params = {}) {
  try {
    const { data } = await api.get("/api/v1/team-members", { params });
    return {
      success: true,
      items: data?.items || data?.teamMembers || [],
    };
  } catch (error) {
    console.error("Error fetching team members:", error);
    return {
      success: false,
      items: [],
      error: error.response?.data?.message || error.message || "Failed to load team members",
    };
  }
}


