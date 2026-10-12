const mongoose = require('mongoose');
const { createError } = require('../utils/error.util');
const volunteerRepository = require('../repository/volunteer.repository');
const membershipRepository = require('../repository/membership.repository');
const { UserRole } = require('../constants/app.constants');
const { removeFileFromDisk } = require('../middlewares/image-upload.middleware');
const Donation = require('../models/donation.model');
const Volunteer = require('../models/volunteer.model');
const Membership = require('../models/membership.model');
const User = require('../models/user.model');
const Event = require('../models/event.model');
const Story = require('../models/story.model');

const profileConfigs = {
  volunteer: {
    repository: volunteerRepository,
    fields: [
      'address',
      'animalTypes',
      'skills',
      'experience',
      'availability',
      'rescueCapabilities',
      'preferredActivities',
      'emergencyContact',
      'status',
    ],
    role: UserRole.VOLUNTEER,
  },
  membership: {
    repository: membershipRepository,
    fields: [
      'address',
      'city',
      'state',
      'zipCode',
      'membershipType',
      'startDate',
      'endDate',
      'amount',
      'paymentMethod',
      'transactionId',
      'paymentScreenshot',
      'status',
      'rejectionReason',
      'notes',
    ],
    role: UserRole.MEMBER,
  },
};

function getConfig(profileType) {
  const config = profileConfigs[profileType];
  if (!config) {
    throw createError('Unsupported profile type', 400);
  }
  return config;
}

function validateProfileId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createError('Profile not found', 404);
  }
}

function parsePagination(query = {}) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw createError('page must be positive and limit must be between 1 and 100', 400);
  }
  return { page, limit, skip: (page - 1) * limit };
}

async function listProfiles(profileType, query) {
  const { repository } = getConfig(profileType);
  const { page, limit, skip } = parsePagination(query);
  const [profiles, total] = await Promise.all([
    repository.findAll(skip, limit),
    repository.countAll(),
  ]);
  return { profiles, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getProfile(profileType, id) {
  validateProfileId(id);
  const profile = await getConfig(profileType).repository.findById(id);
  if (!profile) {
    throw createError('Profile not found', 404);
  }
  return profile;
}

async function updateProfile(profileType, id, body) {
  validateProfileId(id);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError('Profile data must be an object', 400);
  }

  const { repository, fields } = getConfig(profileType);
  const updates = Object.fromEntries(
    fields
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => [field, body[field]]),
  );
  if (Object.keys(updates).length === 0) {
    throw createError('At least one editable profile field is required', 400);
  }

  const existingProfile = await repository.findById(id);
  if (!existingProfile) {
    throw createError('Profile not found', 404);
  }
  if (
    updates.paymentScreenshot &&
    existingProfile.paymentScreenshot &&
    updates.paymentScreenshot !== existingProfile.paymentScreenshot
  ) {
    await removeFileFromDisk(existingProfile.paymentScreenshot);
  }

  const profile = await repository.updateById(id, updates);
  if (!profile) {
    throw createError('Profile not found', 404);
  }
  return profile;
}

async function deleteProfile(profileType, id) {
  validateProfileId(id);
  const { repository, role } = getConfig(profileType);
  const existingProfile = await repository.findById(id);
  if (!existingProfile) {
    throw createError('Profile not found', 404);
  }
  if (existingProfile.paymentScreenshot) {
    await removeFileFromDisk(existingProfile.paymentScreenshot);
  }
  const profile = await repository.deleteById(id);
  if (!profile) {
    throw createError('Profile not found', 404);
  }
  const userId = existingProfile?.user?._id || existingProfile?.user || profile?.user?._id || profile?.user;
  if (userId) {
    try {
      await repository.resetUserRole(userId, role);
    } catch {
      // Ignore if user document was already deleted or role reset fails
    }
  }
  return profile;
}

async function getDashboardAnalytics() {
  const [
    totalDonationsCount,
    approvedDonationsCount,
    pendingDonationsCount,
    rejectedDonationsCount,
    fundsAgg,
    pendingFundsAgg,
    totalVolunteers,
    activeVolunteers,
    emergencyVolunteers,
    totalMembers,
    activeMembers,
    totalUsers,
    totalStories,
    totalEvents,
    paymentMethodAgg,
    membershipTypeAgg,
    monthlyAgg,
    recentDonations,
    recentVolunteers,
    recentMembers,
  ] = await Promise.all([
    Donation.countDocuments(),
    Donation.countDocuments({ status: 'Approved' }),
    Donation.countDocuments({ status: 'Pending' }),
    Donation.countDocuments({ status: 'Rejected' }),
    Donation.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Donation.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Volunteer.countDocuments(),
    Volunteer.countDocuments({ status: 'Active' }),
    Volunteer.countDocuments({ 'availability.emergencyAvailable': true }),
    Membership.countDocuments(),
    Membership.countDocuments({ status: 'Active' }),
    User.countDocuments(),
    Story.countDocuments(),
    Event.countDocuments(),
    Donation.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$paymentMethod', 'UPI'] },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
    ]),
    Membership.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$membershipType', 'Standard'] },
          count: { $sum: 1 },
        },
      },
    ]),
    Donation.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          amount: { $sum: '$amount' },
          donations: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Donation.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('donorName donorEmail amount status paymentMethod receiptNumber createdAt')
      .lean(),
    Volunteer.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Membership.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const totalFunds = fundsAgg[0]?.total || 0;
  const pendingFunds = pendingFundsAgg[0]?.total || 0;

  // Build last 6 months trend
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth() + 1;
    const found = monthlyAgg.find((m) => m._id.year === yr && m._id.month === mo);
    last6Months.push({
      key: `${yr}-${mo}`,
      label: `${monthNames[mo - 1]}`,
      year: yr,
      amount: found ? found.amount : 0,
      donations: found ? found.donations : 0,
    });
  }

  return {
    kpis: {
      totalFunds,
      pendingFunds,
      totalDonations: totalDonationsCount,
      approvedDonations: approvedDonationsCount,
      pendingDonations: pendingDonationsCount,
      rejectedDonations: rejectedDonationsCount,
      approvalRate: totalDonationsCount > 0 ? Math.round((approvedDonationsCount / totalDonationsCount) * 100) : 100,
      totalVolunteers,
      activeVolunteers,
      emergencyVolunteers,
      totalMembers,
      activeMembers,
      totalUsers,
      totalStories,
      totalEvents,
    },
    charts: {
      revenueTrend: last6Months,
      paymentMethods: paymentMethodAgg.map((item) => ({
        method: item._id,
        count: item.count,
        amount: item.amount,
      })),
      membershipTypes: membershipTypeAgg.map((item) => ({
        type: item._id,
        count: item.count,
      })),
      donationStatus: [
        { status: 'Approved', count: approvedDonationsCount, color: '#16a34a' },
        { status: 'Pending', count: pendingDonationsCount, color: '#ea580c' },
        { status: 'Rejected', count: rejectedDonationsCount, color: '#dc2626' },
      ],
    },
    recent: {
      donations: recentDonations,
      volunteers: recentVolunteers,
      members: recentMembers,
    },
  };
}

module.exports = {
  listProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  getDashboardAnalytics,
};
