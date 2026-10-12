const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Complaint = require('../models/complaint.model');
const { createError } = require('../utils/error.util');

const router = express.Router();
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

/**
 * Generate unique Ticket ID e.g. TKT-2026-AB1234
 */
function generateTicketId() {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TKT-${year}-${randomStr}`;
}

// ==========================================
// User Routes (Volunteer / Member / Donor)
// ==========================================

// 1. Submit a new complaint / grievance
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { subject, category, priority, description } = req.body;

    if (!subject || !subject.trim()) {
      throw createError('Complaint subject is required', 400);
    }
    if (!description || !description.trim()) {
      throw createError('Complaint description is required', 400);
    }

    const complaint = await Complaint.create({
      ticketId: generateTicketId(),
      user: req.user._id || req.user.id,
      userName: req.user.name || '',
      userEmail: req.user.email || '',
      userPhone: req.user.phone || '',
      userRole: (req.user.role || 'volunteer').toLowerCase(),
      subject: subject.trim(),
      category: category || 'General Grievance',
      priority: priority || 'Medium',
      description: description.trim(),
      status: 'Pending Review',
    });

    return res.status(201).json({
      success: true,
      message: 'Your complaint/grievance has been registered successfully.',
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
});

// 2. Get all complaints submitted by current authenticated user
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const complaints = await Complaint.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// Admin Routes
// ==========================================

// 3. Admin: list all complaints with optional filters
router.get('/admin/all', ...adminOnly, async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email phone role profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    return next(error);
  }
});

// 4. Admin: update complaint status and add resolution remarks
router.patch('/admin/:id', ...adminOnly, async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;
    const update = {};
    if (status) update.status = status;
    if (typeof adminRemarks === 'string') update.adminRemarks = adminRemarks.trim();
    if (status === 'Resolved' || status === 'Closed') {
      update.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!complaint) {
      throw createError('Complaint ticket not found', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint ticket updated successfully',
      data: complaint,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
