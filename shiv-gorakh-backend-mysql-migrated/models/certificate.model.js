const mongoose = require('../config/mysql-odm.js');

const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  recipientName: {
    type: String,
    default: 'Shiv Gorakh Welfare Foundation',
    trim: true,
  },
  certificateType: {
    type: String,
    enum: ['Registration', '80G & 12A', 'Tax Exemption', 'Recognition', 'Volunteer', 'Appreciation', 'Partnership', 'Legal', 'Other'],
    default: 'Registration',
  },
  certificateNumber: {
    type: String,
    default: '',
    trim: true,
  },
  issuingAuthority: {
    type: String,
    default: 'Government of India',
    trim: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  fileUrl: {
    type: String,
    default: '',
    trim: true,
  },
  imageUrls: {
    type: [String],
    default: [],
  },
}, { timestamps: true, versionKey: false });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
