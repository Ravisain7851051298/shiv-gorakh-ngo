const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Emergency Rescue & Healthcare',
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: 'FiActivity',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Draft'],
      default: 'Active',
    },
    order: {
      type: Number,
      default: 0,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
