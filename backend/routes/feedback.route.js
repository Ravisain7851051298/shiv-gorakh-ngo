const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const optionalAuthMiddleware = require('../middlewares/optional-auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const feedbackController = require('../controllers/feedback.controller');

const router = express.Router();
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

// Public / User routes
router.post('/submit', optionalAuthMiddleware, feedbackController.createFeedback);
router.post('/create', optionalAuthMiddleware, feedbackController.createFeedback);
router.get('/public', feedbackController.getPublicFeedbacks);
router.get('/all', feedbackController.getPublicFeedbacks);

// Admin routes (CRUD on feedback with full account details)
router.get('/admin/all', ...adminOnly, feedbackController.getAdminFeedbacks);
router.post('/admin/create', ...adminOnly, feedbackController.adminCreateFeedback);
router.get('/:id', feedbackController.getFeedbackById);
router.patch('/:id', ...adminOnly, feedbackController.updateFeedback);
router.put('/:id', ...adminOnly, feedbackController.updateFeedback);
router.delete('/:id', ...adminOnly, feedbackController.deleteFeedback);

module.exports = router;
