const membershipService = require('../services/membership.services');

function handleMembershipError(error, next) {
  if (error.code === 11000) {
    error.status = 409;
    error.message = 'A membership profile already exists for this user';
  } else if (error.name === 'ValidationError') {
    error.status = 400;
  }
  next(error);
}

async function getMembershipSettings(req, res, next) {
  try {
    const settings = await membershipService.getSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMembershipSettings(req, res, next) {
  try {
    const settings = await membershipService.updateSettings(req.body);
    return res.status(200).json({
      success: true,
      message: 'Membership pricing and settings updated successfully',
      data: settings,
    });
  } catch (error) {
    return next(error);
  }
}

async function registerMembership(req, res, next) {
  try {
    const membership = await membershipService.register(req.user.id, req.body, req.file);
    return res.status(201).json({
      success: true,
      message:
        'Thank you! Your membership application and payment screenshot have been submitted and are pending admin approval.',
      membership,
    });
  } catch (error) {
    return handleMembershipError(error, next);
  }
}

async function getMembership(req, res, next) {
  try {
    const membership = await membershipService.getByUserId(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Membership profile retrieved successfully',
      membership,
    });
  } catch (error) {
    return handleMembershipError(error, next);
  }
}

async function updateMembership(req, res, next) {
  try {
    const membership = await membershipService.update(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Membership profile updated successfully',
      membership,
    });
  } catch (error) {
    return handleMembershipError(error, next);
  }
}

async function deleteMembership(req, res, next) {
  try {
    await membershipService.remove(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Membership profile deleted successfully',
    });
  } catch (error) {
    return handleMembershipError(error, next);
  }
}

async function getAdminMemberships(req, res, next) {
  try {
    const result = await membershipService.getAdminMemberships(req.query);
    return res.status(200).json({
      success: true,
      data: result.memberships,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

async function approveMembership(req, res, next) {
  try {
    const result = await membershipService.approveMembership(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Membership approved! Member ID and Appointment Letter issued.',
      data: result.membership,
      emailSent: result.emailResult.sent,
    });
  } catch (error) {
    return next(error);
  }
}

async function rejectMembership(req, res, next) {
  try {
    const membership = await membershipService.rejectMembership(req.params.id, req.body.reason);
    return res.status(200).json({
      success: true,
      message: 'Membership application marked as rejected.',
      data: membership,
    });
  } catch (error) {
    return next(error);
  }
}

async function sendCertificate(req, res, next) {
  try {
    const result = await membershipService.sendCertificate(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.sent
        ? 'Official Certificate PDF successfully emailed to member!'
        : 'Certificate created, but email could not be delivered: ' + (result.error || ''),
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadCertificate(req, res, next) {
  try {
    const targetId = req.params.id || req.user?._id || 'Member';
    const pdfBuffer = await membershipService.getCertificateBuffer(req.params.id || 'me', req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Membership_Certificate_${targetId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
}

async function downloadAppointmentLetter(req, res, next) {
  try {
    const targetId = req.params.id || req.user?._id || 'Member';
    const pdfBuffer = await membershipService.getAppointmentLetterBuffer(req.params.id || 'me', req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Appointment_Letter_${targetId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
}

async function sendAppointmentLetter(req, res, next) {
  try {
    const result = await membershipService.sendAppointmentLetter(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.sent
        ? 'Official Appointment Letter PDF successfully emailed to member!'
        : 'Appointment Letter created, but email could not be delivered: ' + (result.error || ''),
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadIdCard(req, res, next) {
  try {
    const targetId = req.params.id || req.user?._id || 'Member';
    const pdfBuffer = await membershipService.getIdCardBuffer(req.params.id || 'me', req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Member_ID_Card_${targetId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
}

async function deleteAdminMembership(req, res, next) {
  try {
    const adminService = require('../services/admin.service');
    await adminService.deleteProfile('membership', req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Membership deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMembershipSettings,
  updateMembershipSettings,
  registerMembership,
  getMembership,
  updateMembership,
  deleteMembership,
  getAdminMemberships,
  approveMembership,
  rejectMembership,
  sendCertificate,
  sendAppointmentLetter,
  downloadCertificate,
  downloadAppointmentLetter,
  downloadIdCard,
  deleteAdminMembership,
};