const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth.controller');
const adminController = require('../controllers/admin.controller');
const authService = require('../services/auth.services');
const authRepository = require('../repository/auth.repository');
const { UserRole } = require('../constants/app.constants');

function createResponse() {
  return {
    cookie(name, value, options) {
      this.cookieData = { name, value, options };
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function registrationRequest(adminSecretKey) {
  return {
    body: {
      name: 'Example User',
      email: 'example@example.com',
      phone: '1234567890',
      password: 'password123',
      confirmPassword: 'password123',
    },
    get(headerName) {
      return headerName === 'x-admin-secret-key' ? adminSecretKey : undefined;
    },
  };
}

test('admin registration requires the header key and matches donor response shape', async (t) => {
  const previousCreateUser = authRepository.createUser;
  const previousSecret = process.env.ADMIN_SECRET_KEY;
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousRefreshSecret = process.env.JWT_REFRESH_SECRET;
  const previousFindUserByEmail = authRepository.findUserByEmail;
  const previousFindUserById = authRepository.findUserById;
  const previousIsTokenBlacklisted = authRepository.isTokenBlacklisted;
  const rolesCreated = [];

  process.env.ADMIN_SECRET_KEY = 'expected-admin-key';
  process.env.JWT_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  authRepository.createUser = async (name, email, phone, password, role) => {
    rolesCreated.push(role);
    return {
      _id: { toString: () => 'user-id' },
      id: 'user-id',
      name,
      email,
      phone,
      role,
    };
  };

  t.after(() => {
    authRepository.createUser = previousCreateUser;
    authRepository.findUserByEmail = previousFindUserByEmail;
    authRepository.findUserById = previousFindUserById;
    authRepository.isTokenBlacklisted = previousIsTokenBlacklisted;
    if (previousSecret === undefined) delete process.env.ADMIN_SECRET_KEY;
    else process.env.ADMIN_SECRET_KEY = previousSecret;
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
    if (previousRefreshSecret === undefined) delete process.env.JWT_REFRESH_SECRET;
    else process.env.JWT_REFRESH_SECRET = previousRefreshSecret;
  });

  const adminResponse = createResponse();
  let adminError;
  await adminController.registerAdmin(
    registrationRequest('expected-admin-key'),
    adminResponse,
    (error) => { adminError = error; },
  );

  assert.equal(adminError, undefined);
  assert.equal(adminResponse.statusCode, 201);
  assert.equal(rolesCreated[0], UserRole.ADMIN);
  assert.equal(adminResponse.body.message, 'User registered successfully');
  assert.equal(
    jwt.verify(adminResponse.body.accessToken, process.env.JWT_SECRET).role,
    UserRole.ADMIN,
  );
  assert.equal(adminResponse.cookieData.name, 'refreshToken');
  assert.equal(adminResponse.cookieData.options.path, '/api/v1');

  const donorResponse = createResponse();
  let donorError;
  await authController.registerUser(
    registrationRequest(undefined),
    donorResponse,
    (error) => { donorError = error; },
  );

  assert.equal(donorError, undefined);
  assert.equal(rolesCreated[1], UserRole.DONOR);
  assert.deepEqual(
    Object.keys(adminResponse.body).sort(),
    Object.keys(donorResponse.body).sort(),
  );
  assert.deepEqual(
    Object.keys(adminResponse.body.user).sort(),
    Object.keys(donorResponse.body.user).sort(),
  );

  const createCount = rolesCreated.length;
  let rejectedError;
  await adminController.registerAdmin(
    registrationRequest('incorrect-key'),
    createResponse(),
    (error) => { rejectedError = error; },
  );
  assert.equal(rejectedError.status, 403);
  assert.equal(rolesCreated.length, createCount);

  authRepository.findUserByEmail = async () => ({
    role: UserRole.DONOR,
    comparePassword: async () => true,
  });
  await assert.rejects(
    authService.login({ email: 'example@example.com', password: 'password123' }, UserRole.ADMIN),
    { status: 401 },
  );

  authRepository.isTokenBlacklisted = async () => false;
  authRepository.findUserById = async () => ({ role: UserRole.DONOR });
  const donorRefreshToken = jwt.sign(
    { id: 'user-id', tokenType: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '1h' },
  );
  await assert.rejects(
    authService.refresh({ refreshToken: donorRefreshToken }, UserRole.ADMIN),
    { status: 401 },
  );
});
