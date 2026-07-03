const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Payroll = require("../models/Payroll");
const Leave = require("../models/Leave");
const authMiddleware = require("../middleware/authMiddleware");

// Employee Master Report
router.get(
  "/employee-master",
  authMiddleware(["Admin", "HR"]),
  async (req, res) => {
    try {
      const employees = await Employee.find().select("-password");
      res.json(employees);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error generating employee master report" });
    }
  }
);

// Attendance Summary Report
router.get(
  "/attendance-summary",
  authMiddleware(["Admin", "HR"]),
  async (req, res) => {
    try {
      const { month, year } = req.query;
      const matchStage = {};
      if (month) matchStage.month = parseInt(month);
      if (year) matchStage.year = parseInt(year);

      const summary = await Attendance.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Error generating attendance summary" });
    }
  }
);

// Payroll Summary Report
router.get(
  "/payroll-summary",
  authMiddleware(["Admin", "HR"]),
  async (req, res) => {
    try {
      const { month } = req.query;
      const matchStage = {};
      if (month) matchStage.month = month;

      const summary = await Payroll.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPayroll: { $sum: "$netSalary" },
            averageSalary: { $avg: "$netSalary" },
            count: { $sum: 1 },
          },
        },
      ]);
      res.json(summary[0] || {});
    } catch (error) {
      res.status(500).json({ message: "Error generating payroll summary" });
    }
  }
);

// Leave History Report
router.get(
  "/leave-history",
  authMiddleware(["Admin", "HR"]),
  async (req, res) => {
    try {
      const { status } = req.query;
      const matchStage = {};
      if (status) matchStage.status = status;

      const leaves = await Leave.find(matchStage).populate(
        "employee",
        "fullName employeeID department"
      );
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ message: "Error generating leave history" });
    }
  }
);

module.exports = router;
