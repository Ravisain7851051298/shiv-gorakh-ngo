const mongoose = require('../config/mysql-odm.js');

const eventRsvpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    eventTitle: {
      type: String,
      default: '',
    },
    eventDate: {
      type: Date,
    },
    eventLocation: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Attended', 'Cancelled'],
      default: 'Confirmed',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, versionKey: false }
);

// Prevent duplicate RSVP for the same user and event
eventRsvpSchema.index({ user: 1, event: 1 }, { unique: true });

const EventRsvp = mongoose.model('EventRsvp', eventRsvpSchema);
module.exports = EventRsvp;
