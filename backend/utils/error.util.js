const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_TTL = '1h';
const REFRESH_TOKEN_TTL = '7d';

function createError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function requireSecret(secret, name) {
    if (!secret) {
        throw new Error(`${name} is not configured`);
    }
    return secret;
}

function publicUser(user) {
    return {
        id: (user._id || user.id).toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profilePicture: user.profilePicture || '',
        avatar: user.profilePicture || '',
    };
}

function issueTokens(user) {
    const claims = { id: user.id, role: user.role };
    return {
        accessToken: jwt.sign(
            { ...claims, tokenType: 'access', jti: crypto.randomUUID() },
            requireSecret(process.env.JWT_SECRET, 'JWT_SECRET'),
            { expiresIn: ACCESS_TOKEN_TTL },
        ),
        refreshToken: jwt.sign(
            { ...claims, tokenType: 'refresh', jti: crypto.randomUUID() },
            requireSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
            { expiresIn: REFRESH_TOKEN_TTL },
        ),
    };
}

function verifiedRefreshToken(token) {
    if (typeof token !== 'string' || token.length === 0) {
        throw createError('Refresh token is required', 400);
    }

    const secret = requireSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
    try {
        const payload = jwt.verify(token, secret);
        if (payload.tokenType !== 'refresh' || !payload.id || !payload.exp) {
            throw createError('Invalid refresh token', 401);
        }
        return payload;
    } catch (error) {
        if (error.status) {
            throw error;
        }
        throw createError('Invalid or expired refresh token', 401);
    }
}

module.exports = {
    createError,
    requireSecret,
    publicUser,
    issueTokens,
    verifiedRefreshToken
};