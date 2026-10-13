const authService = require('../services/auth.services');
const refreshCookieOptions = require('../constants/cookie.constents');
const { UserRole } = require('../constants/app.constants');
const { sendTokenResponse, handleAuthError } = require('../utils/auth-response.util');

async function registerUser(req, res, next) {
  try {
    const result = await authService.register(req.body);
    sendTokenResponse(res, 201, 'User registered successfully', result);
  } catch (error) {
    handleAuthError(error, next);
  }
}

async function login(req, res, next, requiredRole) {
  try {
    const result = await authService.login(req.body, requiredRole);
    sendTokenResponse(res, 200, 'Login successful', result);
  } catch (error) {
    handleAuthError(error, next);
  }
}

function loginUser(req, res, next) {
  return login(req, res, next);
}

function loginAdmin(req, res, next) {
  return login(req, res, next, UserRole.ADMIN);
}

async function refresh(req, res, next, requiredRole) {
  const token =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers['x-refresh-token'];

  if (!token) {
    res.clearCookie('refreshToken', refreshCookieOptions);
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required',
    });
  }
  try {
    const result = await authService.refresh({
      refreshToken: token,
    }, requiredRole);
    sendTokenResponse(res, 200, 'Tokens refreshed successfully', result);
  } catch (error) {
    if (error.status === 400 || error.status === 401) {
      res.clearCookie('refreshToken', refreshCookieOptions);
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or expired',
      });
    }
    handleAuthError(error, next);
  }
}

function refreshToken(req, res, next) {
  return refresh(req, res, next);
}

function refreshAdminToken(req, res, next) {
  return refresh(req, res, next, UserRole.ADMIN);
}

async function logoutUser(req, res, next) {
  try {
    await authService.logout(
      req.authToken,
      req.authTokenExpiresAt,
      req.cookies?.refreshToken,
      req.user.id,
    );
    res.clearCookie('refreshToken', refreshCookieOptions);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    handleAuthError(error, next);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    handleAuthError(error, next);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body, req.file);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    handleAuthError(error, next);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const origin = req.get('origin') || req.get('referer');
    const result = await authService.forgotPassword(req.body?.email, origin);
    res.status(200).json({
      success: true,
      message: result.message,
      devResetUrl: result.resetUrl,
    });
  } catch (error) {
    handleAuthError(error, next);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(
      req.body?.token,
      req.body?.password,
      req.body?.confirmPassword,
    );
    res.status(200).json(result);
  } catch (error) {
    handleAuthError(error, next);
  }
}

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  logoutUser,
  refreshToken,
  refreshAdminToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
