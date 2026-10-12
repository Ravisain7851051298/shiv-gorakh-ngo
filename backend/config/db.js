const mongoose = require("mongoose");
const User = require("../models/user.model");

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is not set in the environment");
    }

    try {
        await mongoose.connect(uri);

        const userCollectionName = User.collection.collectionName;
        const collectionExists = await mongoose.connection.db
            .listCollections({ name: userCollectionName }, { nameOnly: true })
            .hasNext();

        if (collectionExists) {
            const indexes = await User.collection.indexes();
            const obsoletePhoneIndex = indexes.find((index) =>
                index.key.phone === 1 &&
                Object.keys(index.key).length === 1 &&
                !(index.unique && index.sparse)
            );

            if (obsoletePhoneIndex) {
                await User.collection.dropIndex(obsoletePhoneIndex.name);
            }
        }

        await User.createIndexes();
        console.log(`========================================
✅ MongoDB Connected Successfully
========================================`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;
