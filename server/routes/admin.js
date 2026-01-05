const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Device = require('../models/Device');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Middleware to verify Admin Token
const authAdmin = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Get Statistics for Overview
router.get('/stats', authAdmin, async (req, res) => {
    try {
        const Issue = require('../models/Issue');

        // 1. Total Users
        const totalUsers = await User.countDocuments({ role: 'user' });

        // 2. Device Statistics
        const devices = await Device.find({});
        const activeDevices = devices.filter(d => d.status === 'Active').length;
        const notWorkingDevices = devices.filter(d => d.status !== 'Active').length;

        // 3. Users with/without Devices
        const usersWithDevicesIds = await Device.distinct('userId');
        const usersWithDevices = usersWithDevicesIds.length;
        const usersWithoutDevices = totalUsers - usersWithDevices;

        // 4. Issue Statistics
        const tickets = await Issue.find({});
        const totalIssues = tickets.length;
        const resolvedIssues = tickets.filter(t => t.status === 'Resolved').length;
        const pendingIssues = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

        // Mocking Activity Data (since we don't have historical logs)
        const activityData = [
            { name: 'Mon', activity: Math.floor(activeDevices * 10.5), growth: Math.floor(activeDevices * 5) },
            { name: 'Tue', activity: Math.floor(activeDevices * 12), growth: Math.floor(activeDevices * 6) },
            { name: 'Wed', activity: Math.floor(activeDevices * 8.5), growth: Math.floor(activeDevices * 9) },
            { name: 'Thu', activity: Math.floor(activeDevices * 14), growth: Math.floor(activeDevices * 4) },
            { name: 'Fri', activity: Math.floor(activeDevices * 11), growth: Math.floor(activeDevices * 7) },
            { name: 'Sat', activity: Math.floor(activeDevices * 9), growth: Math.floor(activeDevices * 8) },
            { name: 'Sun', activity: Math.floor(activeDevices * 13), growth: Math.floor(activeDevices * 5) },
        ];

        // Mocking Resource Data
        const resourceData = [
            { name: 'Week 1', water: activeDevices * 50, nutrients: activeDevices * 20 },
            { name: 'Week 2', water: activeDevices * 45, nutrients: activeDevices * 25 },
            { name: 'Week 3', water: activeDevices * 60, nutrients: activeDevices * 15 },
            { name: 'Week 4', water: activeDevices * 55, nutrients: activeDevices * 30 },
        ];

        res.json({
            stats: {
                totalUsers,
                activeDevices,
                notWorkingDevices,
                usersWithDevices,
                usersWithoutDevices,
                totalIssues,
                resolvedIssues,
                pendingIssues
            },
            activityData,
            resourceData
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/issues - Get all issues
router.get('/issues', authAdmin, async (req, res) => {
    try {
        const Issue = require('../models/Issue');
        const issues = await Issue.find({})
            .populate('userId', 'name email')
            .populate('deviceId', 'deviceName serialNumber')
            .sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT /api/admin/issue/:id/respond - Respond to issue
router.put('/issue/:id/respond', authAdmin, async (req, res) => {
    try {
        const { response, status } = req.body;
        const Issue = require('../models/Issue');

        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ msg: 'Issue not found' });
        }

        if (response) issue.adminResponse = response;
        if (status) issue.status = status;

        await issue.save();
        res.json({ msg: 'Issue updated successfully', issue });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Register and Assign New Device
router.post('/register-assign', authAdmin, async (req, res) => {
    const { userId, deviceName, serialNumber, lat, lng } = req.body;

    try {
        // Check if device already exists
        let device = await Device.findOne({ serialNumber });
        if (device) {
            return res.status(400).json({ msg: 'Device with this serial number already exists' });
        }

        // Create new device
        device = new Device({
            deviceName,
            serialNumber,
            location: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            },
            userId, // Assign immediately
            // Defaults handled by Schema: status='Active', deviceType='Hydroponic Unit', sensors={0...}
        });

        await device.save();

        // Update user's device count (handled dynamically in GET /users, but good to link if needed)
        // No explicit link needed on User model since we query Devices by userId

        res.json(device);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create New User (Admin)
router.post('/users', authAdmin, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please provide name, email, and password' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        await user.save();

        res.json({
            msg: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete User (Admin)
router.delete('/users/:id', authAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ msg: 'Cannot delete admin users' });
        }

        // Delete all devices associated with this user
        await Device.deleteMany({ userId: req.params.id });

        // Delete user
        await User.findByIdAndDelete(req.params.id);

        res.json({ msg: 'User and associated devices deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Devices for a Specific User
router.get('/devices/:userId', authAdmin, async (req, res) => {
    try {
        const devices = await Device.find({ userId: req.params.userId });
        res.json(devices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create Device and Assign to User
router.post('/devices', authAdmin, async (req, res) => {
    try {
        const { userId, deviceName, deviceType, serialNumber, location } = req.body;

        // Validation
        if (!userId || !deviceName || !deviceType) {
            return res.status(400).json({ msg: 'Please provide userId, deviceName, and deviceType' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Create device
        const device = new Device({
            userId,
            deviceName,
            deviceType,
            serialNumber: serialNumber || `GT-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'Active',
            sensors: {
                temperature: 22.0,
                humidity: 60,
                ph: 6.0,
                ec: 1.5,
                waterLevel: 75,
                lightIntensity: 12000
            },
            location: location || {
                lat: 0,
                lng: 0,
                address: 'Not set'
            }
        });

        await device.save();

        res.json({
            msg: 'Device created and assigned successfully',
            device
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete Device
router.delete('/devices/:id', authAdmin, async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({ msg: 'Device not found' });
        }

        await Device.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Device deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Specific Device Data (For Sensor View)
router.get('/device/:deviceId', authAdmin, async (req, res) => {
    try {
        const device = await Device.findById(req.params.deviceId);
        if (!device) return res.status(404).json({ msg: 'Device not found' });

        // Mocking real-time changes for demonstration
        device.sensors.temperature = parseFloat((20 + Math.random() * 5).toFixed(1));
        device.sensors.humidity = Math.floor(40 + Math.random() * 40);
        device.sensors.ph = parseFloat((5.5 + Math.random()).toFixed(1));
        device.sensors.ec = parseFloat((1.0 + Math.random()).toFixed(1));

        await device.save();
        res.json(device);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get All Devices with Location (for Map)
router.get('/devices-map', authAdmin, async (req, res) => {
    try {
        const devices = await Device.find({})
            .populate('userId', 'name email')
            .select('deviceName status location sensors userId');

        res.json(devices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Sensor History for Device (24 hours)
router.get('/devices/:id/history', authAdmin, async (req, res) => {
    try {
        const SensorReading = require('../models/SensorReading');
        const hours = parseInt(req.query.hours) || 24;

        const readings = await SensorReading.find({
            deviceId: req.params.id,
            timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) }
        }).sort({ timestamp: 1 });

        res.json(readings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Widget Details (for clickable widgets)
router.get('/widget/:type', authAdmin, async (req, res) => {
    try {
        const Issue = require('../models/Issue');
        const { type } = req.params;
        let data = [];

        switch (type) {
            case 'active-devices':
                data = await Device.find({ status: 'Active' })
                    .populate('userId', 'name email')
                    .select('deviceName serialNumber userId status');
                break;

            case 'not-working':
                data = await Device.find({ status: { $ne: 'Active' } })
                    .populate('userId', 'name email')
                    .select('deviceName serialNumber userId status');
                break;

            case 'total-users':
                data = await User.find({ role: 'user' })
                    .select('name email createdAt');
                break;

            case 'users-with-devices':
                const userIdsWithDevices = await Device.distinct('userId');
                data = await User.find({ _id: { $in: userIdsWithDevices }, role: 'user' })
                    .select('name email');
                data = await Promise.all(data.map(async (user) => {
                    const count = await Device.countDocuments({ userId: user._id });
                    return { ...user._doc, deviceCount: count };
                }));
                break;

            case 'users-without-devices':
                const userIdsWithDevs = await Device.distinct('userId');
                data = await User.find({ _id: { $nin: userIdsWithDevs }, role: 'user' })
                    .select('name email createdAt');
                break;

            case 'total-issues':
                data = await Issue.find({})
                    .populate('userId', 'name email')
                    .select('description status userId createdAt');
                break;

            case 'resolved-issues':
                data = await Issue.find({ status: 'Resolved' })
                    .populate('userId', 'name email')
                    .select('description status userId createdAt');
                break;

            case 'pending-issues':
                data = await Issue.find({ status: { $in: ['Open', 'In Progress'] } })
                    .populate('userId', 'name email')
                    .select('description status userId createdAt');
                break;

            default:
                return res.status(400).json({ msg: 'Invalid widget type' });
        }

        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/admin/assign-device - Assign device to user
router.post('/assign-device', authAdmin, async (req, res) => {
    try {
        const { userId, deviceId } = req.body;

        if (!userId || !deviceId) {
            return res.status(400).json({ msg: 'User ID and Device ID are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({ msg: 'Device not found' });
        }

        if (device.userId) {
            return res.status(400).json({ msg: 'Device is already assigned to another user' });
        }

        device.userId = userId;
        await device.save();

        res.json({ msg: 'Device assigned successfully', device });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/admin/unassign-device - Unassign device from user
router.post('/unassign-device', authAdmin, async (req, res) => {
    try {
        const { deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({ msg: 'Device ID is required' });
        }

        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({ msg: 'Device not found' });
        }

        device.userId = null;
        device.customName = null;
        await device.save();

        res.json({ msg: 'Device unassigned successfully', device });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/admin/available-devices - Get unassigned devices
router.get('/available-devices', authAdmin, async (req, res) => {
    try {
        const devices = await Device.find({ userId: null });
        res.json(devices);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/admin/devices - Get all devices
router.get('/devices', authAdmin, async (req, res) => {
    try {
        const devices = await Device.find({});
        res.json(devices);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/admin/users - Get all users sorted by newest first
router.get('/users', authAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
            .select('-password -otp -otpExpiry');

        // Add device count for each user
        const usersWithDeviceCount = await Promise.all(users.map(async (user) => {
            const deviceCount = await Device.countDocuments({ userId: user._id });
            const now = new Date();
            const userCreatedAt = new Date(user.createdAt);
            const hoursSinceCreation = (now - userCreatedAt) / (1000 * 60 * 60);
            const isNew = hoursSinceCreation < 24; // Last 24 hours

            return {
                ...user._doc,
                deviceCount,
                isNew
            };
        }));

        // Sort by userNumber descending (newest/highest number first)
        usersWithDeviceCount.sort((a, b) => (b.userNumber || 0) - (a.userNumber || 0));

        console.log('=== USERS ENDPOINT CALLED ===');
        console.log('Total users:', usersWithDeviceCount.length);
        console.log('First user:', usersWithDeviceCount[0]?.name, 'userNumber:', usersWithDeviceCount[0]?.userNumber);
        console.log('Last user:', usersWithDeviceCount[usersWithDeviceCount.length - 1]?.name, 'userNumber:', usersWithDeviceCount[usersWithDeviceCount.length - 1]?.userNumber);

        // Prevent caching
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json(usersWithDeviceCount);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
