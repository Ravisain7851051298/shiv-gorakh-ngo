const isProduction = process.env.NODE_ENV === 'production';

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/api/v1',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

if (process.env.COOKIE_DOMAIN) {
  refreshCookieOptions.domain = process.env.COOKIE_DOMAIN;
} else if (isProduction) {
  refreshCookieOptions.domain = '.shivgorakh.org.in';
}

module.exports = refreshCookieOptions;