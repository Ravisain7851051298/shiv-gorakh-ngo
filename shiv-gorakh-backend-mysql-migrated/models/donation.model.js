const mongoose = require('../config/mysql-odm.js');

const donationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    donorPhone: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1'],
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Other'],
      default: 'UPI',
    },
    transactionId: {
      type: String,
      trim: true,
      default: '',
    },
    screenshot: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
      index: true,
    },
    campaignTitle: {
      type: String,
      trim: true,
      default: '',
    },
    campaignFunded: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    receiptNumber: {
      type: String,
      trim: true,
      default: '',
    },
    receiptSent: {
      type: Boolean,
      default: false,
    },
    receiptSentAt: {
      type: Date,
      default: null,
    },
    receiptError: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

donationSchema.index({ createdAt: -1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;