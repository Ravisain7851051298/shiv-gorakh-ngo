const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Certificate = require('../models/certificate.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');

const router = express.Router();
const uploadImages = createImageUpload('certificates');
const certificateController = createContentController({
  Model: Certificate,
  singular: 'certificate',
  plural: 'certificates',
  folderName: 'certificates',
  fields: [
    'title',
    'recipientName',
    'certificateType',
    'certificateNumber',
    'issuingAuthority',
    'issueDate',
    'expiryDate',
    'description',
    'date',
    'fileUrl',
  ],
  supportsDateFilter: true,
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/create', ...adminOnly, uploadImages, certificateController.create);
router.get('/all', certificateController.getAll);
router.get('/:id', certificateController.getById);
router.patch('/:id', ...adminOnly, uploadImages, certificateController.update);
router.delete('/:id', ...adminOnly, certificateController.remove);

module.exports = router;
