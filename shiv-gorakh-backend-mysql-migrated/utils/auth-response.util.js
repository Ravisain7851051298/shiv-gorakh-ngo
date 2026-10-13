const cookieConstants = require('../constants/cookie.constents');
const refreshCookieOptions = cookieConstants.refreshCookieOptions || cookieConstants;
const getRefreshCookieOptions = cookieConstants.getRefreshCookieOptions || (() => refreshCookieOptions);

function sendTokenResponse(res, status, message, result, passedReq) {
  const { refreshToken, ...response } = result || {};
  const req = passedReq || res?.req;
  const cookieOpts = req ? getRefreshCookieOptions(req) : refreshCookieOptions;
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, cookieOpts);
  }
  return res.status(status).json({
    success: true,
    message,
    refreshToken,
    ...response,
  });
}

function handleAuthError(error, next) {
  if (error.code === 11000) {
    error.status = 409;
    const duplicateField = Object.keys(error.keyPattern || {})[0];
    error.message = duplicateField === 'email'
      ? 'An account with this email already exists'
      : duplicateField === 'phone'
        ? 'An account with this phone already exists'
        : 'An account with that email or phone already exists';
  } else if (error.name === 'ValidationError') {
    error.status = 400;
  }
  next(error);
}

module.exports = { sendTokenResponse, handleAuthError };
