const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const { createSingleImageUpload } = require('../middlewares/image-upload.middleware');
const {
  getDonationSettings,
  saveDonationSettings,
  deleteDonationSettings,
  getEmailSettings,
  saveEmailSettings,
  testEmailSettings,
  resendReceipt,
  downloadReceipt,
  submitDonation,
  getUserDonations,
  getAdminDonations,
  updateDonationStatus,
  deleteDonation,
  getTopContributors,
} = require('../controllers/donation.controller');

const router = express.Router();

const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];
const qrUpload = createSingleImageUpload('donation-settings', ['qrCode', 'image']);
const proofUpload = createSingleImageUpload('donations', ['screenshot', 'image']);

// ==========================================
// Public: Top Generous Contributors (Real Data)
// ==========================================
router.get('/top-contributors', getTopContributors);

// ==========================================
// Donation Credentials (UPI & Bank)
// ==========================================
// Public read
router.get('/settings', getDonationSettings);

// Admin manage settings
router.post('/settings', ...adminOnly, qrUpload, saveDonationSettings);
router.put('/settings', ...adminOnly, qrUpload, saveDonationSettings);
router.delete('/settings', ...adminOnly, deleteDonationSettings);

const signatureUpload = createSingleImageUpload('signatures', ['authorizedSignature', 'signature', 'image']);

// ==========================================
// Email & Nodemailer Settings (Admin Only)
// ==========================================
router.get('/email-settings', ...adminOnly, getEmailSettings);
router.post('/email-settings', ...adminOnly, signatureUpload, saveEmailSettings);
router.post('/email-settings/test', ...adminOnly, testEmailSettings);

// ==========================================
// User Donation Submissions
// ==========================================
// Authenticated user submit donation proof
router.post('/', authMiddleware, proofUpload, submitDonation);
router.get('/my', authMiddleware, getUserDonations);
router.get('/:id/receipt', authMiddleware, downloadReceipt);

// ==========================================
// Admin Donation Management
// ==========================================
router.get('/admin', ...adminOnly, getAdminDonations);
router.patch('/admin/:id/status', ...adminOnly, updateDonationStatus);
router.post('/admin/:id/resend-receipt', ...adminOnly, resendReceipt);
router.get('/admin/:id/receipt', ...adminOnly, downloadReceipt);
router.delete('/admin/:id', ...adminOnly, deleteDonation);

module.exports = router;
