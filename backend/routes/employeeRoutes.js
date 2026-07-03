const express = require("express");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

const validPlans = ["None", "Basic", "Premium", "Gold"];
const validateHealthInsurancePlan = (plan) => validPlans.includes(plan);

const validateRequiredFields = (data, requiredFields) => {
  for (let field of requiredFields) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  return null;
};

// Route to get all employees
router.get("/", authMiddleware(["Admin", "HR"]), async (req, res) => {
  try {
    console.log("Fetching employees..."); // Debug log
    const employees = await Employee.find().select("-password");
    console.log("Employees found:", employees.length); // Debug log
    if (employees.length === 0) {
      console.log("No employees found in database"); // Debug log
    }
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Error fetching employees" });
  }
});

router.post("/add", authMiddleware(["Admin", "HR"]), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      department,
      designation,
      dateOfJoining,
      basicSalary,
      allowances,
      deductions,
      password,
      healthInsurancePlan,
    } = req.body;

    const missingField = validateRequiredFields(req.body, [
      "fullName",
      "email",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "department",
      "designation",
      "dateOfJoining",
      "basicSalary",
      "password",
    ]);

    if (missingField) {
      return res
        .status(400)
        .json({ message: `${missingField} must be filled` });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    if (
      healthInsurancePlan &&
      !validateHealthInsurancePlan(healthInsurancePlan)
    ) {
      return res.status(400).json({ message: "Invalid health insurance plan" });
    }


    const newEmployee = new Employee({
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      department,
      designation,
      dateOfJoining,
      basicSalary,
      allowances,
      deductions,
      password,
      healthInsurancePlan: healthInsurancePlan || "None",
      role: "Employee",
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee added successfully!" });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ message: "Error adding employee" });
  }
});

// Route to get employee by ID
router.get(
  "/:id",
  authMiddleware(["Admin", "HR", "Employee"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Add validation for MongoDB ObjectId
      if (!id || id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      const employee = await Employee.findById(id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Error fetching employee details" });
    }
  }
);

// Route for admin/HR to update employee
// Update employee route
// router.put("/:id", authMiddleware(["Admin", "HR"]), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Admin can update any field
//     if (req.user.role !== "Admin") {
//       // Restrict fields for non-Admin roles
//       delete updateData.role;
//       delete updateData.salary;
//     }

//     const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     if (!updatedEmployee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     res.json(updatedEmployee);
//   } catch (error) {
//     console.error("Error updating employee:", error);
//     res.status(500).json({ message: "Error updating employee" });
//   }
// });

router.put("/update/:id", authMiddleware(["Admin", "HR"]), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (
      updateData.healthInsurancePlan &&
      !validateHealthInsurancePlan(updateData.healthInsurancePlan)
    ) {
      return res.status(400).json({ message: "Invalid health insurance plan" });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully!", updatedEmployee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Error updating employee" });
  }
});

// Route for employee self-update
router.put("/:id", authMiddleware(["Employee"]), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify if the employee is updating their own profile
    if (req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    const updateData = {
      fullName: req.body.fullName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
    };

    // Email validation
    if (updateData.email) {
      const existingEmployee = await Employee.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingEmployee) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Phone validation
    if (updateData.phoneNumber && !/^\d{10}$/.test(updateData.phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error updating employee profile" });
  }
});

// Route for deleting employee
router.delete(
  "/delete/:id",
  authMiddleware(["Admin", "HR"]),
  async (req, res) => {
    try {
      const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
      if (!deletedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ message: "Employee deleted successfully!" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Error deleting employee" });
    }
  }
);

// Test route for debugging
router.get("/test", (req, res) => {
  console.log("Test route hit"); // Debug log
  res.json({ message: "Employee routes are working!" });
});

module.exports = router;
