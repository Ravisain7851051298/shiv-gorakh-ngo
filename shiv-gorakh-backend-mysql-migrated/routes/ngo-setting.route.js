const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const { uploadRoot } = require('../middlewares/image-upload.middleware');
const { createError } = require('../utils/error.util');
const {
  getNgoSettings,
  saveNgoSettings,
} = require('../controllers/ngo-setting.controller');

const router = express.Router();
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

// Destination directory
const ngoUploadDir = path.join(uploadRoot, 'ngo-settings');
fs.mkdirSync(ngoUploadDir, { recursive: true });

const extensionsByMimeType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const storage = multer.diskStorage({
  destination: ngoUploadDir,
  filename: (req, file, callback) => {
    const ext = extensionsByMimeType[file.mimetype] || path.extname(file.originalname) || '.jpg';
    callback(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, callback) => {
    if (!Object.prototype.hasOwnProperty.call(extensionsByMimeType, file.mimetype)) {
      return callback(createError('Only JPEG, PNG, WebP, GIF, and SVG images are allowed', 400));
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const ngoUploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'founderImage', maxCount: 1 },
  { name: 'coFounderImage', maxCount: 1 },
  { name: 'authorizedSignature', maxCount: 1 },
  { name: 'presidentSignature', maxCount: 1 },
  { name: 'secretarySignature', maxCount: 1 },
  { name: 'stampImage', maxCount: 1 },
]);

// Public Read
router.get('/', getNgoSettings);

// Admin Update
router.post('/', ...adminOnly, ngoUploadFields, saveNgoSettings);
router.put('/', ...adminOnly, ngoUploadFields, saveNgoSettings);

module.exports = router;
