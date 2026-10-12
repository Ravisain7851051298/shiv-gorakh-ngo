const mongoose = require('mongoose');

const donationSettingSchema = new mongoose.Schema(
  {
    upiId: {
      type: String,
      trim: true,
      default: '',
    },
    qrCode: {
      type: String,
      trim: true,
      default: '',
    },
    accountHolderName: {
      type: String,
      trim: true,
      default: '',
    },
    accountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    bankName: {
      type: String,
      trim: true,
      default: '',
    },
    ifscCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    branchName: {
      type: String,
      trim: true,
      default: '',
    },
    accountType: {
      type: String,
      trim: true,
      default: 'Savings',
    },
    instructions: {
      type: String,
      trim: true,
      default: 'Please share your transaction reference or screenshot after completing the payment.',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const DonationSetting = mongoose.model('DonationSetting', donationSettingSchema);

module.exports = DonationSetting;
