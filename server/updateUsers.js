import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

async function updateUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to DB');

        const result = await User.updateMany(
            { credits: { $exists: false } },
            { $set: { credits: 5000 } }
        );

        console.log('Updated users:', result.modifiedCount);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateUsers();