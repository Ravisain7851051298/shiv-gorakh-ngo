const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    membershipType: {
      type: String,
      default: 'Annual',
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: 'UPI',
      trim: true,
    },
    transactionId: {
      type: String,
      default: '',
      trim: true,
    },
    paymentScreenshot: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    certificateNumber: {
      type: String,
      default: '',
      trim: true,
    },
    certificateSentAt: {
      type: Date,
    },
    memberId: {
      type: String,
      default: '',
      trim: true,
    },
    appointmentLetterSentAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Membership = mongoose.model('Membership', membershipSchema);
module.exports = Membership;