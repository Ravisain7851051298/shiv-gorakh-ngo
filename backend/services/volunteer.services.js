const { UserRole } = require('../constants/app.constants');
const { createError } = require('../utils/error.util');
const volunteerRepository = require('../repository/volunteer.repository');
const Volunteer = require('../models/volunteer.model');
const { generateAppointmentLetterPdf } = require('../utils/pdf-appointment-letter.util');
const { generateCertificatePdf } = require('../utils/pdf-certificate.util');
const { generateIdCardPdf } = require('../utils/pdf-id-card.util');
const {
  sendVolunteerCertificateEmail,
  sendVolunteerOfferLetterEmail,
} = require('./email.services');

const editableFields = [
  'address',
  'animalTypes',
  'skills',
  'experience',
  'availability',
  'rescueCapabilities',
  'preferredActivities',
  'emergencyContact',
];

function pickEditableFields(profile = {}) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    throw createError('Volunteer profile must be an object', 400);
  }

  return Object.fromEntries(
    editableFields
      .filter((field) => Object.prototype.hasOwnProperty.call(profile, field))
      .map((field) => [field, profile[field]]),
  );
}

async function register(userId, profile) {
  const editableProfile = pickEditableFields(profile);
  const volunteer = await volunteerRepository.createForUser(userId, editableProfile);
  const user = await volunteerRepository.setUserRole(userId, UserRole.VOLUNTEER);

  if (!user) {
    await volunteerRepository.deleteByUserId(userId);
    throw createError('Authenticated user not found', 404);
  }

  return volunteer;
}

async function getByUserId(userId) {
  const volunteer = await volunteerRepository.findByUserId(userId);
  if (!volunteer) {
    throw createError('Volunteer profile not found', 404);
  }

  // Ensure volunteerId is present if already active
  if (volunteer.status === 'ACTIVE' && !volunteer.volunteerId) {
    const year = new Date().getFullYear();
    const uniqueSuffix = String(volunteer._id).slice(-6).toUpperCase();
    volunteer.volunteerId = `SG-VOL-${year}-${uniqueSuffix}`;
    if (!volunteer.approvedAt) volunteer.approvedAt = volunteer.createdAt || new Date();
    await volunteer.save();
  }

  return volunteer;
}

async function update(userId, profile) {
  const editableProfile = pickEditableFields(profile);
  if (Object.keys(editableProfile).length === 0) {
    throw createError('At least one editable volunteer field is required', 400);
  }

  const volunteer = await volunteerRepository.updateByUserId(userId, editableProfile);
  if (!volunteer) {
    throw createError('Volunteer profile not found', 404);
  }
  return volunteer;
}

async function remove(userId) {
  const volunteer = await volunteerRepository.deleteByUserId(userId);
  if (!volunteer) {
    throw createError('Volunteer profile not found', 404);
  }

  const user = await volunteerRepository.setUserRole(userId, UserRole.DONOR);
  if (!user) {
    throw createError('Authenticated user not found', 404);
  }
  return volunteer;
}

async function getAdminVolunteers(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status && ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(query.status.toUpperCase())) {
    filter.status = query.status.toUpperCase();
  }

  const [volunteers, total] = await Promise.all([
    volunteerRepository.findAll(skip, limit, filter),
    volunteerRepository.countAll(filter),
  ]);

  return {
    volunteers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

async function approveVolunteer(id, adminId) {
  const volunteer = await Volunteer.findById(id).populate('user', 'name email phone role');
  if (!volunteer) {
    throw createError('Volunteer application not found', 404);
  }

  const year = new Date().getFullYear();
  const uniqueSuffix = String(volunteer._id).slice(-6).toUpperCase();
  if (!volunteer.volunteerId) {
    volunteer.volunteerId = `SG-VOL-${year}-${uniqueSuffix}`;
  }

  volunteer.status = 'ACTIVE';
  volunteer.approvedAt = new Date();
  volunteer.approvedBy = adminId;
  await volunteer.save();

  // Elevate user role to VOLUNTEER
  if (volunteer.user?._id) {
    await volunteerRepository.setUserRole(volunteer.user._id, UserRole.VOLUNTEER);
  }

  // Auto-generate and immediately send official ID Card & Offer/Appointment letter via email
  let emailResult = { sent: false };
  try {
    emailResult = await sendVolunteerOfferLetterEmail(volunteer);
  } catch (err) {
    console.error('Error auto-sending volunteer offer letter and ID card email upon approval:', err);
    emailResult = { sent: false, error: err.message };
  }

  // NOTE: Certificate is NOT auto-issued on approval (admin will send manually on-demand).
  return {
    volunteer,
    emailResult,
    message: emailResult.sent
      ? 'Volunteer approved! Official ID Card and Offer Letter generated and emailed successfully.'
      : 'Volunteer approved! Official ID Card and Offer Letter generated.',
  };
}

async function rejectVolunteer(id, reason = '') {
  const volunteer = await Volunteer.findById(id).populate('user', 'name email phone role');
  if (!volunteer) {
    throw createError('Volunteer application not found', 404);
  }

  volunteer.status = 'SUSPENDED';
  volunteer.rejectionReason = String(reason || 'Application suspended or rejected by admin').trim();
  await volunteer.save();

  return volunteer;
}

async function sendCertificate(id) {
  const volunteer = await Volunteer.findById(id).populate('user', 'name email phone role');
  if (!volunteer) {
    throw createError('Volunteer not found', 404);
  }
  if (volunteer.status !== 'ACTIVE') {
    throw createError('Only Active approved volunteers can receive an official certificate', 400);
  }

  return sendVolunteerCertificateEmail(volunteer);
}

async function getCertificateBuffer(id, requestingUser = null) {
  let volunteer;
  if ((id === 'me' || !id) && requestingUser) {
    volunteer = await Volunteer.findOne({ user: requestingUser._id || requestingUser.id }).populate('user', 'name email phone role');
  } else {
    volunteer = await Volunteer.findById(id).populate('user', 'name email phone role');
  }
  if (!volunteer) {
    throw createError('Volunteer profile not found', 404);
  }
  if (volunteer.status !== 'ACTIVE') {
    throw createError('Certificate is only available for Active approved volunteers', 400);
  }

  return generateCertificatePdf({
    ...(typeof volunteer.toObject === 'function' ? volunteer.toObject() : volunteer),
    isVolunteer: true,
    name: volunteer.user?.name || 'Authorized Volunteer',
    certificateNumber: volunteer.certificateNumber || volunteer.volunteerId,
  });
}

async function sendOfferLetter(id) {
  const volunteer = await Volunteer.findById(id).populate('user', 'name email phone role');
  if (!volunteer) {
    throw createError('Volunteer not found', 404);
  }
  if (volunteer.status !== 'ACTIVE') {
    throw createError('Only Active approved volunteers can receive an official offer letter', 400);
  }

  return sendVolunteerOfferLetterEmail(volunteer);
}

async function getAppointmentLetterBuffer(idOrUserId, requestingUser = null) {
  let volunteer;
  if (idOrUserId === 'me' && requestingUser) {
    volunteer = await Volunteer.findOne({ user: requestingUser._id || requestingUser.id }).populate('user', 'name email phone role');
  } else {
    volunteer = (await Volunteer.findOne({ user: idOrUserId }).populate('user', 'name email phone role'))
      || (await Volunteer.findById(idOrUserId).populate('user', 'name email phone role'));
  }

  if (!volunteer) {
    throw createError('Volunteer profile not found', 404);
  }

  if (!volunteer.volunteerId) {
    const year = new Date().getFullYear();
    const uniqueSuffix = String(volunteer._id).slice(-6).toUpperCase();
    volunteer.volunteerId = `SG-VOL-${year}-${uniqueSuffix}`;
    await volunteer.save();
  }

  const user = volunteer.user || requestingUser || {};
  const fullAddress = [
    volunteer.address?.addressLine,
    volunteer.address?.city,
    volunteer.address?.state,
    volunteer.address?.pincode,
  ].filter(Boolean).join(', ') || 'Rampur, Uttar Pradesh';

  return generateAppointmentLetterPdf({
    personName: user.name || 'Authorized Volunteer',
    personEmail: user.email || '',
    personPhone: user.phone || volunteer.emergencyContact?.phone || '',
    personAddress: fullAddress,
    roleTitle: 'Authorized Field Volunteer & Animal Rescue Corps',
    idNumber: volunteer.volunteerId,
    issueDate: volunteer.approvedAt || volunteer.createdAt || new Date(),
  });
}

async function getIdCardBuffer(idOrUserId, requestingUser = null) {
  let volunteer;
  if (idOrUserId === 'me' && requestingUser) {
    volunteer = await Volunteer.findOne({ user: requestingUser._id || requestingUser.id }).populate('user', 'name email phone role');
  } else {
    volunteer = (await Volunteer.findOne({ user: idOrUserId }).populate('user', 'name email phone role'))
      || (await Volunteer.findById(idOrUserId).populate('user', 'name email phone role'));
  }

  if (!volunteer) {
    throw createError('Volunteer profile not found', 404);
  }

  if (!volunteer.volunteerId) {
    const year = new Date().getFullYear();
    const uniqueSuffix = String(volunteer._id).slice(-6).toUpperCase();
    volunteer.volunteerId = `SG-VOL-${year}-${uniqueSuffix}`;
    await volunteer.save();
  }

  const user = volunteer.user || requestingUser || {};
  return generateIdCardPdf({
    isVolunteer: true,
    idNumber: volunteer.volunteerId,
    name: user.name || 'Authorized Volunteer',
    phone: user.phone || volunteer.emergencyContact?.phone || '',
    roleTitle: 'Authorized Field Volunteer',
    bloodGroup: volunteer.bloodGroup || 'O+',
    city: volunteer.address?.city || 'Rampur',
    state: volunteer.address?.state || 'Uttar Pradesh',
    photoUrl: user.profilePicture || volunteer.profilePicture || '',
    issueDate: volunteer.approvedAt || volunteer.createdAt || new Date(),
  });
}

module.exports = {
  register,
  getByUserId,
  update,
  remove,
  getAdminVolunteers,
  approveVolunteer,
  rejectVolunteer,
  sendCertificate,
  getCertificateBuffer,
  sendOfferLetter,
  getAppointmentLetterBuffer,
  getIdCardBuffer,
};