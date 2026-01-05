const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Device = require('../models/Device');
const SensorReading = require('../models/SensorReading');
const User = require('../models/User');

// GET /api/user/devices - Get user's assigned devices with latest sensor data
router.get('/devices', auth, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Get user's devices
        const devices = await Device.find({ userId: req.user.id });

        // Get latest sensor data for each device
        const devicesWithData = await Promise.all(devices.map(async (device) => {
            const latestData = await SensorReading.findOne({ deviceId: device._id })
                .sort({ timestamp: -1 });

            return {
                ...device._doc,
                latestSensorData: latestData || null
            };
        }));

        // Sort by user's deviceOrder preference
        const user = await User.findById(req.user.id);
        if (user.deviceOrder && user.deviceOrder.length > 0) {
            devicesWithData.sort((a, b) => {
                const aIndex = user.deviceOrder.indexOf(a._id.toString());
                const bIndex = user.deviceOrder.indexOf(b._id.toString());
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
            });
        }

        res.json(devicesWithData);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/user/device/:id/rename - Rename device
router.put('/device/:id/rename', auth, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { customName } = req.body;

        if (!customName || customName.trim() === '') {
            return res.status(400).json({ msg: 'Custom name is required' });
        }

        const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

        if (!device) {
            return res.status(404).json({ msg: 'Device not found or not assigned to you' });
        }

        device.customName = customName.trim();
        await device.save();

        res.json({ msg: 'Device renamed successfully', device });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/user/device-order - Save widget order preference
router.put('/device-order', auth, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { deviceOrder } = req.body;

        if (!Array.isArray(deviceOrder)) {
            return res.status(400).json({ msg: 'Device order must be an array' });
        }

        const user = await User.findById(req.user.id);
        user.deviceOrder = deviceOrder;
        await user.save();

        res.json({ msg: 'Device order saved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/user/device/:id/history - Get sensor history for a device
router.get('/device/:id/history', auth, async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });

        if (!device) {
            return res.status(404).json({ msg: 'Device not found or not assigned to you' });
        }

        const { hours = 24 } = req.query;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const history = await SensorReading.find({
            deviceId: device._id,
            timestamp: { $gte: since }
        }).sort({ timestamp: 1 }).limit(100);

        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/user/issue - Submit a new issue
router.post('/issue', auth, async (req, res) => {
    try {
        const { description, deviceId } = req.body;
        const Issue = require('../models/Issue');

        if (!description || !deviceId) {
            return res.status(400).json({ msg: 'Description and Device ID are required' });
        }

        const newIssue = new Issue({
            userId: req.user.id,
            deviceId,
            description
        });

        await newIssue.save();
        res.json({ msg: 'Issue reported successfully', issue: newIssue });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/user/issues - Get user's reported issues
router.get('/issues', auth, async (req, res) => {
    try {
        const Issue = require('../models/Issue');
        const issues = await Issue.find({ userId: req.user.id })
            .populate('deviceId', 'deviceName serialNumber')
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
