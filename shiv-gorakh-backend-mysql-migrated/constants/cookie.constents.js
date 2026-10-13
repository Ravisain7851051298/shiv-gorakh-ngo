const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/v1',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports = refreshCookieOptions;