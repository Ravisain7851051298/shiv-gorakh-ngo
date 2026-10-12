const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const { createSingleImageUpload } = require('../middlewares/image-upload.middleware');
const {
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
} = require('../controllers/membership.controller');

const router = express.Router();
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];
const proofUpload = createSingleImageUpload('memberships', ['screenshot', 'paymentScreenshot', 'image']);

// ==========================================
// Public Settings (Membership Tiers & Pricing)
// ==========================================
router.get('/settings', getMembershipSettings);

// ==========================================
// Authenticated Member Registration & Status
// ==========================================
router.post('/register', authMiddleware, proofUpload, registerMembership);
router.get('/me', authMiddleware, getMembership);
router.patch('/me', authMiddleware, updateMembership);
router.delete('/me', authMiddleware, deleteMembership);
router.get('/me/id-card', authMiddleware, downloadIdCard);
router.get('/me/appointment-letter', authMiddleware, downloadAppointmentLetter);
router.get('/:id/id-card', authMiddleware, downloadIdCard);
router.get('/:id/appointment-letter', authMiddleware, downloadAppointmentLetter);
router.get('/:id/certificate', authMiddleware, downloadCertificate);

// ==========================================
// Admin Membership Management & Approvals
// ==========================================
router.get('/admin', ...adminOnly, getAdminMemberships);
router.get('/admin/all', ...adminOnly, getAdminMemberships);
router.put('/admin/settings', ...adminOnly, updateMembershipSettings);
router.post('/admin/settings', ...adminOnly, updateMembershipSettings);
router.patch('/admin/:id/approve', ...adminOnly, approveMembership);
router.patch('/admin/:id/reject', ...adminOnly, rejectMembership);
router.delete('/admin/:id', ...adminOnly, deleteAdminMembership);
router.delete('/:id', ...adminOnly, deleteAdminMembership);
router.post('/admin/:id/send-certificate', ...adminOnly, sendCertificate);
router.get('/admin/:id/certificate', ...adminOnly, downloadCertificate);
router.post('/admin/:id/send-appointment-letter', ...adminOnly, sendAppointmentLetter);
router.get('/admin/:id/appointment-letter', ...adminOnly, downloadAppointmentLetter);
router.get('/admin/:id/id-card', ...adminOnly, downloadIdCard);

module.exports = router;