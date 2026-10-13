const User = require('../models/user.model');
const Volunteer = require('../models/volunteer.model');

const volunteerRepository = {
  createForUser: async (userId, profile) => {
    return Volunteer.create({
      status: 'PENDING',
      ...profile,
      user: userId,
    });
  },

  findByUserId: async (userId) => {
    return Volunteer.findOne({ user: userId });
  },

  updateByUserId: async (userId, profile) => {
    return Volunteer.findOneAndUpdate(
      { user: userId },
      { $set: profile },
      { returnDocument: 'after', runValidators: true },
    );
  },

  findAll: async (skip, limit, filter = {}) => {
    return Volunteer.find(filter).populate('user', 'name email phone role profilePicture')
      .sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit);
  },

  countAll: async (filter = {}) => Volunteer.countDocuments(filter),

  findById: async (id) => Volunteer.findById(id).populate('user', 'name email phone role'),

  updateById: async (id, profile) => Volunteer.findByIdAndUpdate(
    id,
    { $set: profile },
    { returnDocument: 'after', runValidators: true },
  ).populate('user', 'name email phone role'),

  deleteById: async (id) => Volunteer.findByIdAndDelete(id),

  deleteByUserId: async (userId) => {
    return Volunteer.findOneAndDelete({ user: userId });
  },

  setUserRole: async (userId, role) => {
    return User.findByIdAndUpdate(userId, { $set: { role } }, { returnDocument: 'after', runValidators: true });
  },

  resetUserRole: async (userId, expectedRole) => {
    return User.findOneAndUpdate(
      { _id: userId, role: expectedRole },
      { $set: { role: 'donor' } },
      { returnDocument: 'after', runValidators: true },
    );
  },
};

module.exports = volunteerRepository;