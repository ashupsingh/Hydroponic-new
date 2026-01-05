const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Device = require('./models/Device');
const SensorReading = require('./models/SensorReading');

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/greevatech';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Simulator connected to MongoDB');
        startSimulation();
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
};

// Helper to generate random value with slight drift
const generateValue = (current, min, max, drift) => {
    let change = (Math.random() - 0.5) * drift;
    let newValue = current + change;
    // Clamp values
    if (newValue < min) newValue = min + Math.random() * (drift / 2);
    if (newValue > max) newValue = max - Math.random() * (drift / 2);
    return parseFloat(newValue.toFixed(2));
};

const startSimulation = async () => {
    console.log('🚀 Starting Sensor Data Simulator...');
    console.log('Press Ctrl+C to stop.');

    setInterval(async () => {
        try {
            // Get all devices (simulating active ones)
            const devices = await Device.find({});

            if (devices.length === 0) {
                // console.log('Waiting for devices...');
                return;
            }

            const updates = devices.map(async (device) => {
                // Initialize sensors if missing
                const sensors = device.sensors || {
                    temperature: 24,
                    humidity: 60,
                    ph: 6.5,
                    ec: 1.2,
                    waterLevel: 80,
                    lightIntensity: 10000
                };

                // Generate new values
                const newSensors = {
                    temperature: generateValue(sensors.temperature, 15, 35, 0.5),
                    humidity: generateValue(sensors.humidity, 30, 90, 2),
                    ph: generateValue(sensors.ph, 5.5, 7.5, 0.1),
                    ec: generateValue(sensors.ec, 0.8, 2.5, 0.1),
                    waterLevel: generateValue(sensors.waterLevel, 20, 100, 1), // Water level usually drops
                    lightIntensity: generateValue(sensors.lightIntensity, 0, 20000, 500)
                };

                // 1. Save historical reading
                await SensorReading.create({
                    deviceId: device._id,
                    ...newSensors
                });

                // 2. Update device current state
                device.sensors = newSensors;
                await device.save();

                // console.log(`Updated ${device.deviceName}: Temp ${newSensors.temperature}°C`);
            });

            await Promise.all(updates);
            process.stdout.write('.'); // progress indicator

        } catch (err) {
            console.error('Simulation Step Error:', err.message);
        }
    }, 2000); // Run every 2 seconds
};

connectDB();
