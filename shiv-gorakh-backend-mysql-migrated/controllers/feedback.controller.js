const mongoose = require('../config/mysql-odm.js');
const Feedback = require('../models/feedback.model');
const { createError } = require('../utils/error.util');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// User or Guest Submit Feedback
async function createFeedback(req, res, next) {
  try {
    const { name, email, phone, rating, message } = req.body;

    const numRating = Number(rating);
    if (!Number.isFinite(numRating) || numRating < 1 || numRating > 5) {
      throw createError('Rating must be a number between 1 and 5', 400);
    }

    const cleanMessage = String(message || '').trim();
    if (!cleanMessage) {
      throw createError('Feedback message is required', 400);
    }

    let feedbackData = {
      rating: Math.round(numRating),
      message: cleanMessage,
      status: 'Approved',
    };

    if (req.user) {
      feedbackData.user = req.user._id;
      feedbackData.name = req.user.name || name || 'Anonymous Supporter';
      feedbackData.email = req.user.email || email || '';
      feedbackData.phone = req.user.phone || phone || '';
      feedbackData.userRole = req.user.role || 'donor';
      feedbackData.profilePicture = req.user.profilePicture || '';
    } else {
      const cleanName = String(name || '').trim();
      if (!cleanName) {
        throw createError('Your name is required to submit feedback', 400);
      }
      feedbackData.name = cleanName;
      feedbackData.email = String(email || '').trim().toLowerCase();
      feedbackData.phone = String(phone || '').trim();
      feedbackData.userRole = 'supporter';
    }

    const created = await Feedback.create(feedbackData);
    const populated = await Feedback.findById(created._id).populate(
      'user',
      'name email phone role profilePicture createdAt'
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been submitted successfully.',
      feedback: populated,
    });
  } catch (error) {
    return next(error);
  }
}

// Public Get All Approved Feedbacks for NGO Site Display
async function getPublicFeedbacks(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
    const skip = (page - 1) * limit;

    const filter = { status: 'Approved' };

    const [items, total, allApproved] = await Promise.all([
      Feedback.find(filter)
        .populate('user', 'name email role profilePicture createdAt')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(filter),
      Feedback.find(filter).select('rating'),
    ]);

    // Calculate rating statistics
    const totalCount = allApproved.length;
    const ratingSum = allApproved.reduce((acc, curr) => acc + (curr.rating || 5), 0);
    const averageRating = totalCount > 0 ? Number((ratingSum / totalCount).toFixed(1)) : 5.0;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allApproved.forEach((item) => {
      const r = Math.min(5, Math.max(1, Math.round(item.rating || 5)));
      breakdown[r] = (breakdown[r] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      message: 'Feedbacks retrieved successfully',
      feedbacks: items,
      stats: {
        totalReviews: totalCount,
        averageRating,
        breakdown,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

// Admin Get All Feedbacks with Full Account Details
async function getAdminFeedbacks(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.rating && req.query.rating !== 'all') {
      filter.rating = Number(req.query.rating);
    }

    if (req.query.search) {
      const term = escapeRegex(String(req.query.search).trim());
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
        { message: { $regex: term, $options: 'i' } },
      ];
    }

    const [items, total, counts] = await Promise.all([
      Feedback.find(filter)
        .populate('user', 'name email phone role profilePicture createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(filter),
      Promise.all([
        Feedback.countDocuments({}),
        Feedback.countDocuments({ status: 'Approved' }),
        Feedback.countDocuments({ status: 'Pending' }),
        Feedback.countDocuments({ status: 'Rejected' }),
      ]),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Feedbacks retrieved successfully',
      feedbacks: items,
      counts: {
        all: counts[0],
        approved: counts[1],
        pending: counts[2],
        rejected: counts[3],
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

// Admin or Public Get Single Feedback by ID
async function getFeedbackById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw createError('Feedback not found', 404);
    }
    const item = await Feedback.findById(req.params.id).populate(
      'user',
      'name email phone role profilePicture createdAt'
    );
    if (!item) {
      throw createError('Feedback not found', 404);
    }
    return res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      feedback: item,
    });
  } catch (error) {
    return next(error);
  }
}

// Admin Update Feedback (Edit rating, message, status, adminReply, isFeatured)
async function updateFeedback(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw createError('Feedback not found', 404);
    }

    const allowed = ['rating', 'message', 'status', 'isFeatured', 'adminReply', 'name', 'userRole'];
    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        payload[key] = req.body[key];
      }
    }

    if (payload.rating !== undefined) {
      payload.rating = Math.min(5, Math.max(1, Number(payload.rating)));
    }

    if (Object.keys(payload).length === 0) {
      throw createError('No fields to update', 400);
    }

    const updated = await Feedback.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('user', 'name email phone role profilePicture createdAt');

    if (!updated) {
      throw createError('Feedback not found', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updated,
    });
  } catch (error) {
    return next(error);
  }
}

// Admin Delete Feedback
async function deleteFeedback(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw createError('Feedback not found', 404);
    }
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw createError('Feedback not found', 404);
    }
    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
}

// Admin Manual Create Feedback
async function adminCreateFeedback(req, res, next) {
  try {
    const { name, email, phone, userRole, rating, message, status, adminReply, isFeatured } = req.body;

    if (!name || !message) {
      throw createError('Name and feedback message are required', 400);
    }

    const feedback = await Feedback.create({
      name: String(name).trim(),
      email: String(email || '').trim().toLowerCase(),
      phone: String(phone || '').trim(),
      userRole: String(userRole || 'supporter').trim(),
      rating: Math.min(5, Math.max(1, Number(rating || 5))),
      message: String(message).trim(),
      status: status || 'Approved',
      adminReply: String(adminReply || '').trim(),
      isFeatured: Boolean(isFeatured),
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      feedback,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createFeedback,
  getPublicFeedbacks,
  getAdminFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  adminCreateFeedback,
};
