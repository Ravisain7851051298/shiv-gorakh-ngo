const authService = require('../services/auth.services');
async function authMiddleware(req, res, next) {
  let token = null;
  const authorization = req.get('authorization');
  if (authorization) {
    const parts = authorization.trim().split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }
  if (!token && req.query && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'A Bearer access token is required',
    });
  }

  try {
    const { user, payload } = await authService.authenticateAccessToken(token);
    req.user = user;
    req.authToken = token;
    req.authTokenExpiresAt = payload.exp;
    next();
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
}

module.exports = authMiddleware;