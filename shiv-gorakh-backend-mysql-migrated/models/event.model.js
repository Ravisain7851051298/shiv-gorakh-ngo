const mongoose = require('../config/mysql-odm.js');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrls: {
        type: [String],
        required: true
    }
}, { timestamps: true, versionKey: false });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;