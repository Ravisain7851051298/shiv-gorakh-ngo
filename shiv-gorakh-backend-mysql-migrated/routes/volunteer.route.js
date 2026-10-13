const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const {
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
} = require('../controllers/volunteer.controller');

const router = express.Router();
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

// Authenticated Volunteer User Routes
router.post('/register', authMiddleware, registerVolunteer);
router.get('/me', authMiddleware, getVolunteer);
router.get('/me/id-card', authMiddleware, downloadIdCard);
router.get('/me/appointment-letter', authMiddleware, downloadAppointmentLetter);
router.get('/me/certificate', authMiddleware, downloadCertificate);
router.patch('/me', authMiddleware, authorizeRoles(UserRole.VOLUNTEER), updateVolunteer);
router.delete('/me', authMiddleware, authorizeRoles(UserRole.VOLUNTEER), deleteVolunteer);

// Admin Volunteer Management Routes
router.get('/admin', ...adminOnly, getAdminVolunteers);
router.get('/admin/all', ...adminOnly, getAdminVolunteers);
router.patch('/admin/:id/approve', ...adminOnly, approveVolunteer);
router.patch('/admin/:id/reject', ...adminOnly, rejectVolunteer);
router.delete('/admin/:id', ...adminOnly, deleteAdminVolunteer);
router.delete('/:id', ...adminOnly, deleteAdminVolunteer);
router.post('/admin/:id/send-certificate', ...adminOnly, sendCertificate);
router.get('/admin/:id/certificate', ...adminOnly, downloadCertificate);
router.post('/admin/:id/send-appointment-letter', ...adminOnly, sendOfferLetter);
router.get('/admin/:id/appointment-letter', ...adminOnly, downloadAppointmentLetter);
router.get('/admin/:id/id-card', ...adminOnly, downloadIdCard);
router.get('/:id/id-card', ...adminOnly, downloadIdCard);

module.exports = router;