const mongoose = require('mongoose');

// Production MongoDB URI (from your Vercel deployment)
const MONGO_URI = 'YOUR_MONGO_URL';

// Define schemas inline (since we can't import from models)
const deviceSchema = new mongoose.Schema({
    deviceName: String,
    deviceId: String,
    sensors: {
        temperature: Number,
        humidity: Number,
        ph: Number,
        ec: Number,
        waterLevel: Number,
        lightIntensity: Number
    }
}, { timestamps: true });

const sensorReadingSchema = new mongoose.Schema({
    deviceId: mongoose.Schema.Types.ObjectId,
    temperature: Number,
    humidity: Number,
    ph: Number,
    ec: Number,
    waterLevel: Number,
    lightIntensity: Number,
    timestamp: { type: Date, default: Date.now, expires: 1800 } // 30 min TTL
});

const Device = mongoose.model('Device', deviceSchema);
const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);

// Helper to generate random value with slight drift
const generateValue = (current, min, max, drift) => {
    let change = (Math.random() - 0.5) * drift;
    let newValue = current + change;
    if (newValue < min) newValue = min + Math.random() * (drift / 2);
    if (newValue > max) newValue = max - Math.random() * (drift / 2);
    return parseFloat(newValue.toFixed(2));
};

const startSimulation = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to Production MongoDB');
        console.log('🚀 Starting Sensor Data Simulator...');
        console.log('Press Ctrl+C to stop.\n');

        setInterval(async () => {
            try {
                const devices = await Device.find({});

                if (devices.length === 0) {
                    process.stdout.write('⏳');
                    return;
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
                });

                await Promise.all(updates);
                process.stdout.write('.');
            } catch (err) {
                console.error('\n❌ Simulation Error:', err.message);
            }
        }, 2000);

    } catch (err) {
        console.error('❌ Connection Error:', err);
        process.exit(1);
    }
};

startSimulation();
