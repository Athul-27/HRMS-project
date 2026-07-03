const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EmployeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    employeeID: { type: String, unique: true },
    email: { type: String, unique: true, required: true },
    phoneNumber: {
      type: String,
      required: true,
      match: /^[0-9]{10,15}$/, // Example regex for phone number
    },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    address: { type: String, required: false },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    experience: { type: Number, default: 0 },
    employmentStatus: {
      type: String,
      enum: ["Active", "Resigned", "Terminated"],
      default: "Active",
    },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    insuranceDeductionAmount: { type: Number, default: 0 },
    totalLeaveBalance: { type: Number, default: 30 },
    leaveTaken: { type: Number, default: 0 },
    leaveRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Leave" }],
    maternityLeaveEligible: { type: Boolean, default: false },
    healthInsurancePlan: {
      type: String,
      enum: ["None", "Basic", "Premium", "Gold"],
      default: "None",
      required: true,
    },
    role: { type: String, default: "Employee" },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Pre-save hook to hash the password before saving an employee
EmployeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Auto-generate employee ID for new employees (only if not provided)
EmployeeSchema.pre("save", async function (next) {
  if (!this.employeeID) {
    try {
      const count = await mongoose.model("Employee").countDocuments();
      this.employeeID = `EMP${(count + 1).toString().padStart(4, "0")}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Auto-calculate fields (experience, maternity eligibility, and netSalary)
EmployeeSchema.pre("save", function (next) {
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  const experienceDuration =
    Date.now() - new Date(this.dateOfJoining).getTime();
  this.experience = Math.floor(experienceDuration / oneYear);
  this.maternityLeaveEligible = 
    this.gender === "Female" && this.experience >= 1;

  // Dynamically calculate netSalary
  this.netSalary =
    this.basicSalary +
    this.allowances -
    this.deductions -
    this.insuranceDeductionAmount;
  next();
});

// Method to compare the entered password with the hashed password
EmployeeSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  if (!isMatch) throw new Error("Password is incorrect");
  return true;
};

// Static method to update employee password if provided (or leave unchanged)
EmployeeSchema.statics.updatePassword = async function (
  employeeId,
  newPassword
) {
  const employee = await this.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  if (newPassword) {
    const salt = await bcrypt.genSalt(10);
    employee.password = await bcrypt.hash(newPassword, salt); // Hash new password
  }

  return employee.save();
};

module.exports = mongoose.model("Employee", EmployeeSchema);
