const mongoose = require('../config/mysql-odm.js');

const emailSettingSchema = new mongoose.Schema(
  {
    host: {
      type: String,
      trim: true,
      default: 'smtp.gmail.com',
    },
    port: {
      type: Number,
      default: 465,
    },
    secure: {
      type: Boolean,
      default: true,
    },
    user: {
      type: String,
      trim: true,
      default: '',
    },
    pass: {
      type: String,
      trim: true,
      default: '',
    },
    senderName: {
      type: String,
      trim: true,
      default: 'Shiv Gorakh Welfare Foundation',
    },
    senderEmail: {
      type: String,
      trim: true,
      default: '',
    },
    replyTo: {
      type: String,
      trim: true,
      default: 'info@shivgorakh.org.in',
    },
    receiptPrefix: {
      type: String,
      trim: true,
      default: 'SG-REC-',
    },
    emailSubject: {
      type: String,
      trim: true,
      default: 'Donation Receipt & Thank You — Shiv Gorakh Welfare Foundation',
    },
    emailBodyTemplate: {
      type: String,
      trim: true,
      default:
        'Dear {donorName},\n\nThank you for your generous contribution of ₹{amount} towards Shiv Gorakh Welfare Foundation. Your support directly powers our animal rescue, medical treatments, and feeding programs.\n\nPlease find your official verified donation receipt attached to this email.\n\nWith gratitude,\nShiv Gorakh Welfare Foundation Team\ninfo@shivgorakh.org.in | +91 93369 50578',
    },
    isConfigured: {
      type: Boolean,
      default: false,
    },
    authorizedSignature: {
      type: String,
      trim: true,
      default: '',
    },
    signatoryName: {
      type: String,
      trim: true,
      default: 'Hari Om',
    },
    signatoryRole: {
      type: String,
      trim: true,
      default: 'Authorized Signatory',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const EmailSetting = mongoose.model('EmailSetting', emailSettingSchema);

module.exports = EmailSetting;
