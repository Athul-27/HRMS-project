const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();

const app = express();

// Create a rate limiter for general API usage
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Allow 100 requests per IP in 15 minutes
  message: "Too many requests, please try again later.",
});

// Create a rate limiter specifically for the leave apply route
const leaveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow 5 requests per IP in 15 minutes for leave requests
  message: "Too many leave requests, please try again later.",
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(limiter);

// Database connection with enhanced error handling
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("✅ MongoDB connected successfully");
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const adminRoutes = require("./routes/adminRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const payslipRoutes = require("./routes/payslipRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Route middleware
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payslips", payslipRoutes);
app.use("/api/leave/apply", leaveLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  connectDB(); // Establish DB connection after server starts
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("⚠️ Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
