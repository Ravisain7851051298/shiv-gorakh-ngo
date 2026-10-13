const authService = require('../services/auth.services');

async function optionalAuthMiddleware(req, res, next) {
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
    return next();
  }

  try {
    const { user, payload } = await authService.authenticateAccessToken(token);
    req.user = user;
    req.authToken = token;
    req.authTokenExpiresAt = payload.exp;
    return next();
  } catch (error) {
    // Optional auth token was expired or invalid; proceed as guest
    return next();
  }
}

module.exports = optionalAuthMiddleware;
