const assert = require('node:assert/strict');
const test = require('node:test');
const crypto = require('crypto');
const authService = require('../services/auth.services');
const authRepository = require('../repository/auth.repository');
const emailService = require('../services/email.services');

test('profile editing updates email, phone, name and handles profile picture', async () => {
  const fakeUser = {
    _id: 'user123',
    id: 'user123',
    name: 'Old Name',
    email: 'old@example.com',
    phone: '1111111111',
    role: 'donor',
    profilePicture: '',
    async save() {
      return this;
    },
  };

  const previousFindById = authRepository.findUserById;
  const previousFindByEmail = authRepository.findUserByEmailExcluding;
  const previousFindByPhone = authRepository.findUserByPhone;

  authRepository.findUserById = async (id) => (id === 'user123' ? fakeUser : null);
  authRepository.findUserByEmailExcluding = async (email, id) => null;
  authRepository.findUserByPhone = async (phone, id) => null;

  try {
    const updated = await authService.updateProfile('user123', {
      name: 'New Name',
      email: 'new@example.com',
      phone: '9999999999',
    }, { filename: 'pic-123.jpg' });

    assert.equal(updated.name, 'New Name');
    assert.equal(updated.email, 'new@example.com');
    assert.equal(updated.phone, '9999999999');
    assert.equal(updated.profilePicture, '/uploads/avatars/pic-123.jpg');

    // Remove profile picture
    const removedPic = await authService.updateProfile('user123', {
      removeProfilePicture: true,
    });
    assert.equal(removedPic.profilePicture, '');
  } finally {
    authRepository.findUserById = previousFindById;
    authRepository.findUserByEmailExcluding = previousFindByEmail;
    authRepository.findUserByPhone = previousFindByPhone;
  }
});

test('profile editing rejects duplicate email', async () => {
  const fakeUser = {
    _id: 'user123',
    id: 'user123',
    email: 'current@example.com',
    async save() { return this; },
  };

  const previousFindById = authRepository.findUserById;
  const previousFindByEmail = authRepository.findUserByEmailExcluding;

  authRepository.findUserById = async (id) => fakeUser;
  authRepository.findUserByEmailExcluding = async (email, id) => ({ _id: 'otherUser' });

  try {
    await assert.rejects(
      authService.updateProfile('user123', { email: 'taken@example.com' }),
      (err) => {
        assert.equal(err.status, 409);
        assert.match(err.message, /already exists/i);
        return true;
      }
    );
  } finally {
    authRepository.findUserById = previousFindById;
    authRepository.findUserByEmailExcluding = previousFindByEmail;
  }
});

test('forgotPassword generates token and sends email', async () => {
  let savedToken = null;
  let savedExpiry = null;
  const fakeUser = {
    _id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    async save() {
      savedToken = this.resetPasswordToken;
      savedExpiry = this.resetPasswordExpires;
      return this;
    },
  };

  const previousFindByEmail = authRepository.findUserByEmail;
  const previousSendEmail = emailService.sendPasswordResetEmail;

  let resetUrlPassed = null;
  authRepository.findUserByEmail = async (email) => (email === 'test@example.com' ? fakeUser : null);
  emailService.sendPasswordResetEmail = async (user, resetUrl) => {
    resetUrlPassed = resetUrl;
    return { sent: true };
  };

  try {
    const result = await authService.forgotPassword('test@example.com', 'http://localhost:3000');
    assert.equal(result.sent, true);
    assert.ok(savedToken);
    assert.ok(savedExpiry);
    assert.ok(resetUrlPassed.includes('/reset-password?token='));
  } finally {
    authRepository.findUserByEmail = previousFindByEmail;
    emailService.sendPasswordResetEmail = previousSendEmail;
  }
});

test('resetPassword verifies token and updates password', async () => {
  const rawToken = 'sampletoken123';
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  let updatedPassword = null;
  const fakeUser = {
    _id: 'user123',
    resetPasswordToken: tokenHash,
    resetPasswordExpires: new Date(Date.now() + 60000),
    async save() {
      updatedPassword = this.password;
      return this;
    },
  };

  const previousFindByToken = authRepository.findUserByResetToken;
  authRepository.findUserByResetToken = async (hash) => (hash === tokenHash ? fakeUser : null);

  try {
    // Fails on mismatch
    await assert.rejects(
      authService.resetPassword(rawToken, 'newpass123', 'different'),
      (err) => err.status === 400
    );

    // Fails on short password
    await assert.rejects(
      authService.resetPassword(rawToken, '123', '123'),
      (err) => err.status === 400
    );

    // Fails on invalid token
    await assert.rejects(
      authService.resetPassword('wrongtoken', 'newpass123', 'newpass123'),
      (err) => err.status === 400
    );

    // Succeeds with valid token
    const result = await authService.resetPassword(rawToken, 'newpass123', 'newpass123');
    assert.equal(result.success, true);
    assert.equal(updatedPassword, 'newpass123');
    assert.equal(fakeUser.resetPasswordToken, undefined);
  } finally {
    authRepository.findUserByResetToken = previousFindByToken;
  }
});
