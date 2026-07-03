const express = require("express");
const Attendance = require("../models/Attendance");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// ✅ Test Route
router.get("/test", (req, res) => {
  res.send("✅ Attendance route is working!");
});

// ✅ Get All Attendance Records (Admin & HR Only)
router.get("/", authMiddleware(["Admin", "HR"]), async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().populate(
      "employee",
      "name email"
    );
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance", error });
  }
});

// ✅ Employee Check-In (Employee Role)
router.post("/check-in", authMiddleware(["Employee"]), async (req, res) => {
  try {
    const { checkIn } = req.body;
    const employeeId = req.user.id;

    const today = new Date().toISOString().split("T")[0];

    const existingRecord = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });
    if (existingRecord)
      return res
        .status(400)
        .json({ message: "You have already checked in today" });

    const newAttendance = new Attendance({
      employee: employeeId,
      checkIn,
      status: "Present",
    });

    await newAttendance.save();
    res
      .status(201)
      .json({ message: "Check-in successful", attendance: newAttendance });
  } catch (error) {
    res.status(500).json({ message: "Error during check-in", error });
  }
});

// ✅ Employee Check-Out (Employee Role)
// Employee Check-Out (Employee Role)
router.post("/check-out", authMiddleware(["Employee"]), async (req, res) => {
  try {
    const { checkOut } = req.body;
    const employeeId = req.user.id;

    // Get start and end of current day in UTC
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayStart.getUTCDate() + 1);

    const attendanceRecord = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: todayStart,
        $lt: todayEnd,
      },
    });

    if (!attendanceRecord) {
      return res.status(400).json({
        message: "You must clock in before clocking out",
        code: "CHECKIN_REQUIRED",
      });
    }

    if (attendanceRecord.checkOut) {
      return res.status(400).json({
        message: "You have already clocked out today",
        code: "ALREADY_CHECKED_OUT",
      });
    }

    attendanceRecord.checkOut = checkOut;
    await attendanceRecord.save();

    res.json({
      message: "Check-out successful",
      attendance: attendanceRecord,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during check-out",
      error: error.message,
    });
  }
});

// ✅ Get Attendance of Logged-In Employee (Employee Role)
// ... existing imports ...

// ✅ Get Attendance of Logged-In Employee (Employee Role)
router.get("/my-attendance", authMiddleware(["Employee"]), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const employeeId = req.user.id;
    const attendanceRecords = await Attendance.find({ employee: employeeId });
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching your attendance",
      error: error.message,
    });
  }
});

// ... rest of the file remains the same ...

module.exports = router;
