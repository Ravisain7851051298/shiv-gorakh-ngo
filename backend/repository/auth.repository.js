const crypto = require('crypto');
const User = require('../models/user.model');
const TokenBlacklist = require('../models/token-blacklist.model');
const { UserRole } = require('../constants/app.constants');

const authRepository = {
  createUser: async (name, email, phone, password, role = UserRole.DONOR) => {
    const userData = { name, email, role, password };
    if (typeof phone === 'string' && phone.trim()) {
      userData.phone = phone.trim();
    }
    return await User.create(userData);
  },

  findUserByEmail: async (email, includePassword = false) => {
    const query = User.findOne({ email: email.trim().toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return await query;
  },

  findUserById: async (id) => {
    return await User.findById(id);
  },

  findUserByPhone: async (phone, excludeUserId = null) => {
    if (!phone) return null;
    const query = { phone: phone.trim() };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    return await User.findOne(query);
  },

  findUserByEmailExcluding: async (email, excludeUserId) => {
    return await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: excludeUserId },
    });
  },

  findUserByResetToken: async (tokenHash) => {
    return await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');
  },

  isTokenBlacklisted: async (token) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return Boolean(await TokenBlacklist.exists({
      tokenHash,
    }));
  },
  
  blacklistToken: async (token, tokenType, expiresAt) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = expiresAt ? new Date(expiresAt * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const resolvedExpiry = expiry && !Number.isNaN(expiry.getTime()) ? expiry : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    await TokenBlacklist.updateOne(
      { tokenHash },
      {
        $setOnInsert: {
          tokenHash,
          tokenType,
          expiresAt: resolvedExpiry,
          createdAt: now,
        },
      },
      { upsert: true },
    );
  }
};

module.exports = authRepository;
