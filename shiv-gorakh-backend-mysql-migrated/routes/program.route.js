const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Program = require('../models/program.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');

const router = express.Router();
const uploadImages = createImageUpload('programs');
const programController = createContentController({
  Model: Program,
  singular: 'program',
  plural: 'programs',
  folderName: 'programs',
  fields: [
    'title',
    'category',
    'description',
    'objective',
    'location',
    'status',
    'beneficiaries',
    'date',
  ],
  supportsDateFilter: true,
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/create', ...adminOnly, uploadImages, programController.create);
router.get('/all', programController.getAll);
router.get('/:id', programController.getById);
router.patch('/:id', ...adminOnly, uploadImages, programController.update);
router.delete('/:id', ...adminOnly, programController.remove);

module.exports = router;
