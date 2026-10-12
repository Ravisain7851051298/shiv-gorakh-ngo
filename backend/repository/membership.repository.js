const User = require('../models/user.model');
const Membership = require('../models/membership.model');

const membershipRepository = {
  createForUser: async (userId, profile) => {
    return Membership.create({ ...profile, user: userId });
  },

  findByUserId: async (userId) => {
    return Membership.findOne({ user: userId }).populate('user', 'name email phone role');
  },

  updateByUserId: async (userId, profile) => {
    return Membership.findOneAndUpdate(
      { user: userId },
      { $set: profile },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email phone role');
  },

  findAll: async (skip = 0, limit = 20, filter = {}) =>
    Membership.find(filter)
      .populate('user', 'name email phone role')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit),

  countAll: async (filter = {}) => Membership.countDocuments(filter),

  findById: async (id) =>
    Membership.findById(id).populate('user', 'name email phone role'),

  updateById: async (id, profile) =>
    Membership.findByIdAndUpdate(
      id,
      { $set: profile },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email phone role'),

  deleteById: async (id) => Membership.findByIdAndDelete(id),

  deleteByUserId: async (userId) => {
    return Membership.findOneAndDelete({ user: userId });
  },

  setUserRole: async (userId, role) => {
    return User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { returnDocument: 'after', runValidators: true }
    );
  },

  resetUserRole: async (userId, expectedRole) => {
    return User.findOneAndUpdate(
      { _id: userId, role: expectedRole },
      { $set: { role: 'donor' } },
      { returnDocument: 'after', runValidators: true }
    );
  },
};

module.exports = membershipRepository;