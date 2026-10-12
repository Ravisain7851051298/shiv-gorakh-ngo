const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const { createError } = require('../utils/error.util');
const { uploadRoot } = require('../middlewares/image-upload.middleware');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseImageUrls(value) {
  if (value === undefined) {
    return undefined;
  }
  let urls;
  if (Array.isArray(value)) {
    urls = value;
  } else if (typeof value === 'string') {
    try {
      urls = JSON.parse(value);
    } catch {
      throw createError('imageUrls must be a valid JSON-encoded array', 400);
    }
  } else {
    throw createError('imageUrls must be an array or a JSON-encoded array', 400);
  }
  if (!Array.isArray(urls) || urls.some((url) => typeof url !== 'string')) {
    throw createError('imageUrls must contain only strings', 400);
  }
  return urls;
}

async function deleteUploadedImages(imageUrls, folderName) {
  const folderPath = path.resolve(uploadRoot, folderName);
  const uploadUrlPrefix = `/uploads/${folderName}/`;
  const files = (imageUrls || [])
    .filter((imageUrl) => typeof imageUrl === 'string' && imageUrl.startsWith(uploadUrlPrefix))
    .map((imageUrl) => {
      const filename = imageUrl.slice(uploadUrlPrefix.length);
      const filePath = path.resolve(folderPath, filename);
      if (!filename || filename !== path.basename(filename) || path.dirname(filePath) !== folderPath) {
        return null;
      }
      return filePath;
    })
    .filter(Boolean);

  await Promise.all(files.map(async (filePath) => {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }));
}

function extractAllDocumentImages(item) {
  if (!item) return [];
  const urls = [];
  if (Array.isArray(item.imageUrls)) {
    urls.push(...item.imageUrls);
  }
  if (Array.isArray(item.videoUrls)) {
    urls.push(...item.videoUrls);
  }
  if (typeof item.videoUrl === 'string' && item.videoUrl) {
    urls.push(item.videoUrl);
  }
  if (typeof item.imageUrl === 'string' && item.imageUrl) {
    urls.push(item.imageUrl);
  }
  if (typeof item.fileUrl === 'string' && item.fileUrl) {
    urls.push(item.fileUrl);
  }
  return urls;
}

function createContentController({ Model, singular, plural, folderName, fields, supportsDateFilter = false }) {
  const publicImagePath = (filename) => `/uploads/${folderName}/${filename}`;

  function getPayload(body = {}) {
    return Object.fromEntries(
      fields
        .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
        .map((field) => [field, body[field]]),
    );
  }

  function getPagination(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw createError('page must be positive and limit must be between 1 and 100', 400);
    }
    return { page, limit, skip: (page - 1) * limit };
  }

  function getFilter(query) {
    const filter = {};
    if (query.title) {
      filter.title = { $regex: escapeRegex(String(query.title)), $options: 'i' };
    }
    if (query.search) {
      const search = { $regex: escapeRegex(String(query.search)), $options: 'i' };
      filter.$or = [{ title: search }, { description: search }];
    }
    if (query.category) {
      filter.category = query.category;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.certificateType) {
      filter.certificateType = query.certificateType;
    }
    if (query.type) {
      filter.type = query.type;
    }
    if (supportsDateFilter) {
      const date = {};
      if (query.dateFrom) {
        date.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        date.$lte = new Date(query.dateTo);
      }
      if (Object.values(date).some((value) => Number.isNaN(value.getTime()))) {
        throw createError('dateFrom and dateTo must be valid dates', 400);
      }
      if (date.$gte && date.$lte && date.$gte > date.$lte) {
        throw createError('dateFrom cannot be later than dateTo', 400);
      }
      if (Object.keys(date).length) {
        filter.date = date;
      }
    }
    return filter;
  }

  function normalizePoints(payload) {
    if (payload && payload.points !== undefined) {
      if (typeof payload.points === 'string') {
        try {
          const parsed = JSON.parse(payload.points);
          payload.points = Array.isArray(parsed) ? parsed : [payload.points];
        } catch {
          payload.points = payload.points.split(/\r?\n|,/).map((p) => p.trim()).filter(Boolean);
        }
      }
    }
    if (payload && payload.features !== undefined) {
      if (typeof payload.features === 'string') {
        try {
          const parsed = JSON.parse(payload.features);
          payload.features = Array.isArray(parsed) ? parsed : [payload.features];
        } catch {
          payload.features = payload.features.split(/\r?\n|,/).map((f) => f.trim()).filter(Boolean);
        }
      }
    }
  }

  async function create(req, res, next) {
    try {
      const payload = getPayload(req.body);
      normalizePoints(payload);
      const imageUrls = parseImageUrls(req.body.imageUrls);
      if (imageUrls !== undefined || req.files?.length) {
        payload.imageUrls = [
          ...(imageUrls || []),
          ...(req.files || []).map((file) => publicImagePath(file.filename)),
        ];
      }
      const videoExtensions = ['.mp4', '.webm', '.mov', '.ogv', '.mkv'];
      const videoFiles = (payload.imageUrls || []).filter((url) =>
        videoExtensions.some((ext) => url.toLowerCase().endsWith(ext))
      );
      if (videoFiles.length > 0) {
        payload.videoUrls = videoFiles;
        if (!payload.videoUrl) payload.videoUrl = videoFiles[0];
      }
      if (req.body.videoUrl && !payload.videoUrl) {
        payload.videoUrl = req.body.videoUrl;
      }
      if (req.body.category && !payload.category) {
        payload.category = req.body.category;
      }
      const item = await Model.create(payload);
      return res.status(201).json({ success: true, message: `${singular} created successfully`, [singular]: item });
    } catch (error) {
      return next(error);
    }
  }

  async function getAll(req, res, next) {
    try {
      const filter = getFilter(req.query);
      const { page, limit, skip } = getPagination(req.query);
      const sort = Model.schema?.paths?.order ? { order: 1, createdAt: -1, _id: -1 } : { createdAt: -1, _id: -1 };
      const [items, total] = await Promise.all([
        Model.find(filter).sort(sort).skip(skip).limit(limit),
        Model.countDocuments(filter),
      ]);
      return res.status(200).json({
        success: true,
        message: `${plural} retrieved successfully`,
        [plural]: items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      return next(error);
    }
  }

  async function getById(req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        throw createError(`${singular} not found`, 404);
      }
      const item = await Model.findById(req.params.id);
      if (!item) {
        throw createError(`${singular} not found`, 404);
      }
      return res.status(200).json({ success: true, message: `${singular} retrieved successfully`, [singular]: item });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        throw createError(`${singular} not found`, 404);
      }
      const currentItem = await Model.findById(req.params.id);
      if (!currentItem) {
        throw createError(`${singular} not found`, 404);
      }

      const payload = getPayload(req.body);
      normalizePoints(payload);
      const imageUrls = parseImageUrls(req.body.imageUrls);

      if (imageUrls !== undefined || req.files?.length) {
        const newlyUploadedUrls = (req.files || []).map((file) => publicImagePath(file.filename));
        const updatedImageUrls = [
          ...(imageUrls ?? currentItem.imageUrls ?? []),
          ...newlyUploadedUrls,
        ];
        payload.imageUrls = updatedImageUrls;

        // Delete old images that were removed or replaced during edit
        const previousUrls = Array.isArray(currentItem.imageUrls) ? currentItem.imageUrls : [];
        const retainedSet = new Set(updatedImageUrls);
        const removedUrls = previousUrls.filter((url) => !retainedSet.has(url));
        if (removedUrls.length > 0) {
          await deleteUploadedImages(removedUrls, folderName);
        }
      }

      const videoExtensions = ['.mp4', '.webm', '.mov', '.ogv', '.mkv'];
      const allCurrentMedia = payload.imageUrls || currentItem.imageUrls || [];
      const videoFiles = allCurrentMedia.filter((url) =>
        videoExtensions.some((ext) => url.toLowerCase().endsWith(ext))
      );
      if (videoFiles.length > 0) {
        payload.videoUrls = videoFiles;
        if (!payload.videoUrl && !currentItem.videoUrl) payload.videoUrl = videoFiles[0];
      }
      if (req.body.videoUrl !== undefined) {
        payload.videoUrl = req.body.videoUrl;
      }
      if (req.body.category !== undefined) {
        payload.category = req.body.category;
      }

      // Check if a single file (like fileUrl in certificates) was replaced/cleared
      if (payload.fileUrl !== undefined && currentItem.fileUrl && currentItem.fileUrl !== payload.fileUrl) {
        await deleteUploadedImages([currentItem.fileUrl], folderName);
      }

      if (Object.keys(payload).length === 0) {
        throw createError('At least one field is required to update', 400);
      }

      const item = await Model.findByIdAndUpdate(
        req.params.id,
        payload,
        { returnDocument: 'after', runValidators: true },
      );
      if (!item) {
        throw createError(`${singular} not found`, 404);
      }
      return res.status(200).json({ success: true, message: `${singular} updated successfully`, [singular]: item });
    } catch (error) {
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        throw createError(`${singular} not found`, 404);
      }
      // Check document first
      let item = typeof Model.findById === 'function' ? await Model.findById(req.params.id) : null;
      if (!item) {
        // Fallback for mocked models or direct delete
        item = await Model.findByIdAndDelete(req.params.id);
        if (!item) {
          throw createError(`${singular} not found`, 404);
        }
        await deleteUploadedImages(extractAllDocumentImages(item), folderName);
        return res.status(200).json({ success: true, message: `${singular} deleted successfully` });
      }

      // 1. Delete all uploaded images first from disk
      const imagesToDelete = extractAllDocumentImages(item);
      await deleteUploadedImages(imagesToDelete, folderName);

      // 2. Then delete the document from the database
      await Model.findByIdAndDelete(req.params.id);

      return res.status(200).json({ success: true, message: `${singular} deleted successfully` });
    } catch (error) {
      return next(error);
    }
  }

  return { create, getAll, getById, update, remove };
}

module.exports = { createContentController, deleteUploadedImages, extractAllDocumentImages };
