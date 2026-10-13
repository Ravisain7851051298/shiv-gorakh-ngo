const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');
const { createContentController } = require('../controllers/content.controller');
const { uploadRoot } = require('../middlewares/image-upload.middleware');

function createResponse() {
  return {
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('deleting content removes its local uploaded images only', async (t) => {
  const folderName = 'stories';
  const folderPath = path.join(uploadRoot, folderName);
  const filename = `delete-test-${process.pid}-${Date.now()}.jpg`;
  const imagePath = path.join(folderPath, filename);
  const outsideFolderImagePath = path.join(uploadRoot, filename);
  await fs.mkdir(folderPath, { recursive: true });
  await fs.writeFile(imagePath, 'test image');
  await fs.writeFile(outsideFolderImagePath, 'keep this file');
  t.after(async () => {
    await fs.rm(imagePath, { force: true });
    await fs.rm(outsideFolderImagePath, { force: true });
  });

  let deletedId;
  const controller = createContentController({
    Model: {
      findByIdAndDelete: async (id) => {
        deletedId = id;
        return {
          imageUrls: [
            `/uploads/${folderName}/${filename}`,
            `/uploads/${folderName}/../${filename}`,
            'https://example.com/external-image.jpg',
          ],
        };
      },
    },
    singular: 'story',
    plural: 'stories',
    folderName,
    fields: ['title', 'description'],
  });
  const response = createResponse();
  let nextError;

  await controller.remove(
    { params: { id: '507f1f77bcf86cd799439011' } },
    response,
    (error) => { nextError = error; },
  );

  assert.equal(nextError, undefined);
  assert.equal(deletedId, '507f1f77bcf86cd799439011');
  assert.equal(response.statusCode, 200);
  await assert.rejects(fs.access(imagePath), { code: 'ENOENT' });
  await fs.access(outsideFolderImagePath);
});
