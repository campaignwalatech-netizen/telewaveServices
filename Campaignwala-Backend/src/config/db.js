const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        // Graceful shutdown
        process.exit(1);
    }
};

module.exports = connectDB;