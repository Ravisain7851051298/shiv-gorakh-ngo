const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    tokenType: {
      type: String,
      enum: ['access', 'refresh'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 7 * 24 * 60 * 60, // 7 days in seconds (604,800s) TTL index
    },
  },
  { versionKey: false }
);

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

// Drop old expiresAt_1 index if it existed with expireAfterSeconds to allow 7-day TTL retention
mongoose.connection.on('open', async () => {
  try {
    const indexes = await TokenBlacklist.collection.indexes().catch(() => []);
    const oldExpiresIndex = indexes.find(
      (idx) => idx.name === 'expiresAt_1' && idx.expireAfterSeconds !== undefined
    );
    if (oldExpiresIndex) {
      await TokenBlacklist.collection.dropIndex('expiresAt_1');
    }
  } catch {
    // Ignore if collection not ready or index already dropped
  }
});

module.exports = TokenBlacklist;
