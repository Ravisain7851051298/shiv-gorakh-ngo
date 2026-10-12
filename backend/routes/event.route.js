const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/role.middleware');
const { UserRole } = require('../constants/app.constants');
const Event = require('../models/event.model');
const EventRsvp = require('../models/event-rsvp.model');
const Volunteer = require('../models/volunteer.model');
const Membership = require('../models/membership.model');
const { createImageUpload } = require('../middlewares/image-upload.middleware');
const { createContentController } = require('../controllers/content.controller');
const { createError } = require('../utils/error.util');

const router = express.Router();
const uploadImages = createImageUpload('events');
const eventController = createContentController({
  Model: Event,
  singular: 'event',
  plural: 'events',
  folderName: 'events',
  fields: ['title', 'date', 'description'],
  supportsDateFilter: true,
});
const adminOnly = [authMiddleware, authorizeRoles(UserRole.ADMIN)];

// Baseline events to ensure collection is never empty
const BASELINE_SEED_EVENTS = [
  {
    title: 'Mega Anti-Rabies Vaccination & Deworming Camp',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    description:
      'Free medical checkups, vaccination against rabies, and deworming treatments for stray dogs and community pets across Rampur city. Certified veterinarians and trained volunteers will be on site with transport vehicles.',
    imageUrls: ['/services/5.jpeg'],
  },
  {
    title: 'Community Winter Feeder & Shelter Drive',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
    description:
      'Join us in setting up insulated bedding boxes and distributed feed points for community animals facing severe northern winter conditions. Open to youth, college students, and volunteer caregivers.',
    imageUrls: ['/services/6.jpeg'],
  },
  {
    title: 'Humane Animal Care & First-Aid Workshop',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    description:
      'Hands-on training session for volunteers on recognizing distress signs in street animals, safe handling of injured canines, wound dressing, and emergency hotline dispatch procedures.',
    imageUrls: ['/services/10.jpeg'],
  },
];

async function ensureSeedEvents() {
  try {
    const count = await Event.countDocuments();
    if (count === 0) {
      await Event.insertMany(BASELINE_SEED_EVENTS);
    }
  } catch (err) {
    // Non-blocking
  }
}
ensureSeedEvents();

// Helper to attach rich volunteer & membership metadata to RSVPs
async function enrichRsvpsWithProfiles(rsvps = []) {
  if (!rsvps.length) return [];
  const userIds = rsvps.map((r) => r.user?._id).filter(Boolean);

  const [volunteers, memberships] = await Promise.all([
    Volunteer.find({ user: { $in: userIds } }).lean(),
    Membership.find({ user: { $in: userIds } }).lean(),
  ]);

  const volMap = {};
  volunteers.forEach((v) => {
    volMap[String(v.user)] = v;
  });

  const memMap = {};
  memberships.forEach((m) => {
    memMap[String(m.user)] = m;
  });

  return rsvps.map((r) => {
    const uId = r.user ? String(r.user._id) : null;
    const vol = uId ? volMap[uId] : null;
    const mem = uId ? memMap[uId] : null;

    const officialId =
      vol?.volunteerId ||
      mem?.memberId ||
      r.user?.volunteerId ||
      r.user?.memberId ||
      null;

    const phone =
      r.user?.phone ||
      vol?.emergencyContact?.phone ||
      '';

    const city =
      vol?.address?.city ||
      mem?.city ||
      'Rampur';

    const state =
      vol?.address?.state ||
      mem?.state ||
      'Uttar Pradesh';

    const address =
      vol?.address?.addressLine ||
      mem?.address ||
      '';

    const pincode =
      vol?.address?.pincode ||
      mem?.zipCode ||
      '';

    const emergencyContact =
      vol?.emergencyContact ||
      null;

    return {
      ...r,
      officialId,
      phone,
      city,
      state,
      address,
      pincode,
      emergencyContact,
      skills: vol?.skills || [],
      animalTypes: vol?.animalTypes || [],
      experience: vol?.experience || '',
      volunteerDetails: vol
        ? {
            volunteerId: vol.volunteerId,
            status: vol.status,
            city: vol.address?.city || '',
            state: vol.address?.state || '',
            pincode: vol.address?.pincode || '',
            addressLine: vol.address?.addressLine || '',
            skills: vol.skills || [],
            animalTypes: vol.animalTypes || [],
            experience: vol.experience || '',
            emergencyContact: vol.emergencyContact || null,
            availability: vol.availability || null,
            rescueCapabilities: vol.rescueCapabilities || null,
          }
        : null,
      membershipDetails: mem
        ? {
            memberId: mem.memberId,
            status: mem.status,
            membershipType: mem.membershipType,
            city: mem.city || '',
            state: mem.state || '',
            address: mem.address || '',
            zipCode: mem.zipCode || '',
            startDate: mem.startDate || null,
            endDate: mem.endDate || null,
          }
        : null,
    };
  });
}

// ==========================================
// User Joined Events / RSVP Routes
// ==========================================

// Get all events joined by current user
router.get('/my-joined', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const rsvps = await EventRsvp.find({ user: userId, status: { $ne: 'Cancelled' } })
      .populate('event')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: rsvps,
    });
  } catch (error) {
    return next(error);
  }
});

// Join an event (Gracefully resolves mock string IDs like "event-base-1" to valid ObjectIds)
router.post('/:id/join', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const eventParam = req.params.id;

    let targetEvent = null;

    // 1. If valid ObjectId, try finding the event
    if (mongoose.Types.ObjectId.isValid(eventParam)) {
      targetEvent = await Event.findById(eventParam).catch(() => null);
    }

    // 2. If not found or if a mock string ID like "event-base-1" was passed
    if (!targetEvent) {
      const requestedTitle =
        req.body.title ||
        (eventParam === 'event-base-1'
          ? 'Mega Anti-Rabies Vaccination & Deworming Camp'
          : eventParam === 'event-base-2'
            ? 'Community Winter Feeder & Shelter Drive'
            : eventParam === 'event-base-3'
              ? 'Humane Animal Care & First-Aid Workshop'
              : 'Community Welfare Camp');

      // Check if an event already exists with matching title
      targetEvent = await Event.findOne({ title: requestedTitle });

      // If still not found, create it as a permanent MongoDB Event document
      if (!targetEvent) {
        targetEvent = await Event.create({
          title: requestedTitle,
          description:
            req.body.description ||
            'Community welfare camp organized by Shiv Gorakh Welfare Foundation.',
          date: req.body.date
            ? new Date(req.body.date)
            : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          imageUrls:
            Array.isArray(req.body.imageUrls) && req.body.imageUrls.length
              ? req.body.imageUrls
              : ['/services/5.jpeg'],
        });
      }
    }

    // Now targetEvent._id is 100% a valid Mongoose ObjectId!
    const rsvp = await EventRsvp.findOneAndUpdate(
      { user: userId, event: targetEvent._id },
      {
        $set: {
          status: 'Confirmed',
          eventTitle: targetEvent.title || req.body.title || 'Community Event',
          eventDate: targetEvent.date || req.body.date || new Date(),
          eventLocation:
            req.body.location || 'Foundation Rescue Ground, Civil Lines, Rampur',
        },
      },
      { upsert: true, new: true }
    ).populate('user', 'name email phone role profilePicture volunteerId memberId');

    return res.status(200).json({
      success: true,
      message: 'You have successfully joined this event! RSVP confirmed.',
      data: rsvp,
    });
  } catch (error) {
    return next(error);
  }
});

// Cancel RSVP for an event
router.delete('/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const eventParam = req.params.id;

    let targetEventId = eventParam;
    if (!mongoose.Types.ObjectId.isValid(eventParam)) {
      const requestedTitle =
        req.body?.title ||
        (eventParam === 'event-base-1'
          ? 'Mega Anti-Rabies Vaccination & Deworming Camp'
          : eventParam === 'event-base-2'
            ? 'Community Winter Feeder & Shelter Drive'
            : eventParam === 'event-base-3'
              ? 'Humane Animal Care & First-Aid Workshop'
              : null);
      if (requestedTitle) {
        const found = await Event.findOne({ title: requestedTitle });
        if (found) targetEventId = found._id;
      }
    }

    if (mongoose.Types.ObjectId.isValid(targetEventId)) {
      await EventRsvp.findOneAndDelete({ user: userId, event: targetEventId });
    }

    return res.status(200).json({
      success: true,
      message: 'Event RSVP has been cancelled.',
    });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// Admin: Master Attendees & RSVP Tracking
// ==========================================

// Admin: Get all attendees across ALL events
router.get('/admin/all-attendees', ...adminOnly, async (req, res, next) => {
  try {
    const rsvps = await EventRsvp.find()
      .populate('event', 'title date location imageUrls')
      .populate('user', 'name email phone role profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    const richData = await enrichRsvpsWithProfiles(rsvps);

    return res.status(200).json({
      success: true,
      total: richData.length,
      data: richData,
    });
  } catch (error) {
    return next(error);
  }
});

// Admin: Summary counts of attendees across all events
router.get('/admin/attendees-summary', ...adminOnly, async (req, res, next) => {
  try {
    const summary = await EventRsvp.aggregate([
      {
        $group: {
          _id: '$event',
          totalCount: { $sum: 1 },
          confirmedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] },
          },
          attendedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Attended'] }, 1, 0] },
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] },
          },
          lastJoinedAt: { $max: '$createdAt' },
        },
      },
    ]);

    const summaryMap = {};
    summary.forEach((item) => {
      if (item._id) {
        summaryMap[String(item._id)] = {
          totalCount: item.totalCount,
          confirmedCount: item.confirmedCount,
          attendedCount: item.attendedCount,
          cancelledCount: item.cancelledCount,
          lastJoinedAt: item.lastJoinedAt,
        };
      }
    });

    return res.status(200).json({
      success: true,
      data: summaryMap,
    });
  } catch (error) {
    return next(error);
  }
});

// Admin: Get all participants who joined a specific event with full details
router.get('/:id/attendees', ...adminOnly, async (req, res, next) => {
  try {
    const eventId = req.params.id;

    let targetEventId = eventId;
    let event = null;

    if (mongoose.Types.ObjectId.isValid(eventId)) {
      event = await Event.findById(eventId).lean();
    } else {
      const requestedTitle =
        eventId === 'event-base-1'
          ? 'Mega Anti-Rabies Vaccination & Deworming Camp'
          : eventId === 'event-base-2'
            ? 'Community Winter Feeder & Shelter Drive'
            : eventId === 'event-base-3'
              ? 'Humane Animal Care & First-Aid Workshop'
              : null;
      if (requestedTitle) {
        event = await Event.findOne({ title: requestedTitle }).lean();
        if (event) targetEventId = event._id;
      }
    }

    if (!mongoose.Types.ObjectId.isValid(targetEventId)) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
      });
    }

    const attendees = await EventRsvp.find({ event: targetEventId })
      .populate('user', 'name email phone role profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    const richAttendees = await enrichRsvpsWithProfiles(attendees);

    return res.status(200).json({
      success: true,
      event: event
        ? {
            _id: event._id,
            title: event.title,
            date: event.date,
            location: event.location,
            imageUrls: event.imageUrls,
          }
        : null,
      total: richAttendees.length,
      data: richAttendees,
    });
  } catch (error) {
    return next(error);
  }
});

// Admin: Update attendee RSVP status (e.g., Mark as Attended)
router.patch('/:id/attendees/:rsvpId', ...adminOnly, async (req, res, next) => {
  try {
    const { rsvpId } = req.params;
    const { status, notes } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const rsvp = await EventRsvp.findByIdAndUpdate(
      rsvpId,
      { $set: updateFields },
      { new: true }
    )
      .populate('user', 'name email phone role profilePicture')
      .lean();

    if (!rsvp) {
      throw createError('Attendee RSVP record not found.', 404);
    }

    const [enriched] = await enrichRsvpsWithProfiles([rsvp]);

    return res.status(200).json({
      success: true,
      message: 'Attendee status updated successfully.',
      data: enriched,
    });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// Enhanced All Events with Attendee Counts & Recent Attendees Preview
// ==========================================
router.get('/all', async (req, res, next) => {
  try {
    await ensureSeedEvents();

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ date: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    // Aggregate attendees for all returned events
    const eventIds = events.map((e) => e._id);
    const [rsvpCounts, recentRsvps] = await Promise.all([
      EventRsvp.aggregate([
        { $match: { event: { $in: eventIds }, status: { $ne: 'Cancelled' } } },
        { $group: { _id: '$event', count: { $sum: 1 } } },
      ]),
      EventRsvp.find({ event: { $in: eventIds }, status: { $ne: 'Cancelled' } })
        .populate('user', 'name email role profilePicture')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

    const countMap = {};
    rsvpCounts.forEach((r) => {
      countMap[String(r._id)] = r.count;
    });

    const recentMap = {};
    recentRsvps.forEach((r) => {
      const eId = String(r.event);
      if (!recentMap[eId]) recentMap[eId] = [];
      if (recentMap[eId].length < 3 && r.user) {
        recentMap[eId].push({
          _id: r.user._id,
          name: r.user.name,
          role: r.user.role,
          profilePicture: r.user.profilePicture,
        });
      }
    });

    const eventsWithCounts = events.map((e) => ({
      ...e,
      attendeesCount: countMap[String(e._id)] || 0,
      rsvpsCount: countMap[String(e._id)] || 0,
      recentAttendees: recentMap[String(e._id)] || [],
    }));

    return res.status(200).json({
      success: true,
      message: 'events retrieved successfully',
      events: eventsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
});

// ==========================================
// Standard Content Routes (Create, Update, Remove)
// ==========================================
router.post('/create', ...adminOnly, uploadImages, eventController.create);
router.get('/:id', eventController.getById);
router.patch('/:id', ...adminOnly, uploadImages, eventController.update);
router.delete('/:id', ...adminOnly, eventController.remove);

module.exports = router;
