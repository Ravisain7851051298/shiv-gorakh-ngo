const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const MissionVision = require('../models/mission-vision.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');

const router = express.Router();
const uploadImages = createImageUpload('mission-vision');
const missionVisionController = createContentController({
  Model: MissionVision,
  singular: 'missionVision',
  plural: 'missionVisions',
  folderName: 'mission-vision',
  fields: [
    'title',
    'type',
    'description',
    'tagline',
    'points',
    'icon',
    'order',
    'status',
  ],
  supportsDateFilter: false,
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/create', ...adminOnly, uploadImages, missionVisionController.create);
router.get('/all', missionVisionController.getAll);
router.get('/:id', missionVisionController.getById);
router.patch('/:id', ...adminOnly, uploadImages, missionVisionController.update);
router.delete('/:id', ...adminOnly, missionVisionController.remove);

module.exports = router;
