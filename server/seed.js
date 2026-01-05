const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Device = require('./models/Device');
const Ticket = require('./models/Ticket');
const SensorReading = require('./models/SensorReading');
require('dotenv').config();

const usersCount = 25; // Increased to 25 total users

// Helper functions
const r = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Indian cities with coordinates
const indianLocations = [
    { lat: 28.6139, lng: 77.2090, addr: 'New Delhi, India' },
    { lat: 19.0760, lng: 72.8777, addr: 'Mumbai, Maharashtra' },
    { lat: 12.9716, lng: 77.5946, addr: 'Bangalore, Karnataka' },
    { lat: 13.0827, lng: 80.2707, addr: 'Chennai, Tamil Nadu' },
    { lat: 22.5726, lng: 88.3639, addr: 'Kolkata, West Bengal' },
    { lat: 17.3850, lng: 78.4867, addr: 'Hyderabad, Telangana' },
    { lat: 23.0225, lng: 72.5714, addr: 'Ahmedabad, Gujarat' },
    { lat: 18.5204, lng: 73.8567, addr: 'Pune, Maharashtra' },
    { lat: 26.9124, lng: 75.7873, addr: 'Jaipur, Rajasthan' },
    { lat: 21.1702, lng: 72.8311, addr: 'Surat, Gujarat' }
];

const issueTemplates = [
    { title: 'Device not responding', desc: 'My hydroponic unit stopped responding to commands' },
    { title: 'Sensor reading error', desc: 'Temperature sensor showing incorrect values' },
    { title: 'Water level alert', desc: 'Water level sensor not working properly' },
    { title: 'pH imbalance', desc: 'pH levels are fluctuating unexpectedly' },
    { title: 'Light system malfunction', desc: 'LED lights not turning on/off as scheduled' },
    { title: 'Connectivity issues', desc: 'Device keeps disconnecting from network' },
    { title: 'Pump failure', desc: 'Water pump making unusual noise' },
    { title: 'App sync problem', desc: 'Mobile app not syncing with device' }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing
        await User.deleteMany({});
        await Device.deleteMany({});
        await Ticket.deleteMany({});
        await SensorReading.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const userPassword = await bcrypt.hash('user123', salt);

        // 1. Admin
        await User.create({
            name: 'Super Admin',
            email: 'admin@greeva.tech',
            password: adminPassword,
            role: 'admin',
            isVerified: true // Admin is pre-verified
        });
        console.log('👤 Admin Created');

        const createdUsers = [];
        const createdDevices = [];
        let usersWithDevices = 0;
        let usersWithoutDevices = 0;

        // 2. Create Users
        // First 18 users will have devices, last 7 will have NO devices
        for (let i = 1; i <= usersCount; i++) {
            const user = await User.create({
                name: `User ${i}`,
                email: `user${i}@example.com`,
                password: userPassword,
                role: 'user'
            });
            createdUsers.push(user);

            // First 18 users get devices, last 7 don't
            const shouldHaveDevices = i <= 18;

            if (shouldHaveDevices) {
                usersWithDevices++;
                const deviceCount = rInt(1, 3);
                for (let j = 0; j < deviceCount; j++) {
                    const type = ['Hydroponic Unit', 'Aeroponic Unit', 'Climate Controller'][rInt(0, 2)];
                    const loc = indianLocations[rInt(0, indianLocations.length - 1)];
                    const lat = parseFloat((loc.lat + (Math.random() - 0.5) * 0.5).toFixed(6));
                    const lng = parseFloat((loc.lng + (Math.random() - 0.5) * 0.5).toFixed(6));

                    // Status distribution
                    const statusRoll = Math.random();
                    let status = 'Active';
                    if (statusRoll > 0.8) status = 'Maintenance';
                    if (statusRoll > 0.9) status = 'Error';

                    const isHealthy = status !== 'Error';

                    const device = await Device.create({
                        userId: user._id,
                        deviceName: `${type} ${rInt(100, 999)}`,
                        deviceType: type,
                        serialNumber: `GT-${rInt(1000, 9999)}-${String.fromCharCode(65 + j)}`,
                        status: status,
                        sensors: {
                            temperature: isHealthy ? r(20, 26) : r(30, 40),
                            humidity: isHealthy ? r(50, 70) : r(20, 40),
                            ph: isHealthy ? r(5.5, 6.5) : r(4, 9),
                            ec: isHealthy ? r(1.2, 2.0) : r(0.5, 3.0),
                            waterLevel: isHealthy ? r(60, 90) : r(10, 20),
                            lightIntensity: isHealthy ? rInt(10000, 15000) : 0
                        },
                        location: {
                            lat: lat,
                            lng: lng,
                            address: loc.addr
                        }
                    });

                    createdDevices.push(device);

                    // Create 24 hours of sensor history (1 reading per hour)
                    for (let h = 0; h < 24; h++) {
                        const timestamp = new Date(Date.now() - h * 60 * 60 * 1000);
                        await SensorReading.create({
                            deviceId: device._id,
                            timestamp: timestamp,
                            temperature: isHealthy ? r(20, 26) : r(30, 40),
                            humidity: isHealthy ? r(50, 70) : r(20, 40),
                            ph: isHealthy ? r(5.5, 6.5) : r(4, 9),
                            ec: isHealthy ? r(1.2, 2.0) : r(0.5, 3.0),
                            waterLevel: isHealthy ? r(60, 90) : r(10, 20),
                            lightIntensity: isHealthy ? rInt(10000, 15000) : 0
                        });
                    }
                }
            } else {
                usersWithoutDevices++;
            }
        }

        console.log(`✅ Seeded ${usersCount} users total`);
        console.log(`   - ${usersWithDevices} users WITH devices`);
        console.log(`   - ${usersWithoutDevices} users WITHOUT devices`);
        console.log(`✅ Created ${createdDevices.length} devices with 24h sensor history.`);

        // 3. Create Tickets
        let ticketCount = 0;
        for (const user of createdUsers) {
            if (Math.random() > 0.4) {
                const numTickets = rInt(1, 3);
                for (let i = 0; i < numTickets; i++) {
                    const template = issueTemplates[rInt(0, issueTemplates.length - 1)];
                    const statusRoll = Math.random();
                    let status = 'Open';
                    if (statusRoll > 0.5) status = 'Pending';
                    if (statusRoll > 0.7) status = 'Resolved';

                    await Ticket.create({
                        userId: user._id,
                        title: template.title,
                        description: template.desc,
                        status: status,
                        priority: ['Low', 'Medium', 'High', 'Critical'][rInt(0, 3)]
                    });
                    ticketCount++;
                }
            }
        }

        console.log(`✅ Seeded ${ticketCount} support tickets.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
