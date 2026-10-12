const { UserRole } = require('../constants/app.constants');
const { createError } = require('../utils/error.util');
const { removeFileFromDisk } = require('../middlewares/image-upload.middleware');
const membershipRepository = require('../repository/membership.repository');
const Membership = require('../models/membership.model');
const MembershipSetting = require('../models/membership-setting.model');
const DonationSetting = require('../models/donation-setting.model');
const { sendMembershipApprovedEmail, sendMemberAppointmentLetterEmail } = require('./email.services');
const { generateCertificatePdf } = require('../utils/pdf-certificate.util');
const { generateIdCardPdf } = require('../utils/pdf-id-card.util');

async function getOrCreateSettings() {
  let setting = await MembershipSetting.findOne();
  if (!setting) {
    setting = await MembershipSetting.create({});
  }
  return setting;
}

async function getSettings() {
  const [membershipSetting, donationSetting] = await Promise.all([
    getOrCreateSettings(),
    DonationSetting.findOne({ isActive: true }).lean(),
  ]);

  return {
    membershipTypes: membershipSetting.membershipTypes.filter((t) => t.isActive !== false),
    allTiers: membershipSetting.membershipTypes,
    instructions: membershipSetting.instructions,
    certificatePrefix: membershipSetting.certificatePrefix,
    paymentDetails: donationSetting
      ? {
          upiId: donationSetting.upiId,
          qrCode: donationSetting.qrCode,
          accountHolderName: donationSetting.accountHolderName,
          accountNumber: donationSetting.accountNumber,
          bankName: donationSetting.bankName,
          ifscCode: donationSetting.ifscCode,
          branchName: donationSetting.branchName,
          accountType: donationSetting.accountType,
          instructions: donationSetting.instructions,
        }
      : null,
  };
}

async function updateSettings(body) {
  let setting = await getOrCreateSettings();

  if (Array.isArray(body.membershipTypes)) {
    setting.membershipTypes = body.membershipTypes.map((tier) => ({
      name: String(tier.name || 'Tier').trim(),
      price: Math.max(0, Number(tier.price) || 0),
      periodMonths: Math.max(1, Number(tier.periodMonths) || 12),
      description: String(tier.description || '').trim(),
      benefits: Array.isArray(tier.benefits) ? tier.benefits.map((b) => String(b).trim()).filter(Boolean) : [],
      isActive: tier.isActive !== false,
    }));
  }

  if (typeof body.instructions === 'string') {
    setting.instructions = body.instructions.trim();
  }

  if (typeof body.certificatePrefix === 'string') {
    setting.certificatePrefix = body.certificatePrefix.trim();
  }

  await setting.save();
  return setting;
}

async function register(userId, profileData, file) {
  // If file uploaded, store path
  const profile = { ...profileData };
  if (file) {
    profile.paymentScreenshot = `/uploads/memberships/${file.filename}`;
  }

  // Calculate default dates based on chosen tier
  const settings = await getOrCreateSettings();
  const matchedTier = settings.membershipTypes.find(
    (t) => t.name.toLowerCase() === String(profile.membershipType || '').toLowerCase()
  );

  const months = matchedTier ? matchedTier.periodMonths : 12;
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);

  profile.startDate = startDate;
  profile.endDate = endDate;
  if (matchedTier && !profile.amount) {
    profile.amount = matchedTier.price;
  }
  profile.status = 'Pending'; // All new memberships start as Pending verification

  // Check if an existing membership exists
  const existing = await Membership.findOne({ user: userId });
  if (existing) {
    if (existing.status === 'Active') {
      throw createError('You already have an Active membership profile.', 409);
    }
    if (file && existing.paymentScreenshot) {
      await removeFileFromDisk(existing.paymentScreenshot);
    }
    // Update existing pending/rejected application
    const updated = await Membership.findByIdAndUpdate(
      existing._id,
      { $set: profile },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email phone role');
    return updated;
  }

  const membership = await membershipRepository.createForUser(userId, profile);
  return Membership.findById(membership._id).populate('user', 'name email phone role');
}

async function getByUserId(userId) {
  const membership = await membershipRepository.findByUserId(userId);
  if (!membership) {
    throw createError('Membership profile not found', 404);
  }
  return membership;
}

async function update(userId, profile) {
  const existing = await membershipRepository.findByUserId(userId);
  if (!existing) {
    throw createError('Membership profile not found', 404);
  }
  if (
    profile.paymentScreenshot &&
    existing.paymentScreenshot &&
    profile.paymentScreenshot !== existing.paymentScreenshot
  ) {
    await removeFileFromDisk(existing.paymentScreenshot);
  }
  const membership = await membershipRepository.updateByUserId(userId, profile);
  if (!membership) {
    throw createError('Failed to update membership profile', 500);
  }
  return membership;
}

async function remove(userId) {
  const existing = await membershipRepository.findByUserId(userId);
  if (!existing) {
    throw createError('Membership profile not found', 404);
  }
  if (existing.paymentScreenshot) {
    await removeFileFromDisk(existing.paymentScreenshot);
  }
  const membership = await membershipRepository.deleteByUserId(userId);
  if (!membership) {
    throw createError('Failed to delete membership profile', 500);
  }
  await membershipRepository.resetUserRole(userId, UserRole.MEMBER);
  return membership;
}

async function getAdminMemberships(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && ['Pending', 'Active', 'Rejected'].includes(query.status)) {
    filter.status = query.status;
  }
  if (query.membershipType) {
    filter.membershipType = query.membershipType;
  }

  const [memberships, total] = await Promise.all([
    membershipRepository.findAll(skip, limit, filter),
    membershipRepository.countAll(filter),
  ]);

  return {
    memberships,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

const { generateAppointmentLetterPdf } = require('../utils/pdf-appointment-letter.util');

async function approveMembership(id, adminId) {
  const membership = await Membership.findById(id).populate('user', 'name email phone role');
  if (!membership) {
    throw createError('Membership application not found', 404);
  }

  const year = new Date().getFullYear();
  const uniqueSuffix = String(membership._id).slice(-6).toUpperCase();
  const memberId = membership.memberId || `SG-MEM-${year}-${uniqueSuffix}`;
  const certNumber = membership.certificateNumber || `SG-MEM-${year}-${uniqueSuffix}`;

  membership.status = 'Active';
  membership.approvedAt = new Date();
  membership.approvedBy = adminId;
  membership.memberId = memberId;
  membership.certificateNumber = certNumber;
  if (!membership.startDate) membership.startDate = new Date();

  await membership.save();

  // Elevate user role to MEMBER
  if (membership.user?._id) {
    await membershipRepository.setUserRole(membership.user._id, UserRole.MEMBER);
  }

  // Auto-generate and immediately send official ID Card & Appointment letter via email
  let emailResult = { sent: false };
  try {
    emailResult = await sendMemberAppointmentLetterEmail(membership);
  } catch (err) {
    console.error('Error auto-sending member appointment letter and ID card email upon approval:', err);
    emailResult = { sent: false, error: err.message };
  }

  // NOTE: Per requirement, certificate is NOT auto-issued on approval.
  // User gets Member ID, Appointment Letter and Digital ID Card.
  // Certificate can be issued via mail from admin dashboard on demand.
  return {
    membership,
    emailResult,
    message: emailResult.sent
      ? 'Member approved! Official Member ID Card and Appointment Letter generated and emailed successfully.'
      : 'Member approved! Official Member ID Card and Appointment Letter generated.',
  };
}

async function rejectMembership(id, reason = '') {
  const membership = await Membership.findById(id).populate('user', 'name email phone role');
  if (!membership) {
    throw createError('Membership application not found', 404);
  }

  membership.status = 'Rejected';
  membership.rejectionReason = String(reason || 'Payment proof or details could not be verified').trim();
  await membership.save();

  return membership;
}

async function sendCertificate(id) {
  const membership = await Membership.findById(id).populate('user', 'name email phone role');
  if (!membership) {
    throw createError('Membership not found', 404);
  }
  if (membership.status !== 'Active') {
    throw createError('Only Active approved members can receive an official certificate', 400);
  }

  return sendMembershipApprovedEmail(membership);
}

async function getCertificateBuffer(id, requestingUser = null) {
  let membership;
  if ((id === 'me' || !id) && requestingUser) {
    membership = await Membership.findOne({ user: requestingUser._id || requestingUser.id }).populate('user', 'name email phone role');
  } else {
    membership = await Membership.findById(id).populate('user', 'name email phone role');
  }
  if (!membership) {
    throw createError('Membership not found', 404);
  }
  if (requestingUser && requestingUser.role !== UserRole.ADMIN) {
    const ownerId = membership.user?._id?.toString() || membership.user?.toString();
    const currentUserId = (requestingUser._id || requestingUser.id)?.toString();
    if (ownerId !== currentUserId) {
      throw createError('Unauthorized to access this certificate', 403);
    }
  }
  if (membership.status !== 'Active') {
    throw createError('Certificate is only available for Active approved memberships', 400);
  }
  const setting = await getOrCreateSettings();
  return generateCertificatePdf(membership, setting);
}

async function getAppointmentLetterBuffer(id, requestingUser = null) {
  let membership;
  if ((id === 'me' || !id) && requestingUser) {
    membership = await Membership.findOne({ user: requestingUser._id || requestingUser.id }).populate('user', 'name email phone role');
  } else {
    membership = await Membership.findById(id).populate('user', 'name email phone role');
  }
  if (!membership) {
    throw createError('Membership not found', 404);
  }
  if (requestingUser && requestingUser.role !== UserRole.ADMIN) {
    const ownerId = membership.user?._id?.toString() || membership.user?.toString();
    const currentUserId = (requestingUser._id || requestingUser.id)?.toString();
    if (ownerId !== currentUserId) {
      throw createError('Unauthorized to access this appointment letter', 403);
    }
  }

  const user = membership.user || {};
  const fullAddress = [membership.address, membership.city, membership.state, membership.zipCode].filter(Boolean).join(', ');

  return generateAppointmentLetterPdf({
    personName: user.name || 'Foundation Member',
    personEmail: user.email || '',
    personPhone: user.phone || '',
    personAddress: fullAddress,
    roleTitle: `Foundation Member (${membership.membershipType || 'Official'} Tier)`,
    idNumber: membership.memberId || membership.certificateNumber || `SG-MEM-${new Date().getFullYear()}`,
    issueDate: membership.approvedAt || membership.startDate || new Date(),
    membershipTier: membership.membershipType,
  });
}

async function sendAppointmentLetter(id) {
  const membership = await Membership.findById(id).populate('user', 'name email phone role');
  if (!membership) {
    throw createError('Membership not found', 404);
  }
  if (membership.status !== 'Active') {
    throw createError('Only Active approved members can receive an official appointment letter', 400);
  }

  const { sendMemberAppointmentLetterEmail } = require('./email.services');
  return sendMemberAppointmentLetterEmail(membership);
}

async function getIdCardBuffer(idOrUserId, requestingUser = null) {
  let membership;
  if (idOrUserId === 'me' && requestingUser) {
    membership = await Membership.findOne({ user: requestingUser._id || requestingUser.id }).populate('user', 'name email phone role');
  } else {
    membership = (await Membership.findOne({ user: idOrUserId }).populate('user', 'name email phone role'))
      || (await Membership.findById(idOrUserId).populate('user', 'name email phone role'));
  }

  if (!membership) {
    throw createError('Membership profile not found', 404);
  }

  const user = membership.user || {};
  const year = new Date().getFullYear();
  const uniqueSuffix = String(membership._id).slice(-6).toUpperCase();
  const memberId = membership.memberId || `SG-MEM-${year}-${uniqueSuffix}`;

  return generateIdCardPdf({
    isVolunteer: false,
    idNumber: memberId,
    name: user.name || membership.name || 'Foundation Member',
    phone: user.phone || membership.phone || 'Registered',
    roleTitle: `Official Member (${membership.membershipType || 'Annual'})`,
    bloodGroup: membership.bloodGroup || 'O+',
    city: membership.city || 'Rampur',
    state: membership.state || 'Uttar Pradesh',
    photoUrl: user.profilePicture || membership.profilePicture || '',
    issueDate: membership.approvedAt || membership.startDate || new Date(),
  });
}

module.exports = {
  getSettings,
  updateSettings,
  register,
  getByUserId,
  update,
  remove,
  getAdminMemberships,
  approveMembership,
  rejectMembership,
  sendCertificate,
  sendAppointmentLetter,
  getCertificateBuffer,
  getAppointmentLetterBuffer,
  getIdCardBuffer,
};