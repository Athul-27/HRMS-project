const express = require("express");
const Payslip = require("../models/Payslip");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware(["Admin", "HR", "Employee"]),
  async (req, res) => {
    try {
      const payslips = await Payslip.find({ employee: req.user.id });
      res.json(payslips);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payslips" });
    }
  }
);

module.exports = router;
