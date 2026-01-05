const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
        expires: 1800 // Auto-delete after 30 minutes (in seconds)
    },
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    ph: {
        type: Number,
        required: true
    },
    ec: {
        type: Number,
        required: true
    },
    waterLevel: {
        type: Number,
        required: true
    },
    lightIntensity: {
        type: Number,
        required: true
    }
});

// Compound index for efficient queries
SensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', SensorReadingSchema);
