const mongoose = require('../config/mysql-odm.js');

const volunteerSchema = new mongoose.Schema(
  {
    // Existing User document
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    address: {
      state: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine: {
        type: String,
        trim: true,
      },
    },

    animalTypes: [
      {
        type: String,
        enum: ["DOG", "CAT", "COW", "BIRD", "HORSE", "OTHER"],
      },
    ],

    skills: [
      {
        type: String,
        enum: [
          "ANIMAL_RESCUE",
          "ANIMAL_FIRST_AID",
          "ANIMAL_CARE",
          "DRIVING",
          "PHOTOGRAPHY",
          "SOCIAL_MEDIA",
          "FUNDRAISING",
          "EVENT_MANAGEMENT",
          "OTHER",
        ],
      },
    ],

    experience: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    availability: {
      days: [
        {
          type: String,
          enum: [
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY",
          ],
        },
      ],

      emergencyAvailable: {
        type: Boolean,
        default: false,
      },
    },

    rescueCapabilities: {
      canRescue: {
        type: Boolean,
        default: false,
      },

      canTransport: {
        type: Boolean,
        default: false,
      },

      vehicleType: {
        type: String,
        enum: ["BIKE", "CAR", "VAN", "TRUCK", "OTHER"],
      },

      canHandleInjuredAnimals: {
        type: Boolean,
        default: false,
      },
    },

    preferredActivities: [
      {
        type: String,
        enum: [
          "RESCUE",
          "FEEDING",
          "SHELTER_SUPPORT",
          "ADOPTION",
          "MEDICAL_SUPPORT",
          "AWARENESS",
          "FUNDRAISING",
          "OTHER",
        ],
      },
    ],

    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },

      relationship: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "PENDING",
      index: true,
    },

    volunteerId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    certificateNumber: {
      type: String,
      default: "",
      trim: true,
    },

    certificateSentAt: {
      type: Date,
    },

    offerLetterSentAt: {
      type: Date,
    },

    appointmentLetterSentAt: {
      type: Date,
    },

    approvedAt: {
      type: Date,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);