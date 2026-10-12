const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Campaign = require('../models/campaign.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');

const router = express.Router();
const uploadImages = createImageUpload('campaigns');
const campaignController = createContentController({
  Model: Campaign,
  singular: 'campaign',
  plural: 'campaigns',
  folderName: 'campaigns',
  fields: [
    'title',
    'category',
    'description',
    'targetAmount',
    'raisedAmount',
    'status',
    'startDate',
    'endDate',
    'date',
  ],
  supportsDateFilter: true,
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/create', ...adminOnly, uploadImages, campaignController.create);
router.get('/all', campaignController.getAll);
router.get('/:id', campaignController.getById);
router.patch('/:id', ...adminOnly, uploadImages, campaignController.update);
router.delete('/:id', ...adminOnly, campaignController.remove);

module.exports = router;
