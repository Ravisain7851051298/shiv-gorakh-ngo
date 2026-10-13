const mongoose = require('../config/mysql-odm.js');

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      default: '',
      trim: true,
    },
    userEmail: {
      type: String,
      default: '',
      trim: true,
    },
    userPhone: {
      type: String,
      default: '',
      trim: true,
    },
    userRole: {
      type: String,
      enum: ['volunteer', 'member', 'donor', 'admin'],
      default: 'volunteer',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    category: {
      type: String,
      default: 'General Grievance',
      enum: [
        'Rescue Operation',
        'Animal Abuse / Cruelty Incident',
        'Field Logistics & Medical Aid',
        'ID Card / Credential Issue',
        'Membership / Donation Inquiry',
        'General Grievance',
        'Other',
      ],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['Pending Review', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending Review',
      index: true,
    },
    adminRemarks: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
