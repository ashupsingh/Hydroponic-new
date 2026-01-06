const Device = require('../models/Device');
const SensorReading = require('../models/SensorReading');

// Helper to generate random value with slight drift
const generateValue = (current, min, max, drift) => {
    let change = (Math.random() - 0.5) * drift;
    let newValue = current + change;
    if (newValue < min) newValue = min + Math.random() * (drift / 2);
    if (newValue > max) newValue = max - Math.random() * (drift / 2);
    return parseFloat(newValue.toFixed(2));
};

module.exports = async (req, res) => {
    try {
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

            // Save historical reading
            await SensorReading.create({
                deviceId: device._id,
                ...newSensors
            });

            // Update device current state
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
        console.error('Cron Error:', err);
        res.status(500).json({ error: err.message });
    }
};
