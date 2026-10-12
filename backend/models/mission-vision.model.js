const mongoose = require('mongoose');

const missionVisionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Mission', 'Vision', 'Core Value', 'Goal', 'Pillar'],
      default: 'Mission',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    points: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      default: 'heart',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Draft'],
      default: 'Active',
      index: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false },
);

const MissionVision = mongoose.model('MissionVision', missionVisionSchema);

module.exports = MissionVision;
