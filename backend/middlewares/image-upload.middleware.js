const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { createError } = require('../utils/error.util');

const uploadRoot = path.join(__dirname, '..', 'Upload');
const extensionsByMimeType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/ogg': '.ogv',
  'video/x-matroska': '.mkv',
};

function createImageUpload(folderName) {
  const destination = path.join(uploadRoot, folderName);
  fs.mkdirSync(destination, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination,
      filename: (req, file, callback) => {
        const ext = extensionsByMimeType[file.mimetype] || path.extname(file.originalname) || '.bin';
        callback(null, `${crypto.randomUUID()}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!Object.prototype.hasOwnProperty.call(extensionsByMimeType, file.mimetype)) {
        return callback(createError('Only JPEG, PNG, WebP, GIF images and MP4, WebM, MOV videos are allowed', 400));
      }
      return callback(null, true);
    },
    limits: {
      fileSize: 100 * 1024 * 1024,
      files: 10,
    },
  });

  return (req, res, next) => {
    upload.array('images', 10)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        error.status = 400;
      }
      next(error);
    });
  };
}

function createSingleImageUpload(folderName, fieldNames = ['image', 'screenshot', 'qrCode']) {
  const destination = path.join(uploadRoot, folderName);
  fs.mkdirSync(destination, { recursive: true });

  const storage = multer.diskStorage({
    destination,
    filename: (req, file, callback) => {
      const ext = extensionsByMimeType[file.mimetype] || path.extname(file.originalname) || '.jpg';
      callback(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, callback) => {
      if (!Object.prototype.hasOwnProperty.call(extensionsByMimeType, file.mimetype)) {
        return callback(createError('Only JPEG, PNG, WebP, and GIF images are allowed', 400));
      }
      return callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  });

  return (req, res, next) => {
    const fields = Array.isArray(fieldNames)
      ? fieldNames.map((name) => ({ name, maxCount: 1 }))
      : [{ name: fieldNames, maxCount: 1 }];

    upload.fields(fields)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        error.status = 400;
      }
      if (req.files) {
        for (const name of Array.isArray(fieldNames) ? fieldNames : [fieldNames]) {
          if (req.files[name] && req.files[name][0]) {
            req.file = req.files[name][0];
            break;
          }
        }
      }
      next(error);
    });
  };
}

const uploadAvatar = createSingleImageUpload('avatars', ['avatar', 'profilePicture', 'image']);

function optionalAvatarUpload(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return uploadAvatar(req, res, next);
  }
  return next();
}

async function removeFileFromDisk(relativeUrl) {
  if (!relativeUrl || typeof relativeUrl !== 'string') return;
  if (!relativeUrl.startsWith('/uploads/')) return;
  try {
    const cleanPath = relativeUrl.replace(/^\/uploads\//, '');
    const absolutePath = path.resolve(uploadRoot, cleanPath);
    if (absolutePath.startsWith(uploadRoot)) {
      await fs.promises.unlink(absolutePath).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to unlink file:', err.message);
  }
}

module.exports = {
  createImageUpload,
  createSingleImageUpload,
  uploadAvatar,
  optionalAvatarUpload,
  removeFileFromDisk,
  uploadRoot,
};
