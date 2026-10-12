const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Gallary = require('../models/gallary.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');

const router = express.Router();
const uploadImages = createImageUpload('gallary');
const gallaryController = createContentController({
  Model: Gallary,
  singular: 'gallary',
  plural: 'galleries',
  folderName: 'gallary',
  fields: ['title', 'description', 'category', 'videoUrl', 'videoUrls'],
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/create', ...adminOnly, uploadImages, gallaryController.create);
router.get('/all', gallaryController.getAll);
router.get('/:id', gallaryController.getById);
router.patch('/:id', ...adminOnly, uploadImages, gallaryController.update);
router.delete('/:id', ...adminOnly, gallaryController.remove);

module.exports = router;
