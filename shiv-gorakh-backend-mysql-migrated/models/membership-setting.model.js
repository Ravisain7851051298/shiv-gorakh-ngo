const mongoose = require('../config/mysql-odm.js');

const membershipTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    periodMonths: {
      type: Number,
      default: 12,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const membershipSettingSchema = new mongoose.Schema(
  {
    membershipTypes: {
      type: [membershipTierSchema],
      default: [
        {
          name: 'Annual',
          price: 1200,
          periodMonths: 12,
          description: 'Official 1-year foundation membership with voting and convention delegate rights.',
          benefits: [
            'Voting rights in General Body Assembly',
            'Official Foundation ID Card & Certificate',
            'Quarterly Field Activity Reports',
            'Animal Welfare Advocacy representation',
          ],
          isActive: true,
        },
        {
          name: 'Lifetime',
          price: 5000,
          periodMonths: 120,
          description: 'Permanent lifetime foundation membership with permanent delegate honors.',
          benefits: [
            'Permanent Voting & Governance Rights',
            'Gold-Seal Lifetime Certificate & Member Plaque',
            'Honor Delegate status at foundation annual conventions',
            'Direct advisory participation in emergency rescue projects',
          ],
          isActive: true,
        },
        {
          name: 'Monthly',
          price: 200,
          periodMonths: 1,
          description: 'Monthly sustaining supporter membership for animal rescue enthusiasts.',
          benefits: [
            'Digital Membership Certificate',
            'Community rescue volunteer priority updates',
            'Monthly animal care impact briefs',
          ],
          isActive: true,
        },
      ],
    },
    instructions: {
      type: String,
      trim: true,
      default:
        'Please complete your membership fee payment via the verified UPI QR code or direct bank transfer below, then submit your transaction reference and screenshot for instant administrative verification.',
    },
    certificatePrefix: {
      type: String,
      trim: true,
      default: 'SG-MEM-',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MembershipSetting = mongoose.model('MembershipSetting', membershipSettingSchema);

module.exports = MembershipSetting;
