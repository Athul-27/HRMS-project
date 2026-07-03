const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find the user from the User collection
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Prepare user info
    let userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 4. If Employee, fetch employee details like employeeID
    if (user.role === "Employee") {
      const employee = await Employee.findOne({ email });
      if (employee) {
        userInfo.employeeID = employee.employeeID; // Add employeeID to user info
      } else {
        console.warn(`Employee not found for user: ${email}`);
      }
    }

    // 5. Generate JWT with userInfo (including employeeID if Employee)
    const token = jwt.sign(userInfo, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expiry time (1 hour)
    });

    // Send token and user info
    res.json({ token, user: userInfo });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };
