const mongoose = require('../config/mysql-odm.js');

const programSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'Animal Welfare',
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  objective: {
    type: String,
    default: '',
    trim: true,
  },
  location: {
    type: String,
    default: 'Rampur, Uttar Pradesh',
    trim: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Upcoming', 'Completed'],
    default: 'Active',
  },
  beneficiaries: {
    type: String,
    default: '',
    trim: true,
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

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
