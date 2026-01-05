// Migration script to assign userNumbers to existing users
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const assignUserNumbers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Get all users sorted by createdAt (oldest first)
        const users = await User.find({}).sort({ createdAt: 1 });

        console.log(`Found ${users.length} users`);

        // Assign userNumbers sequentially
        for (let i = 0; i < users.length; i++) {
            await User.updateOne(
                { _id: users[i]._id },
                { $set: { userNumber: i + 1 } }
            );
            console.log(`Assigned userNumber ${i + 1} to ${users[i].name}`);
        }

        console.log('✅ Migration complete!');
        console.log(`Newest user: ${users[users.length - 1].name} (userNumber: ${users.length})`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

assignUserNumbers();
