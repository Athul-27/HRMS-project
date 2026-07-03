import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";

const ProcessPayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [salary, setSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [deductions, setDeductions] = useState("");
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data || !Array.isArray(response.data)) {
          setError("Invalid employee data format");
          return;
        }

        setEmployees(response.data);
      } catch (error) {
        console.error("Employee fetch error:", error);
        setError(
          `Failed to load employees: ${
            error.response?.data?.message || error.message
          }`
        );
      } finally {
        setEmployeeLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/payroll/process",
        { employeeId: selectedEmployee, salary, bonus, deductions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // ... success handling ...
    } catch (error) {
      console.error("Payroll error:", error);
      if (error.code === "ERR_NETWORK") {
        alert(
          "Cannot connect to server. Please check your network connection."
        );
      } else {
        alert(error.response?.data?.message || "Failed to process payroll");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Process Payroll
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            select
            fullWidth
            label="Select Employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            margin="normal"
            required
            disabled={employeeLoading || !!error}
          >
            {employeeLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading employees...
              </MenuItem>
            ) : employees.length > 0 ? (
              [
                <MenuItem key="empty" value="">
                  Select an employee
                </MenuItem>,
                ...employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.fullName || "Unknown"} (ID: {emp.employeeID || "N/A"})
                  </MenuItem>
                )),
              ]
            ) : (
              <MenuItem disabled>No employees available</MenuItem>
            )}
          </TextField>

          <TextField
            fullWidth
            label="Salary"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Bonus"
            type="number"
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Deductions"
            type="number"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || employeeLoading || !selectedEmployee}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Process Payroll"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProcessPayroll;
