const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'Emergency Relief',
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  targetAmount: {
    type: Number,
    default: 50000,
  },
  raisedAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Active', 'Urgent', 'Completed'],
    default: 'Active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  imageUrls: {
    type: [String],
    default: [],
  },
}, { timestamps: true, versionKey: false });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
