const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const router = express.Router();

// ✅ Login Route (Admin + Employee)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔐 Login attempt with email:", email);

    let user = await User.findOne({ email });
    let role = null;

    if (user) {
      // ✅ Found in User collection
      console.log(
        "✅ Found in User collection:",
        user.email,
        "| Role:",
        user.role
      );

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Incorrect password for:", email);
        return res.status(400).json({ message: "Invalid email or password" });
      }

      role = user.role;
    } else {
      // ✅ Not in User → Check Employee collection
      const employee = await Employee.findOne({ email });

      if (!employee) {
        console.log("❌ User not found in both User and Employee collections");
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) {
        console.log("❌ Incorrect password for employee:", email);
        return res.status(400).json({ message: "Invalid email or password" });
      }

      user = employee;
      role = "Employee";
      console.log("✅ Found in Employee collection:", employee.email);
    }

    // Prepare user name safely
    const userName = user.name || user.fullName || "Unnamed User";

    // Generate the JWT token
    const token = jwt.sign(
      { id: user._id, role, name: userName },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    console.log("✅ Login successful for:", email, "| Role:", role);
    res.json({
      token,
      role,
      name: userName,
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Token Refresh Route
router.post("/refresh", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // Verify token while ignoring expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    // Check user exists in either User or Employee collection
    let user =
      (await User.findById(decoded.id)) ||
      (await Employee.findById(decoded.id));

    if (!user) {
      console.log("❌ User not found during token refresh");
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role || "Employee",
        name: user.name || user.fullName || "Unnamed User",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Token refreshed for user:", user.email || user._id);
    res.json({ token: newToken });
  } catch (error) {
    console.error("❌ Token refresh error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
