const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Service = require('../models/service.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');

const router = express.Router();
const uploadImages = createImageUpload('services');
const serviceController = createContentController({
  Model: Service,
  singular: 'service',
  plural: 'services',
  folderName: 'services',
  fields: [
    'title',
    'category',
    'description',
    'features',
    'icon',
    'status',
    'order',
  ],
  supportsDateFilter: false,
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/create', ...adminOnly, uploadImages, serviceController.create);
router.get('/all', serviceController.getAll);
router.get('/:id', serviceController.getById);
router.patch('/:id', ...adminOnly, uploadImages, serviceController.update);
router.delete('/:id', ...adminOnly, serviceController.remove);

module.exports = router;
