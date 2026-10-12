const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const { createSingleImageUpload } = require('../middlewares/image-upload.middleware');
const teamMemberController = require('../controllers/team-member.controller');

const router = express.Router();
const uploadImage = createSingleImageUpload('team', ['image', 'photo', 'avatar', 'images']);
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

// Public routes
router.get('/', teamMemberController.getAllTeamMembers);
router.get('/all', teamMemberController.getAllTeamMembers);
router.get('/:id', teamMemberController.getTeamMemberById);

// Admin CRUD routes
router.post('/', ...adminOnly, uploadImage, teamMemberController.createTeamMember);
router.post('/create', ...adminOnly, uploadImage, teamMemberController.createTeamMember);

router.put('/:id', ...adminOnly, uploadImage, teamMemberController.updateTeamMember);
router.patch('/:id', ...adminOnly, uploadImage, teamMemberController.updateTeamMember);

router.delete('/:id', ...adminOnly, teamMemberController.deleteTeamMember);

module.exports = router;
