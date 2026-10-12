const mongoose = require('mongoose');

const ngoSettingSchema = new mongoose.Schema(
  {
    // Identity & Branding
    ngoName: {
      type: String,
      trim: true,
      default: 'Shiv Gorakh Welfare Foundation',
    },
    shortName: {
      type: String,
      trim: true,
      default: 'Shiv Gorakh',
    },
    suffix: {
      type: String,
      trim: true,
      default: 'Welfare Foundation',
    },
    tagline: {
      type: String,
      trim: true,
      default: 'Care, dignity, and hope—made stronger when we do it together.',
    },
    description: {
      type: String,
      trim: true,
      default:
        'Shiv Gorakh Welfare Foundation is a community-rooted foundation based in Rampur, Uttar Pradesh. We believe that care becomes meaningful when people come together and put compassion into action.',
    },
    logo: {
      type: String,
      trim: true,
      default: '',
    },
    logoInitials: {
      type: String,
      trim: true,
      default: 'SG',
    },

    // Founders & Leadership
    founderName: {
      type: String,
      trim: true,
      default: 'Hari Om',
    },
    founderRole: {
      type: String,
      trim: true,
      default: 'Founder, Shiv Gorakh Welfare Foundation',
    },
    founderImage: {
      type: String,
      trim: true,
      default: '/founders/HariOm.jpeg',
    },
    founderBio: {
      type: String,
      trim: true,
      default: 'Dedicated to community welfare, animal rescue operations, and emergency field response.',
    },

    coFounderName: {
      type: String,
      trim: true,
      default: 'Ankit Pandey',
    },
    coFounderRole: {
      type: String,
      trim: true,
      default: 'Co-Founder, Shiv Gorakh Welfare Foundation',
    },
    coFounderImage: {
      type: String,
      trim: true,
      default: '/founders/AnkitPandey.jpeg',
    },
    coFounderBio: {
      type: String,
      trim: true,
      default: 'Championing grassroots volunteer mobilization, feeding initiatives, and animal medical care.',
    },

    // Contact Details
    email: {
      type: String,
      trim: true,
      default: 'info@shivgorakh.org.in',
    },
    phone: {
      type: String,
      trim: true,
      default: '+91 93369 50578',
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: '+91 97590 57143',
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '+91 93369 50578',
    },

    // Physical Address
    addressLine: {
      type: String,
      trim: true,
      default: 'Mohammad Pur Jadied, Keorar, Milak',
    },
    city: {
      type: String,
      trim: true,
      default: 'Rampur',
    },
    state: {
      type: String,
      trim: true,
      default: 'Uttar Pradesh',
    },
    pincode: {
      type: String,
      trim: true,
      default: '244701',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    mapUrl: {
      type: String,
      trim: true,
      default: '',
    },

    // Legal & Social
    registrationNumber: {
      type: String,
      trim: true,
      default: '244701/SG-2022',
    },
    taxExemption80G: {
      type: String,
      trim: true,
      default: 'Eligible for 80G Tax Exemption',
    },
    facebook: {
      type: String,
      trim: true,
      default: '',
    },
    instagram: {
      type: String,
      trim: true,
      default: '',
    },
    twitter: {
      type: String,
      trim: true,
      default: '',
    },
    youtube: {
      type: String,
      trim: true,
      default: '',
    },
    linkedin: {
      type: String,
      trim: true,
      default: '',
    },

    // Signatures & Official Seals for Receipts and Certificates
    authorizedSignature: {
      type: String,
      trim: true,
      default: '',
    },
    signatoryName: {
      type: String,
      trim: true,
      default: 'Hari Om',
    },
    signatoryRole: {
      type: String,
      trim: true,
      default: 'Authorized Signatory',
    },
    presidentSignature: {
      type: String,
      trim: true,
      default: '',
    },
    secretarySignature: {
      type: String,
      trim: true,
      default: '',
    },
    stampImage: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const NgoSetting = mongoose.model('NgoSetting', ngoSettingSchema);

module.exports = NgoSetting;
