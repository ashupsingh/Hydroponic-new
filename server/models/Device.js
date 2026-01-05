const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    deviceName: {
        type: String,
        required: true
    },
    customName: {
        type: String,
        default: null
    },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    deviceType: {
        type: String,
        enum: ['Hydroponic Unit', 'Aeroponic Unit', 'Climate Controller'],
        default: 'Hydroponic Unit'
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Maintenance', 'Error'],
        default: 'Active'
    },
    sensors: {
        temperature: { type: Number, default: 0 },
        humidity: { type: Number, default: 0 },
        ph: { type: Number, default: 0 },
        ec: { type: Number, default: 0 },
        waterLevel: { type: Number, default: 0 },
        lightIntensity: { type: Number, default: 0 }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Device', DeviceSchema);
