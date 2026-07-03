const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');

const router = express.Router();

// ✅ Get Admin Dashboard Stats
router.get('/stats', authMiddleware(['Admin']), async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments({ role: 'Employee' });
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const totalPayroll = await Payroll.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

        res.json({
            totalEmployees,
            pendingLeaves,
            totalPayroll: totalPayroll.length > 0 ? totalPayroll[0].total : 0
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard stats", error });
    }
});

module.exports = router;
