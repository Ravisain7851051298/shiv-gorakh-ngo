const assert = require('node:assert/strict');
const test = require('node:test');
const volunteerService = require('../services/volunteer.services');
const membershipService = require('../services/membership.services');
const Volunteer = require('../models/volunteer.model');
const Membership = require('../models/membership.model');
const volunteerRepository = require('../repository/volunteer.repository');
const membershipRepository = require('../repository/membership.repository');

test('admin can approve volunteer, issuing volunteerId and offer letter without immediately sending certificate', async (t) => {
  const mockVolunteer = {
    _id: '60d5ec49f1b2c82b8c8c1111',
    user: { _id: '60d5ec49f1b2c82b8c8c2222', name: 'Ravi Kumar', email: 'ravi@example.com', role: 'donor' },
    status: 'PENDING',
    save: async function () { return this; },
  };

  const origFindById = Volunteer.findById;
  const origSetUserRole = volunteerRepository.setUserRole;

  Volunteer.findById = () => ({
    populate: async () => mockVolunteer,
  });

  let roleUpdated = null;
  volunteerRepository.setUserRole = async (userId, role) => {
    roleUpdated = { userId, role };
    return { _id: userId, role };
  };

  t.after(() => {
    Volunteer.findById = origFindById;
    volunteerRepository.setUserRole = origSetUserRole;
  });

  const result = await volunteerService.approveVolunteer('60d5ec49f1b2c82b8c8c1111', 'admin-user-id');

  assert.equal(result.volunteer.status, 'ACTIVE');
  assert.ok(result.volunteer.volunteerId.startsWith('SG-VOL-'));
  assert.ok(result.volunteer.approvedAt instanceof Date);
  assert.equal(result.volunteer.certificateSentAt, undefined); // Certificate is NOT sent immediately
  assert.deepEqual(roleUpdated, { userId: '60d5ec49f1b2c82b8c8c2222', role: 'volunteer' });
});

test('admin can issue certificate and appointment letter for volunteer and member on-demand', async (t) => {
  const EmailSetting = require('../models/email-setting.model');
  const NgoSetting = require('../models/ngo-setting.model');
  const origMemberFind = Membership.findById;
  const origVolFind = Volunteer.findById;
  const origEmailFind = EmailSetting.findOne;
  const origNgoFind = NgoSetting.findOne;

  EmailSetting.findOne = async () => null;
  NgoSetting.findOne = () => ({ lean: async () => null });

  const mockMember = {
    _id: '60d5ec49f1b2c82b8c8c3333',
    user: { _id: '60d5ec49f1b2c82b8c8c4444', name: 'Anita Sharma', email: 'anita@example.com' },
    status: 'Active',
    membershipType: 'Gold',
    memberId: 'SG-MEM-2026-TEST1',
    certificateNumber: 'SG-MEM-CERT-TEST1',
    save: async function () { return this; },
  };

  const mockVol = {
    _id: '60d5ec49f1b2c82b8c8c5555',
    user: { _id: '60d5ec49f1b2c82b8c8c6666', name: 'Vikas Singh', email: 'vikas@example.com' },
    status: 'ACTIVE',
    volunteerId: 'SG-VOL-2026-TEST2',
    certificateNumber: 'SG-VOL-CERT-TEST2',
    save: async function () { return this; },
  };

  Membership.findById = () => ({ populate: async () => mockMember });
  Volunteer.findById = () => ({ populate: async () => mockVol });

  t.after(() => {
    Membership.findById = origMemberFind;
    Volunteer.findById = origVolFind;
    EmailSetting.findOne = origEmailFind;
    NgoSetting.findOne = origNgoFind;
  });

  // Issue Member Appointment Letter
  const memberApptRes = await membershipService.sendAppointmentLetter('60d5ec49f1b2c82b8c8c3333');
  assert.ok(memberApptRes !== undefined);

  // Issue Volunteer Offer Letter
  const volOfferRes = await volunteerService.sendOfferLetter('60d5ec49f1b2c82b8c8c5555');
  assert.ok(volOfferRes !== undefined);

  // Issue Volunteer Certificate
  const volCertRes = await volunteerService.sendCertificate('60d5ec49f1b2c82b8c8c5555');
  assert.ok(volCertRes !== undefined);
});
