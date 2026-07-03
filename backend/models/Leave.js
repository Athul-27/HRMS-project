const mongoose = require("mongoose");
const Employee = require("./Employee");

const LeaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: "Start date cannot be in the past",
      },
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    reason: {
      type: String,
      required: true,
      minlength: [10, "Reason must be at least 10 characters long"],
    },
    leaveType: {
      type: String,
      enum: [
        "Sick Leave",
        "Casual Leave",
        "Annual Leave",
        "Maternity Leave",
        "Emergency Leave",
        "Personal Leave",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate leave duration as virtual property
LeaveSchema.virtual("duration").get(function () {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
});

LeaveSchema.pre("save", async function (next) {
  try {
    const employee = await Employee.findById(this.employee);
    if (!employee) throw new Error("Employee not found");

    // Maternity Leave Check
    if (this.leaveType === "Maternity Leave") {
      if (employee.gender !== "Female" || !employee.maternityLeaveEligible) {
        throw new Error(
          "Maternity Leave is only available for eligible female employees with 1+ years of experience."
        );
      }
      // Validate maternity leave duration (84-180 days)
      const duration = this.duration;
      if (duration < 84 || duration > 180) {
        throw new Error("Maternity leave must be between 84 and 180 days");
      }
    }

    // Validate other leave types duration (max 30 days)
    if (this.leaveType !== "Maternity Leave" && this.duration > 30) {
      throw new Error(
        "Leave duration cannot exceed 30 days for this leave type"
      );
    }

    // Check leave balance for non-maternity leaves
    if (
      this.leaveType !== "Maternity Leave" &&
      employee.totalLeaveBalance < this.duration
    ) {
      throw new Error(
        `Insufficient leave balance. You have ${employee.totalLeaveBalance} days remaining.`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Leave", LeaveSchema);
