import React, { useState } from "react";
import axios from "axios";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    department: "",
    designation: "",
    dateOfJoining: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    password: "",
    confirmPassword: "",
    healthInsurancePlan: "None",
    insuranceDeductionAmount: 0,
    experience: "", // Added experience field
  });

  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-calculate insurance deduction
    if (name === "healthInsurancePlan") {
      let deduction = 0;
      if (value === "Basic") deduction = 500;
      else if (value === "Premium") deduction = 1000;
      else if (value === "Gold") deduction = 2000;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        insuranceDeductionAmount: deduction,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password" || name === "confirmPassword") {
      if (name === "confirmPassword" && formData.password !== value) {
        setPasswordMatchError("Passwords do not match!");
      } else {
        setPasswordMatchError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordMatchError("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to add an employee.");
        return;
      }

      const { confirmPassword, ...dataToSend } = formData;

      const response = await axios.post(
        "http://localhost:5000/api/employees/add",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Employee added successfully!");
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        department: "",
        designation: "",
        dateOfJoining: "",
        basicSalary: "",
        allowances: "",
        deductions: "",
        password: "",
        confirmPassword: "",
        healthInsurancePlan: "None",
        insuranceDeductionAmount: 0,
        experience: "", // Reset experience field
      });
    } catch (error) {
      setError(error.response?.data?.message || "Error adding employee");
    }
  };

  return (
    <div className="wrapper">
      <div className="form-container">
        <h1 className="main-heading">Add Employee</h1>
        {error && <p className="error">{error}</p>}
        {passwordMatchError && <p className="error">{passwordMatchError}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="form">
          {/* Personal Info */}
          <div className="input-row">
            <div className="input-group">
              <label className="label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="input-group">
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="label">Phone Number</label>
              <input
                type="number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="input-group">
              <label className="label">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="label">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label className="label">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>

          {/* Job Info */}
          <div className="input-row">
            <div className="input-group">
              <label className="label">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="" disabled>
                  Select Department
                </option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div className="input-group">
              <label className="label">Designation</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="" disabled>
                  Select Designation
                </option>
                <option value="Team Lead">Team Lead</option>
                <option value="Developer">Developer</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="label">Date of Joining</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="input-group">
              <label className="label">Basic Salary</label>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label className="label">Allowances</label>
              <input
                type="number"
                name="allowances"
                value={formData.allowances}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="input-group">
              <label className="label">Deductions</label>
              <input
                type="number"
                name="deductions"
                value={formData.deductions}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Security */}
          <div className="input-row">
            <div className="input-group">
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div className="input-group">
              <label className="label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="input-row">
            <div className="input-group">
              <label className="label">Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* Insurance */}
            <div className="input-group">
              <label className="label">Health Insurance Plan</label>
              <select
                name="healthInsurancePlan"
                value={formData.healthInsurancePlan}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="None">None</option>
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Gold">Gold</option>
              </select>
              {formData.healthInsurancePlan !== "None" && (
                <small style={{ color: "#025b4d", marginTop: "5px" }}>
                  Selected plan <strong>{formData.healthInsurancePlan}</strong>{" "}
                  will deduct ₹{formData.insuranceDeductionAmount} from salary.
                </small>
              )}
            </div>
          </div>

          <div className="button-container">
            <button
              type="submit"
              className="button"
              disabled={
                passwordMatchError ||
                !formData.fullName ||
                !formData.email ||
                !formData.phoneNumber ||
                !formData.basicSalary ||
                !formData.experience // Added validation for experience
              }
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        /* ===== Global Styles ===== */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
        }

        /* ===== Component Styles ===== */
        .wrapper {
          min-height: 100vh;
          width: 100vw;
          background: url("/your/background.jpg") no-repeat center center/cover;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .form-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 15px;
          width: 90%;
          max-width: 1000px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
          color: #fff;
        }

        .main-heading {
          color: #025b4d;
          font-size: 32px;
          text-align: center;
          margin-bottom: 30px;
        }

        .error {
          color: red;
          text-align: center;
          margin-bottom: 10px;
        }

        .success {
          color: green;
          text-align: center;
          margin-bottom: 10px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: space-between;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 280px;
        }

        .label {
          margin-bottom: 6px;
          color: #000;
          font-weight: bold;
        }

        .input {
          padding: 12px;
          border-radius: 7px;
          border: 2px solid #000;
          background-color: rgba(255, 255, 255, 0.2);
          color: #000;
          font-size: 16px;
        }

        .button-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .button {
          background-color: #025b4d;
          color: #fff;
          padding: 12px 30px;
          border: none;
          border-radius: 7px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AddEmployee;
