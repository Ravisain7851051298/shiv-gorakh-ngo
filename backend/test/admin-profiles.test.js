const assert = require('node:assert/strict');
const test = require('node:test');
const adminService = require('../services/admin.service');
const volunteerRepository = require('../repository/volunteer.repository');
const membershipRepository = require('../repository/membership.repository');

test('admin profile updates allow editable fields only', async (t) => {
  const originalUpdate = volunteerRepository.updateById;
  const originalFindById = volunteerRepository.findById;
  const originalMemberFindById = membershipRepository.findById;
  let updateCall;
  volunteerRepository.findById = async (id) => ({ _id: id, status: 'ACTIVE' });
  volunteerRepository.updateById = async (id, updates) => {
    updateCall = { id, updates };
    return { _id: id, ...updates };
  };
  membershipRepository.findById = async (id) => ({ _id: id, status: 'Active' });
  t.after(() => {
    volunteerRepository.updateById = originalUpdate;
    volunteerRepository.findById = originalFindById;
    membershipRepository.findById = originalMemberFindById;
  });

  const id = '507f1f77bcf86cd799439011';
  const profile = await adminService.updateProfile('volunteer', id, {
    status: 'SUSPENDED',
    user: 'unauthorized-user-change',
    role: 'admin',
  });

  assert.deepEqual(updateCall, { id, updates: { status: 'SUSPENDED' } });
  assert.equal(profile.status, 'SUSPENDED');
  await assert.rejects(
    adminService.updateProfile('membership', id, { user: 'unauthorized-user-change' }),
    { status: 400 },
  );
});

test('admin profile deletion resets the associated user role for that profile type', async (t) => {
  const originalFindById = membershipRepository.findById;
  const originalDelete = membershipRepository.deleteById;
  const originalResetRole = membershipRepository.resetUserRole;
  const calls = [];
  membershipRepository.findById = async (id) => ({ _id: id, user: 'user-id' });
  membershipRepository.deleteById = async (id) => {
    calls.push({ operation: 'delete', id });
    return { user: 'user-id' };
  };
  membershipRepository.resetUserRole = async (userId, expectedRole) => {
    calls.push({ operation: 'reset-role', userId, expectedRole });
  };
  t.after(() => {
    membershipRepository.findById = originalFindById;
    membershipRepository.deleteById = originalDelete;
    membershipRepository.resetUserRole = originalResetRole;
  });

  await adminService.deleteProfile('membership', '507f1f77bcf86cd799439011');
  assert.deepEqual(calls, [
    { operation: 'delete', id: '507f1f77bcf86cd799439011' },
    { operation: 'reset-role', userId: 'user-id', expectedRole: 'member' },
  ]);
});

