require("./config/env");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// ================================
// Middleware
// ================================


const allowedOrigins = [
  "https://darkturquoise-nightingale-537304.hostingersite.com",
  "https://admin.shivgorakh.org.in",
  "https://lemonchiffon-walrus-147318.hostingersite.com",
  "https://shivgorakh.org.in",
  "https://www.shivgorakh.org.in",
  "http://localhost:3001",
  "http://localhost:3000",
];


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "Upload")));
app.use("/Upload", express.static(path.join(__dirname, "Upload")));

// ================================
// Health Check
// ================================

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running successfully",
    environment: process.env.NODE_ENV,
  });
});

// ================================
// API Routes
// ================================

const authRoutes = require("./routes/auth.route");
const adminRoutes = require("./routes/admin.route");
const volunteerRoutes = require("./routes/volunteer.route");
const membershipRoutes = require("./routes/membership.route");
const storyRoutes = require("./routes/story.route");
const gallaryRoutes = require("./routes/gallary.route");
const eventRoutes = require("./routes/event.route");
const donationRoutes = require("./routes/donation.route");
const ngoSettingRoutes = require("./routes/ngo-setting.route");
const programRoutes = require("./routes/program.route");
const blogRoutes = require("./routes/blog.route");
const campaignRoutes = require("./routes/campaign.route");
const certificateRoutes = require("./routes/certificate.route");
const feedbackRoutes = require("./routes/feedback.route");
const missionVisionRoutes = require("./routes/mission-vision.route");
const complaintRoutes = require("./routes/complaint.route");
const teamMemberRoutes = require("./routes/team-member.route");
const serviceRoutes = require("./routes/service.route");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/volunteer", volunteerRoutes);
app.use("/api/v1/membership", membershipRoutes);
app.use("/api/v1/stories", storyRoutes);
app.use("/api/v1/story", storyRoutes);
app.use("/api/v1/galleries", gallaryRoutes);
app.use("/api/v1/gallery", gallaryRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/donations", donationRoutes);
app.use("/api/v1/donation", donationRoutes);
app.use("/api/v1/ngo-settings", ngoSettingRoutes);
app.use("/api/v1/contact-settings", ngoSettingRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/program", programRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/news", blogRoutes);
app.use("/api/v1/campaigns", campaignRoutes);
app.use("/api/v1/campaign", campaignRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/certificate", certificateRoutes);
app.use("/api/v1/feedbacks", feedbackRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/reviews", feedbackRoutes);
app.use("/api/v1/mission-vision", missionVisionRoutes);
app.use("/api/v1/missions", missionVisionRoutes);
app.use("/api/v1/mission", missionVisionRoutes);
app.use("/api/v1/vision-mission", missionVisionRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/complaint", complaintRoutes);
app.use("/api/v1/team-members", teamMemberRoutes);
app.use("/api/v1/team-member", teamMemberRoutes);
app.use("/api/v1/team", teamMemberRoutes);
app.use("/api/v1/teams", teamMemberRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/service", serviceRoutes);
app.use("/api/v1/our-services", serviceRoutes);

// ================================
// 404 Handler
// ================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================================
// Global Error Handler
// ================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
