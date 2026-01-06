require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// Database Connection
const connectDB = require('./db');

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) {
        try {
            await connectDB();
        } catch (error) {
            console.error('❌ Database Connection Error:', error);
            // Don't crash, just log. Routes needing DB will fail naturally or we can return 500 here.
            // For now, let's return a proper error
            return res.status(500).json({ error: 'Database connection failed', details: error.message });
        }
    }
    next();
});

// Basic Route
app.get('/', (req, res) => {
    res.send('GreevaTech Backend API is running.');
});

// Debug Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        env: process.env.NODE_ENV,
        mongo: mongoose.connection.readyState
    });
});

// Manual Sensor Update Route (for demo purposes)
app.get('/api/update-sensors', async (req, res) => {
    try {
        const Device = require('./models/Device');
        const SensorReading = require('./models/SensorReading');

        const generateValue = (current, min, max, drift) => {
            let change = (Math.random() - 0.5) * drift;
            let newValue = current + change;
            if (newValue < min) newValue = min + Math.random() * (drift / 2);
            if (newValue > max) newValue = max - Math.random() * (drift / 2);
            return parseFloat(newValue.toFixed(2));
        };

        const devices = await Device.find({});

        if (devices.length === 0) {
            return res.json({ msg: 'No devices to update', count: 0 });
        }

        const updates = devices.map(async (device) => {
            const sensors = device.sensors || {
                temperature: 24,
                humidity: 60,
                ph: 6.5,
                ec: 1.2,
                waterLevel: 80,
                lightIntensity: 10000
            };

            const newSensors = {
                temperature: generateValue(sensors.temperature, 15, 35, 0.5),
                humidity: generateValue(sensors.humidity, 30, 90, 2),
                ph: generateValue(sensors.ph, 5.5, 7.5, 0.1),
                ec: generateValue(sensors.ec, 0.8, 2.5, 0.1),
                waterLevel: generateValue(sensors.waterLevel, 20, 100, 1),
                lightIntensity: generateValue(sensors.lightIntensity, 0, 20000, 500)
            };

            await SensorReading.create({
                deviceId: device._id,
                ...newSensors
            });

            device.sensors = newSensors;
            await device.save();

            return device.deviceName;
        });

        const updated = await Promise.all(updates);

        res.json({
            msg: 'Sensor data updated successfully',
            count: updated.length,
            devices: updated,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('Update Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Import Models
require('./models/User');
require('./models/Device');
require('./models/Ticket');
require('./models/SensorReading');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
