const storyRepository = require('../repositories/story.repository');

async function create(storyData) {
    return await storyRepository.create(storyData);
}

async function getAll() {
    return await storyRepository.getAll();
}

async function getById(storyId) {
    return await storyRepository.getById(storyId);
}

async function update(storyId, storyData) {
    return await storyRepository.update(storyId, storyData);
}

async function remove(storyId) {
    return await storyRepository.remove(storyId);
}

module.exports = { create, getAll, getById, update, remove };