const express = require("express");
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/authMiddleware");
const { body, param } = require("express-validator");

// Temporary validateRequest middleware
const validateRequest = (req, res, next) => {
  console.log("Using temporary validateRequest middleware");
  next();
};

const router = express.Router();

const validatePayrollInput = [
  body("employeeId").isMongoId().withMessage("Invalid employee ID"),
  body("salary")
    .isFloat({ min: 0 })
    .withMessage("Salary must be a positive number"),
  body("bonus").optional().isFloat({ min: 0 }),
  body("deductions").optional().isFloat({ min: 0 }),
  validateRequest,
];

const calculateInsuranceDeduction = (plan) => {
  switch (plan) {
    case "Basic":
      return 500;
    case "Premium":
      return 2000;
    case "Gold":
      return 1000;
    default:
      return 0;
  }
};

router.get("/test", (req, res) => {
  res.send("✅ Payroll route is working!");
});

router.get("/stats", authMiddleware(["Admin", "HR"]), async (req, res) => {
  try {
    const stats = await Payroll.aggregate([
      {
        $group: {
          _id: null,
          totalPayroll: { $sum: "$netSalary" },
          averageSalary: { $avg: "$netSalary" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(stats[0] || {});
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error fetching payroll stats:`,
      error
    );
    res.status(500).json({
      message: "Error fetching payroll stats",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/", authMiddleware(["Admin", "HR"]), async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate(
      "employee",
      "fullName email role"
    );
    res.json(payrolls);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error fetching payroll data:`,
      error
    );
    res.status(500).json({
      message: "Error fetching payroll data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get(
  "/employee/:id",
  authMiddleware(["Admin", "HR", "Employee"]),
  [param("id").isMongoId().withMessage("Invalid employee ID"), validateRequest],
  async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const insuranceDeduction = calculateInsuranceDeduction(
        employee.healthInsurancePlan
      );

      const payrollData = [
        {
          _id: employee._id,
          employeeId: employee.employeeID,
          basicSalary: employee.basicSalary,
          allowances: employee.allowances,
          deductions: employee.deductions,
          insuranceDeduction: insuranceDeduction,
          netSalary:
            employee.basicSalary +
            (employee.allowances || 0) -
            (employee.deductions || 0) -
            insuranceDeduction,
        },
      ];

      res.json(payrollData);
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error fetching employee payroll:`,
        error
      );
      res.status(500).json({
        message: "Error fetching payroll data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

router.get(
  "/month/:month",
  authMiddleware(["Admin", "HR"]),
  [
    param("month")
      .matches(/^\d{4}-\d{2}$/)
      .withMessage("Invalid month format (YYYY-MM)")
      .custom((value) => {
        const [year, month] = value.split("-");
        const date = new Date(year, month - 1);
        return date.getFullYear() == year && date.getMonth() + 1 == month;
      })
      .withMessage("Invalid month value"),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const payrolls = await Payroll.find({ month: req.params.month });
      if (!payrolls.length)
        return res
          .status(404)
          .json({ message: "No payroll data found for this month" });
      res.json(payrolls);
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error fetching monthly payroll:`,
        error
      );
      res.status(500).json({
        message: "Error fetching payroll data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

router.post(
  "/process",
  authMiddleware(["Admin", "HR"]),
  validatePayrollInput,
  async (req, res) => {
    try {
      const { employeeId, salary, bonus, deductions } = req.body;
      const currentMonth = new Date().toISOString().slice(0, 7);

      const existingPayroll = await Payroll.findOne({
        employee: employeeId,
        month: currentMonth,
      });
      if (existingPayroll) {
        return res.status(400).json({
          message: "Payroll already processed for this employee this month",
        });
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const insuranceDeduction = calculateInsuranceDeduction(
        employee.healthInsurancePlan
      );

      const netSalary =
        Number(salary) +
        Number(bonus || 0) -
        Number(deductions || 0) -
        insuranceDeduction;

      const payroll = new Payroll({
        employee: employeeId,
        salary,
        bonus: bonus || 0,
        deductions: deductions || 0,
        insuranceDeduction,
        netSalary,
        processedBy: req.user.id,
        processedDate: new Date(),
        month: currentMonth,
      });

      await payroll.save();
      res.status(201).json({
        message: "Payroll processed successfully",
        payroll,
      });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Payroll processing error:`,
        error
      );
      res.status(500).json({
        message: "Payroll processing failed",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

router.put(
  "/update/:id",
  authMiddleware(["Admin", "HR"]),
  [param("id").isMongoId().withMessage("Invalid payroll ID"), validateRequest],
  async (req, res) => {
    try {
      const { bonuses, deductions } = req.body;
      const payroll = await Payroll.findById(req.params.id);
      if (!payroll)
        return res.status(404).json({ message: "Payroll not found" });

      const employeeDetails = await Employee.findById(payroll.employee);
      if (!employeeDetails)
        return res.status(404).json({ message: "Employee not found" });

      const insuranceDeduction = calculateInsuranceDeduction(
        employeeDetails.healthInsurancePlan
      );

      const netSalary =
        employeeDetails.basicSalary +
        (bonuses || payroll.bonuses) -
        (deductions || payroll.deductions) -
        insuranceDeduction;

      const updatedPayroll = await Payroll.findByIdAndUpdate(
        req.params.id,
        {
          bonuses,
          deductions,
          insuranceDeduction,
          netSalary,
        },
        { new: true }
      );

      res.json({ message: "Payroll updated successfully", updatedPayroll });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error updating payroll:`,
        error
      );
      res.status(500).json({
        message: "Error updating payroll",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

router.delete(
  "/delete/:id",
  authMiddleware(["Admin"]),
  [param("id").isMongoId().withMessage("Invalid payroll ID"), validateRequest],
  async (req, res) => {
    try {
      await Payroll.findByIdAndDelete(req.params.id);
      res.json({ message: "Payroll deleted successfully" });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error deleting payroll:`,
        error
      );
      res.status(500).json({
        message: "Error deleting payroll",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

router.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Payroll route error:`, err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

module.exports = router;
