const storyService = require('../services/story.service');

async function createStory(req, res, next) {
    try {
        const story = await storyService.create(req.body);
        return res.status(201).json({
            success: true,
            message: 'Story created successfully',
            story,
        });
    } catch (error) {
        next(error);
    }

}

async function getAllStories(req, res, next) {
    try {
        const stories = await storyService.getAll();
        return res.status(200).json({
            success: true,
            message: 'Stories retrieved successfully',
            stories,
        });
    }
    catch (error) {
        next(error);
    }

}

async function getStoryById(req, res, next) {
    try {
        const story = await storyService.getById(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Story retrieved successfully',
            story,
        });
    }
    catch (error) {
        next(error);
    }
}

async function updateStory(req, res, next) {
    try {
        const story = await storyService.update(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Story updated successfully',
            story,
        });
    }
    catch (error) {
        next(error);
    }
}

async function deleteStory(req, res, next) {
    try {
        await storyService.delete(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Story deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
}

module.exports = {
    createStory,
    getAllStories,
    getStoryById,
    updateStory,
    deleteStory,
};
