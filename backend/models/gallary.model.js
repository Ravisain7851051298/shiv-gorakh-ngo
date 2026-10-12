const mongoose = require('mongoose');

const gallarySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    imageUrls: {
        type: [String],
        default: []
    },
    videoUrls: {
        type: [String],
        default: []
    },
    videoUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true, versionKey: false });

const Gallary = mongoose.model('Gallary', gallarySchema);
module.exports = Gallary;