const TeamMember = require('../models/team-member.model');
const { createError } = require('../utils/error.util');
const path = require('path');
const fs = require('fs/promises');

// Delete file from disk if uploaded
async function safeDeleteFile(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return;
  try {
    const clean = relativePath.replace(/^\/uploads\//, '');
    const fullPath = path.resolve(__dirname, '..', 'Upload', clean);
    await fs.unlink(fullPath);
  } catch (err) {
    // ignore if file doesn't exist
  }
}

function parseSocialLinks(links) {
  if (!links) return { linkedin: '', twitter: '', instagram: '', facebook: '' };
  if (typeof links === 'object' && !Array.isArray(links)) return links;
  try {
    return JSON.parse(links);
  } catch {
    return { linkedin: '', twitter: '', instagram: '', facebook: '' };
  }
}

// GET all team members (public/admin)
async function getAllTeamMembers(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.department && req.query.department !== 'All') {
      filter.department = new RegExp(req.query.department, 'i');
    }
    if (req.query.search) {
      const q = req.query.search.trim();
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { position: new RegExp(q, 'i') },
        { department: new RegExp(q, 'i') },
      ];
    }

    const teamMembers = await TeamMember.find(filter).sort({ order: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: teamMembers.length,
      items: teamMembers,
      teamMembers, // for compatibility
    });
  } catch (error) {
    next(error);
  }
}

// GET single team member
async function getTeamMemberById(req, res, next) {
  try {
    const { id } = req.params;
    const member = await TeamMember.findById(id);
    if (!member) {
      throw createError('Team member not found', 404);
    }
    return res.status(200).json({
      success: true,
      item: member,
      teamMember: member,
    });
  } catch (error) {
    next(error);
  }
}

// CREATE team member
async function createTeamMember(req, res, next) {
  try {
    const { name, position, bio, department, email, phone, order, status } = req.body;

    if (!name || !name.trim()) {
      throw createError('Team member name is required', 400);
    }
    if (!position || !position.trim()) {
      throw createError('Team member position is required', 400);
    }

    let imageUrl = req.body.image || '';
    if (req.file) {
      imageUrl = `/uploads/team/${req.file.filename}`;
    } else if (req.files && req.files.image && req.files.image[0]) {
      imageUrl = `/uploads/team/${req.files.image[0].filename}`;
    } else if (req.files && Array.isArray(req.files) && req.files[0]) {
      imageUrl = `/uploads/team/${req.files[0].filename}`;
    }

    const socialLinks = parseSocialLinks(req.body.socialLinks || {
      linkedin: req.body.linkedin || '',
      twitter: req.body.twitter || '',
      instagram: req.body.instagram || '',
      facebook: req.body.facebook || '',
    });

    const newMember = await TeamMember.create({
      name: name.trim(),
      position: position.trim(),
      image: imageUrl,
      bio: (bio || '').trim(),
      department: (department || 'Leadership').trim(),
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      socialLinks,
      order: Number(order) || 0,
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      item: newMember,
      teamMember: newMember,
    });
  } catch (error) {
    next(error);
  }
}

// UPDATE team member
async function updateTeamMember(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await TeamMember.findById(id);
    if (!existing) {
      throw createError('Team member not found', 404);
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.position !== undefined) updates.position = req.body.position.trim();
    if (req.body.bio !== undefined) updates.bio = req.body.bio.trim();
    if (req.body.department !== undefined) updates.department = req.body.department.trim();
    if (req.body.email !== undefined) updates.email = req.body.email.trim();
    if (req.body.phone !== undefined) updates.phone = req.body.phone.trim();
    if (req.body.order !== undefined) updates.order = Number(req.body.order) || 0;
    if (req.body.status !== undefined) updates.status = req.body.status;

    if (req.body.socialLinks !== undefined) {
      updates.socialLinks = parseSocialLinks(req.body.socialLinks);
    } else if (req.body.linkedin || req.body.twitter || req.body.instagram || req.body.facebook) {
      updates.socialLinks = {
        linkedin: req.body.linkedin ?? existing.socialLinks?.linkedin ?? '',
        twitter: req.body.twitter ?? existing.socialLinks?.twitter ?? '',
        instagram: req.body.instagram ?? existing.socialLinks?.instagram ?? '',
        facebook: req.body.facebook ?? existing.socialLinks?.facebook ?? '',
      };
    }

    let newImageUrl = null;
    if (req.file) {
      newImageUrl = `/uploads/team/${req.file.filename}`;
    } else if (req.files && req.files.image && req.files.image[0]) {
      newImageUrl = `/uploads/team/${req.files.image[0].filename}`;
    } else if (req.files && Array.isArray(req.files) && req.files[0]) {
      newImageUrl = `/uploads/team/${req.files[0].filename}`;
    } else if (req.body.image !== undefined) {
      newImageUrl = req.body.image;
    }

    if (newImageUrl !== null) {
      if (existing.image && existing.image !== newImageUrl && existing.image.startsWith('/uploads/team/')) {
        await safeDeleteFile(existing.image);
      }
      updates.image = newImageUrl;
    }

    const updatedMember = await TeamMember.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      item: updatedMember,
      teamMember: updatedMember,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE team member
async function deleteTeamMember(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await TeamMember.findById(id);
    if (!existing) {
      throw createError('Team member not found', 404);
    }

    if (existing.image && existing.image.startsWith('/uploads/team/')) {
      await safeDeleteFile(existing.image);
    }

    await TeamMember.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Team member deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
