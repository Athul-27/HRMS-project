const mongoose = require("mongoose");
require("dotenv").config(); // Ensure dotenv is loaded

const connectDB = async () => {
  try {
    console.log("⏳ Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000, // Increased timeout for server selection
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1); // Stop server if DB connection fails
  }
};

module.exports = connectDB;
