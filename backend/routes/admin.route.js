
const express = require('express');
const {
  logoutUser,
  loginAdmin,
  refreshAdminToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const {
  registerAdmin,
  volunteerProfiles,
  membershipProfiles,
  getAnalyticsSummary,
} = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { optionalAvatarUpload } = require('../middlewares/image-upload.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');

const router = express.Router();
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/refresh-token', refreshAdminToken);
router.post('/logout', authMiddleware, logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', ...adminOnly, getProfile);
router.patch('/profile', ...adminOnly, optionalAvatarUpload, updateProfile);
router.get('/analytics', ...adminOnly, getAnalyticsSummary);

router.get(['/volunteers', '/volunteer'], ...adminOnly, volunteerProfiles.list);
router.get(['/volunteers/:id', '/volunteer/:id'], ...adminOnly, volunteerProfiles.get);
router.patch(['/volunteers/:id', '/volunteer/:id'], ...adminOnly, volunteerProfiles.update);
router.delete(['/volunteers/:id', '/volunteer/:id'], ...adminOnly, volunteerProfiles.remove);
router.patch(['/volunteers/:id/approve', '/volunteer/:id/approve'], ...adminOnly, require('../controllers/volunteer.controller').approveVolunteer);
router.patch(['/volunteers/:id/reject', '/volunteer/:id/reject'], ...adminOnly, require('../controllers/volunteer.controller').rejectVolunteer);
router.post(['/volunteers/:id/send-certificate', '/volunteer/:id/send-certificate'], ...adminOnly, require('../controllers/volunteer.controller').sendCertificate);
router.get(['/volunteers/:id/certificate', '/volunteer/:id/certificate'], ...adminOnly, require('../controllers/volunteer.controller').downloadCertificate);
router.post(['/volunteers/:id/send-appointment-letter', '/volunteer/:id/send-appointment-letter'], ...adminOnly, require('../controllers/volunteer.controller').sendOfferLetter);
router.get(['/volunteers/:id/appointment-letter', '/volunteer/:id/appointment-letter'], ...adminOnly, require('../controllers/volunteer.controller').downloadAppointmentLetter);
router.get(['/volunteers/:id/id-card', '/volunteer/:id/id-card'], ...adminOnly, require('../controllers/volunteer.controller').downloadIdCard);

router.get(['/memberships', '/membership'], ...adminOnly, membershipProfiles.list);
router.get(['/memberships/:id', '/membership/:id'], ...adminOnly, membershipProfiles.get);
router.patch(['/memberships/:id', '/membership/:id'], ...adminOnly, membershipProfiles.update);
router.delete(['/memberships/:id', '/membership/:id'], ...adminOnly, membershipProfiles.remove);
router.patch(['/memberships/:id/approve', '/membership/:id/approve'], ...adminOnly, require('../controllers/membership.controller').approveMembership);
router.patch(['/memberships/:id/reject', '/membership/:id/reject'], ...adminOnly, require('../controllers/membership.controller').rejectMembership);
router.post(['/memberships/:id/send-certificate', '/membership/:id/send-certificate'], ...adminOnly, require('../controllers/membership.controller').sendCertificate);
router.get(['/memberships/:id/certificate', '/membership/:id/certificate'], ...adminOnly, require('../controllers/membership.controller').downloadCertificate);
router.post(['/memberships/:id/send-appointment-letter', '/membership/:id/send-appointment-letter'], ...adminOnly, require('../controllers/membership.controller').sendAppointmentLetter);
router.get(['/memberships/:id/appointment-letter', '/membership/:id/appointment-letter'], ...adminOnly, require('../controllers/membership.controller').downloadAppointmentLetter);
router.get(['/memberships/:id/id-card', '/membership/:id/id-card'], ...adminOnly, require('../controllers/membership.controller').downloadIdCard);

module.exports = router;