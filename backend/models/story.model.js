const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrls: {
        type: [String],
        required: false
    }
}, { timestamps: true, versionKey: false });

const Story = mongoose.model('Story', storySchema);
module.exports = Story;