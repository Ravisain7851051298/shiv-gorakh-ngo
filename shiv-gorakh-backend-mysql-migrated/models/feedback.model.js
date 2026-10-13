const mongoose = require('../config/mysql-odm.js');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  userRole: {
    type: String,
    default: 'supporter',
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '',
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Approved',
    index: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  adminReply: {
    type: String,
    default: '',
    trim: true,
  },
}, { timestamps: true, versionKey: false });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
