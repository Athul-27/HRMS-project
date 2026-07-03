const express = require("express");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Apply for Leave (Includes Maternity Leave & Date Validation)

// ... existing code ...
router.post("/apply", authMiddleware(["Employee"]), async (req, res) => {
  try {
    const { startDate, endDate, reason, leaveType } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !reason || !leaveType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const employeeId = req.user.id;

    // Validate employee ID
    if (!employeeId) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after the start date" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Validate leave type
    const validLeaveTypes = [
      "Annual Leave",
      "Sick Leave",
      "Personal Leave",
      "Emergency Leave",
      "Maternity Leave",
    ];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

    // Check leave balance for non-maternity leaves
    if (leaveType !== "Maternity Leave") {
      const leaveDays =
        Math.ceil(
          (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
        ) + 1;
      if (employee.totalLeaveBalance < leaveDays) {
        return res.status(400).json({
          message: `Insufficient leave balance. You have ${employee.totalLeaveBalance} days remaining.`,
        });
      }
    }

    const newLeave = new Leave({
      employee: employeeId,
      startDate,
      endDate,
      reason,
      leaveType,
      status: "Pending",
    });

    await newLeave.save();

    // Update employee's leave requests
    employee.leaveRequests.push(newLeave._id);
    await employee.save();

    res.status(201).json({
      message: "Leave request submitted successfully",
      leave: newLeave,
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({
      message: "Failed to submit leave request",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// ✅ Fetch All Leave Requests (For HR/Admin)
// Add this route to fetch all leave requests (for admin)
// ... existing code ...
router.get("/all", authMiddleware(["Admin", "HR"]), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate("employee", "fullName department email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Leave.countDocuments(query);

    res.json({
      leaves,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalLeaves: count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching leave requests",
      error: error.message,
    });
  }
});
// ... existing code ...

// ✅ Approve or Reject Leave Request (Auto-Update Leave Balance)
// ... existing code ...
router.put("/update/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: false }
    );
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }
    res.json({ message: "Leave status updated", leave });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating leave status", error: error.message });
  }
});
// ... existing code ...
// ... existing code ...

// ✅ Fetch Leave Requests for Logged-in Employee
router.get("/my-leaves", authMiddleware(["Employee"]), async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Add validation for employeeId
    if (!employeeId) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    // Check if employee exists
    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const myLeaves = await Leave.find({ employee: employeeId });

    // Check if leaves exist
    if (!myLeaves || myLeaves.length === 0) {
      return res
        .status(404)
        .json({ message: "No leave requests found for this employee" });
    }

    res.json(myLeaves);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({
      message: "Error fetching your leave requests",
      error: error.message,
    });
  }
});
// ... existing code ...
module.exports = router;
