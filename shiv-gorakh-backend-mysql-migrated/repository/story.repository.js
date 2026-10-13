const Story = require('../models/story.model');

const storyRepository = {
    create: async (storyData) => {
        return Story.create(storyData);
    },

    getAll: async () => {
        return Story.find();
    },

    getById: async (storyId) => {
        return Story.findById(storyId);
    },

    update: async (storyId, storyData) => {
        return Story.findByIdAndUpdate(storyId, storyData, { returnDocument: 'after', runValidators: true });
    },

    remove: async (storyId) => {
        return Story.findByIdAndDelete(storyId);
    },
};

module.exports = storyRepository;
