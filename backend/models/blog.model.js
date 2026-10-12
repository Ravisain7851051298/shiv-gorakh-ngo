const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['News', 'Blog', 'Announcement', 'Field Story', 'Press Release'],
    default: 'News',
  },
  summary: {
    type: String,
    default: '',
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Shiv Gorakh Welfare Team',
    trim: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  imageUrls: {
    type: [String],
    default: [],
  },
}, { timestamps: true, versionKey: false });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
