const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable buffering
        };

        const MONGO_URI = process.env.MONGO_URI;

        if (!MONGO_URI) {
            throw new Error('Please define the MONGO_URI environment variable');
        }

        console.log('Connecting to MongoDB...');
        cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            console.log('✅ New MongoDB connection established');
            return mongoose;
        }).catch(err => {
            console.error('❌ MongoDB connection error:', err);
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

module.exports = connectDB;
