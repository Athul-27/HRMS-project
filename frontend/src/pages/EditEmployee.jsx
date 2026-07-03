import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    healthInsurancePlan: "None", // Default value
    password: "",
    confirmPassword: "",
    experience: "", // Added experience field
  });
  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [dobError, setDobError] = useState(""); // DOB validation error

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You must be logged in to edit an employee.");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/employees/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Format dates to YYYY-MM-DD
        const formattedDateOfBirth = new Date(response.data.dateOfBirth)
          .toISOString()
          .split("T")[0];
        const formattedDateOfJoining = new Date(response.data.dateOfJoining)
          .toISOString()
          .split("T")[0];

        setFormData({
          ...response.data,
          dateOfBirth: formattedDateOfBirth,
          dateOfJoining: formattedDateOfJoining,
        });
        setLoading(false);
      } catch (error) {
        setError("Error fetching employee data");
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate Date of Birth
    if (name === "dateOfBirth" && new Date(value) > new Date()) {
      setDobError("Date of Birth cannot be a future date.");
    } else {
      setDobError("");
    }

    // Validate password and confirm password match
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

    // If password is unchanged, exclude it from the data
    const { confirmPassword, ...dataToSend } = formData;
    if (formData.password === "") {
      delete dataToSend.password; // Do not include password if not changed
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordMatchError("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to edit an employee.");
        return;
      }

      // Ensure healthInsurancePlan is included in the update
      dataToSend.healthInsurancePlan = formData.healthInsurancePlan;

      const response = await axios.put(
        `http://localhost:5000/api/employees/update/${id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Employee updated successfully!");
      setTimeout(() => navigate("/admin-dashboard/employees"), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Error updating employee");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wrapper">
      <div className="form-container">
        <h1 className="main-heading">Edit Employee</h1>
        {error && <p className="error">{error}</p>}
        {passwordMatchError && <p className="error">{passwordMatchError}</p>}
        {dobError && <p className="error">{dobError}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="form">
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
              {dobError && <p className="error">{dobError}</p>}
            </div>
          </div>

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

          <div className="input-row">
            <div className="input-group">
              <label className="label">Health Insurance Plan</label>
              <select
                name="healthInsurancePlan"
                value={formData.healthInsurancePlan}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="" disabled>
                  Select Insurance Plan
                </option>
                <option value="None">None</option>
                <option value="Basic">Basic</option>
                <option value="Gold">Gold</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="input-group">
              <label className="label">Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="input-row">
            <div className="input-group">
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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
                className="input"
              />
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
                dobError
              }
            >
              Update Employee
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

export default EditEmployee;
