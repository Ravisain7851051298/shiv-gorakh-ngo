const assert = require('node:assert/strict');
const test = require('node:test');
const volunteerController = require('../controllers/volunteer.controller');
const volunteerRepository = require('../repository/volunteer.repository');
const volunteerService = require('../services/volunteer.services');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');

function createResponse() {
  return {
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

test('registration uses authenticated user id and promotes them to volunteer', async (t) => {
  const originalCreate = volunteerRepository.createForUser;
  const originalSetRole = volunteerRepository.setUserRole;
  const calls = [];
  volunteerRepository.createForUser = async (userId, profile) => {
    calls.push({ userId, profile });
    return { user: userId, ...profile };
  };
  volunteerRepository.setUserRole = async (userId, role) => {
    calls.push({ userId, role });
    return { id: userId, role };
  };
  t.after(() => {
    volunteerRepository.createForUser = originalCreate;
    volunteerRepository.setUserRole = originalSetRole;
  });

  const response = createResponse();
  let nextError;
  await volunteerController.registerVolunteer({
    user: { id: 'user-123' },
    body: {
      address: { state: 'CA', city: 'SF', pincode: '94103' },
      user: 'attacker-controlled-id',
      status: 'SUSPENDED',
    },
  }, response, (error) => { nextError = error; });

  assert.equal(nextError, undefined);
  assert.equal(response.statusCode, 201);
  assert.equal(calls[0].userId, 'user-123');
  assert.deepEqual(calls[0].profile, {
    address: { state: 'CA', city: 'SF', pincode: '94103' },
  });
  assert.deepEqual(calls[1], { userId: 'user-123', role: UserRole.VOLUNTEER });
});

test('profile updates and deletions are scoped to the authenticated user', async (t) => {
  const originals = {
    update: volunteerRepository.updateByUserId,
    remove: volunteerRepository.deleteByUserId,
    setRole: volunteerRepository.setUserRole,
  };
  const calls = [];
  volunteerRepository.updateByUserId = async (userId, profile) => {
    calls.push({ operation: 'update', userId, profile });
    return { user: userId, ...profile };
  };
  volunteerRepository.deleteByUserId = async (userId) => {
    calls.push({ operation: 'delete', userId });
    return { user: userId };
  };
  volunteerRepository.setUserRole = async (userId, role) => {
    calls.push({ operation: 'role', userId, role });
    return { id: userId, role };
  };
  t.after(() => {
    volunteerRepository.updateByUserId = originals.update;
    volunteerRepository.deleteByUserId = originals.remove;
    volunteerRepository.setUserRole = originals.setRole;
  });

  const updateResponse = createResponse();
  await volunteerController.updateVolunteer({
    user: { id: 'user-456' },
    body: { experience: 'Rescue experience', user: 'other-user' },
  }, updateResponse, (error) => { throw error; });
  assert.equal(updateResponse.statusCode, 200);
  assert.deepEqual(calls[0], {
    operation: 'update',
    userId: 'user-456',
    profile: { experience: 'Rescue experience' },
  });

  const deleteResponse = createResponse();
  await volunteerController.deleteVolunteer({
    user: { id: 'user-456' },
  }, deleteResponse, (error) => { throw error; });
  assert.equal(deleteResponse.statusCode, 200);
  assert.deepEqual(calls[1], { operation: 'delete', userId: 'user-456' });
  assert.deepEqual(calls[2], {
    operation: 'role',
    userId: 'user-456',
    role: UserRole.DONOR,
  });
});

test('volunteer role middleware allows only configured roles', () => {
  const middleware = authorizeRoles(UserRole.VOLUNTEER);
  let nextCalled = false;
  middleware({ user: { role: UserRole.VOLUNTEER } }, createResponse(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  const response = createResponse();
  middleware({ user: { role: UserRole.DONOR } }, response, () => {
    assert.fail('next should not be called for a donor');
  });
  assert.equal(response.statusCode, 403);
});

test('volunteer service rejects empty updates and protects non-profile fields', async () => {
  await assert.rejects(
    volunteerService.update('user-1', { status: 'SUSPENDED', user: 'user-2' }),
    { status: 400 },
  );
});
