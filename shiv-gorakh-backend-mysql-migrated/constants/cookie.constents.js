const isProduction = process.env.NODE_ENV === 'production';

function getRefreshCookieOptions(req) {
  const origin = req && typeof req.get === 'function' ? (req.get('origin') || req.get('referer') || '') : '';
  const isHttps = req && typeof req.secure !== 'undefined' ? req.secure : isProduction;

  const options = {
    httpOnly: true,
    secure: isHttps || isProduction,
    sameSite: (isHttps || isProduction) ? 'none' : 'lax',
    path: '/api/v1',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  } else if (isProduction && (origin.includes('shivgorakh.org.in') || !origin)) {
    options.domain = '.shivgorakh.org.in';
  }

  return options;
}

const refreshCookieOptions = getRefreshCookieOptions();

module.exports = refreshCookieOptions;
module.exports.refreshCookieOptions = refreshCookieOptions;
module.exports.getRefreshCookieOptions = getRefreshCookieOptions;