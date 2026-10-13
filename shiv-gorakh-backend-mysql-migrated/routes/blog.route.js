const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Blog = require('../models/blog.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');

const router = express.Router();
const uploadImages = createImageUpload('blogs');
const blogController = createContentController({
  Model: Blog,
  singular: 'blog',
  plural: 'blogs',
  folderName: 'blogs',
  fields: [
    'title',
    'category',
    'summary',
    'description',
    'author',
    'publishedDate',
    'date',
    'isFeatured',
  ],
  supportsDateFilter: true,
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

router.post('/create', ...adminOnly, uploadImages, blogController.create);
router.get('/all', blogController.getAll);
router.get('/:id', blogController.getById);
router.patch('/:id', ...adminOnly, uploadImages, blogController.update);
router.delete('/:id', ...adminOnly, blogController.remove);

module.exports = router;
