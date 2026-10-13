const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { UserRole } = require('../constants/app.constants');
const { createError, publicUser, issueTokens, verifiedRefreshToken, requireSecret } = require('../utils/error.util');
const authRepository = require('../repository/auth.repository');
const emailService = require('./email.services');
const { removeFileFromDisk } = require('../middlewares/image-upload.middleware');

function verifyAdminSecret(candidate) {
  const configuredSecret = process.env.ADMIN_SECRET_KEY;
  if (!configuredSecret) {
    throw createError('Admin registration is not configured', 500);
  }
  if (typeof candidate !== 'string') {
    throw createError('Invalid or missing admin secret key', 403);
  }

  const provided = Buffer.from(candidate);
  const expected = Buffer.from(configuredSecret);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw createError('Invalid or missing admin secret key', 403);
  }
}

async function register(userData = {}, role = UserRole.DONOR, adminSecretKey) {
  if (role === UserRole.ADMIN) {
    verifyAdminSecret(adminSecretKey);
  }

  const { name, email, phone, password, confirmPassword } = userData || {};
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password
  ) {
    throw createError('Name, email, and password are required', 400);
  }
  if (phone !== undefined && phone !== null && typeof phone !== 'string') {
    throw createError('Phone must be a string', 400);
  }
  if (password !== confirmPassword) {
    throw createError('Passwords do not match', 400);
  }

  const user = await authRepository.createUser(name, email, phone, password, role);
  return { user: publicUser(user), ...issueTokens(user) };
}

async function login({ email, password } = {}, requiredRole) {
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    throw createError('Email and password are required', 400);
  }

  const user = await authRepository.findUserByEmail(email, true);
  if (!user || !(await user.comparePassword(password))) {
    throw createError('Invalid email or password', 401);
  }
  if (requiredRole && user.role !== requiredRole) {
    throw createError('Invalid email or password', 401);
  }

  return { user: publicUser(user), ...issueTokens(user) };
}

async function refresh({ refreshToken } = {}, requiredRole) {
  const payload = verifiedRefreshToken(refreshToken);
  if (await authRepository.isTokenBlacklisted(refreshToken)) {
    throw createError('Refresh token has been revoked', 401);
  }

  const user = await authRepository.findUserById(payload.id);
  if (!user) {
    throw createError('User not found', 401);
  }
  if (requiredRole && user.role !== requiredRole) {
    throw createError('Invalid or expired refresh token', 401);
  }

  const tokens = issueTokens(user);
  await authRepository.blacklistToken(refreshToken, 'refresh', payload.exp);
  return { user: publicUser(user), ...tokens };
}

async function logout(accessToken, accessTokenExpiresAt, refreshToken, userId) {
  const payload = verifiedRefreshToken(refreshToken);
  if (payload.id !== userId) {
    throw createError('Refresh token does not belong to the authenticated user', 401);
  }
  if (await authRepository.isTokenBlacklisted(refreshToken)) {
    throw createError('Refresh token has already been revoked', 401);
  }

  await authRepository.blacklistToken(accessToken, 'access', accessTokenExpiresAt);
  await authRepository.blacklistToken(refreshToken, 'refresh', payload.exp);
}

async function authenticateAccessToken(token) {
  let payload;
  const secret = requireSecret(process.env.JWT_SECRET, 'JWT_SECRET');
  try {
    payload = jwt.verify(token, secret);
  } catch {
    throw createError('Invalid or expired access token', 401);
  }

  if (payload.tokenType !== 'access' || !payload.id || !payload.exp) {
    throw createError('Invalid access token', 401);
  }
  if (await authRepository.isTokenBlacklisted(token)) {
    throw createError('Access token has been revoked', 401);
  }

  const user = await authRepository.findUserById(payload.id);
  if (!user) {
    throw createError('User not found', 401);
  }
  return { user, payload };
}

async function getProfile(userId) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }
  return publicUser(user);
}

async function updateProfile(userId, data = {}, file) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const { name, email, phone, removeProfilePicture } = data;

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      throw createError('Name cannot be empty', 400);
    }
    user.name = name.trim();
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !email.trim()) {
      throw createError('Email cannot be empty', 400);
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw createError('Please provide a valid email address', 400);
    }
    if (cleanEmail !== user.email) {
      const existing = await authRepository.findUserByEmailExcluding(cleanEmail, userId);
      if (existing) {
        throw createError('An account with this email address already exists', 409);
      }
      user.email = cleanEmail;
    }
  }

  if (phone !== undefined) {
    if (typeof phone === 'string' && phone.trim()) {
      const cleanPhone = phone.trim();
      if (cleanPhone !== user.phone) {
        const existing = await authRepository.findUserByPhone(cleanPhone, userId);
        if (existing) {
          throw createError('An account with this phone number already exists', 409);
        }
        user.phone = cleanPhone;
      }
    } else {
      user.phone = undefined;
    }
  }

  if (file) {
    if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
      await removeFileFromDisk(user.profilePicture);
    }
    user.profilePicture = `/uploads/avatars/${file.filename}`;
  } else if (removeProfilePicture === 'true' || removeProfilePicture === true) {
    if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
      await removeFileFromDisk(user.profilePicture);
    }
    user.profilePicture = '';
  }

  await user.save();
  return publicUser(user);
}

async function forgotPassword(email, clientOrigin) {
  if (typeof email !== 'string' || !email.trim()) {
    throw createError('Email address is required', 400);
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = await authRepository.findUserByEmail(cleanEmail);

  if (!user) {
    return {
      sent: true,
      message: 'If an account exists with this email address, a password reset link has been sent.',
    };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  let baseUrl;
  if (clientOrigin) {
    try {
      baseUrl = new URL(clientOrigin).origin;
    } catch {
      baseUrl = clientOrigin.replace(/\/+$/, '');
    }
  } else if (user.role === UserRole.ADMIN) {
    baseUrl = (process.env.DASHBOARD_URL || 'http://localhost:3001').replace(/\/+$/, '');
  } else {
    baseUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '');
  }
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  const mailResult = await emailService.sendPasswordResetEmail(user, resetUrl);

  return {
    sent: mailResult.sent,
    message: mailResult.sent
      ? 'Password reset link has been sent to your email address.'
      : 'Password reset link generated. Check your email or link.',
    resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
  };
}

async function resetPassword(token, password, confirmPassword) {
  if (typeof token !== 'string' || !token.trim()) {
    throw createError('Password reset token is required', 400);
  }
  if (typeof password !== 'string' || !password) {
    throw createError('New password is required', 400);
  }
  if (password.length < 6) {
    throw createError('Password must be at least 6 characters long', 400);
  }
  if (password !== confirmPassword) {
    throw createError('Passwords do not match', 400);
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const user = await authRepository.findUserByResetToken(tokenHash);

  if (!user) {
    throw createError('Password reset link is invalid or has expired. Please request a new one.', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return {
    success: true,
    message: 'Your password has been reset successfully. You can now sign in with your new password.',
  };
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  authenticateAccessToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};