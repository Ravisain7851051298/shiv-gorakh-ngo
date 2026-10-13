const volunteerService = require('../services/volunteer.services');

function handleVolunteerError(error, next) {
  if (error.code === 11000) {
    error.status = 409;
    error.message = 'A volunteer profile already exists for this user';
  } else if (error.name === 'ValidationError') {
    error.status = 400;
  }
  next(error);
}

async function registerVolunteer(req, res, next) {
  try {
    const volunteer = await volunteerService.register(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully. It is pending admin approval.',
      volunteer,
    });
  } catch (error) {
    return handleVolunteerError(error, next);
  }
}

async function getVolunteer(req, res, next) {
  try {
    const volunteer = await volunteerService.getByUserId(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Volunteer profile retrieved successfully',
      volunteer,
    });
  } catch (error) {
    return handleVolunteerError(error, next);
  }
}

async function updateVolunteer(req, res, next) {
  try {
    const volunteer = await volunteerService.update(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Volunteer profile updated successfully',
      volunteer,
    });
  } catch (error) {
    return handleVolunteerError(error, next);
  }
}

async function deleteVolunteer(req, res, next) {
  try {
    await volunteerService.remove(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Volunteer profile deleted successfully',
    });
  } catch (error) {
    return handleVolunteerError(error, next);
  }
}

async function getAdminVolunteers(req, res, next) {
  try {
    const result = await volunteerService.getAdminVolunteers(req.query);
    return res.status(200).json({
      success: true,
      data: result.volunteers,
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

async function approveVolunteer(req, res, next) {
  try {
    const result = await volunteerService.approveVolunteer(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Volunteer approved! Official Volunteer ID Card and Offer Letter issued.',
      data: result.volunteer,
    });
  } catch (error) {
    return next(error);
  }
}

async function rejectVolunteer(req, res, next) {
  try {
    const volunteer = await volunteerService.rejectVolunteer(req.params.id, req.body.reason);
    return res.status(200).json({
      success: true,
      message: 'Volunteer application marked as suspended/rejected.',
      data: volunteer,
    });
  } catch (error) {
    return next(error);
  }
}

async function sendCertificate(req, res, next) {
  try {
    const result = await volunteerService.sendCertificate(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.sent
        ? 'Official Certificate PDF successfully emailed to volunteer!'
        : 'Certificate created, but email could not be delivered: ' + (result.error || ''),
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadCertificate(req, res, next) {
  try {
    const targetId = req.params.id || req.user?._id || req.user?.id || 'Volunteer';
    const pdfBuffer = await volunteerService.getCertificateBuffer(req.params.id || 'me', req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Volunteer_Certificate_${targetId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return handleVolunteerError(error, next);
  }
}

async function sendOfferLetter(req, res, next) {
  try {
    const result = await volunteerService.sendOfferLetter(req.params.id);
    return res.status(200).json({
      success: true,
      message: result.sent
        ? 'Official Offer & Appointment Letter PDF successfully emailed to volunteer!'
        : 'Offer Letter created, but email could not be delivered: ' + (result.error || ''),
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadAppointmentLetter(req, res, next) {
  try {
    const targetId = req.params.id || req.user.id;
    const pdfBuffer = await volunteerService.getAppointmentLetterBuffer(targetId, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Volunteer_Appointment_Letter_${targetId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return handleVolunteerError(error, next);
  }
}

async function downloadIdCard(req, res, next) {
  try {
    const targetId = req.params.id || req.user.id;
    const pdfBuffer = await volunteerService.getIdCardBuffer(targetId, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Volunteer_ID_Card_${targetId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return handleVolunteerError(error, next);
  }
}

async function deleteAdminVolunteer(req, res, next) {
  try {
    const adminService = require('../services/admin.service');
    await adminService.deleteProfile('volunteer', req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Volunteer profile deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerVolunteer,
  getVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getAdminVolunteers,
  approveVolunteer,
  rejectVolunteer,
  sendCertificate,
  downloadCertificate,
  sendOfferLetter,
  downloadAppointmentLetter,
  downloadIdCard,
  deleteAdminVolunteer,
};