const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        // Read the Mongo URI
        const mongoUriPath = path.join(__dirname, 'mongo_uri.txt');
        if (!fs.existsSync(mongoUriPath)) {
            console.error('❌ mongo_uri.txt not found. Please resolve URI first.');
            process.exit(1);
        }
        const mongoURI = fs.readFileSync(mongoUriPath, 'utf8').trim();

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected.');

        const email = 'ankitsingh12326434@gmail.com';
        const password = 'admin123'; // Default password

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists in new DB. Updating role to admin...');
            user.role = 'admin';
            user.isVerified = true;
            await user.save();
            console.log('✅ User updated to Admin.');
        } else {
            console.log('Creating new Admin user...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name: 'Super Admin',
                email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                phone: '0000000000'
            });

            await user.save();
            console.log('✅ Admin user created successfully.');
        }

        console.log(`\nLogin Credentials:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
