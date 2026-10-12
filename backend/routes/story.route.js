const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Story = require('../models/story.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');

const router = express.Router();
const uploadImages = createImageUpload('stories');
const storyController = createContentController({
  Model: Story,
  singular: 'story',
  plural: 'stories',
  folderName: 'stories',
  fields: ['title', 'description'],
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/create', ...adminOnly, uploadImages, storyController.create);
router.get('/all', storyController.getAll);
router.get('/:id', storyController.getById);
router.patch('/:id', ...adminOnly, uploadImages, storyController.update);
router.delete('/:id', ...adminOnly, storyController.remove);

module.exports = router;
