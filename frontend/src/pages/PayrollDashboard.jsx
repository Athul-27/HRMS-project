import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token (fetch):", token); // Debugging the token here
        const response = await axios.get(
          "http://localhost:5000/api/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setOpenEditModal(true);
  };

  const handleSave = async () => {
    try {
      let token = localStorage.getItem("token");

      // First attempt with current token
      try {
        await axios.put(
          `http://localhost:5000/api/employees/${selectedEmployee._id}`,
          selectedEmployee,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        if (error.response?.status === 401) {
          // Token expired, attempt to refresh
          const refreshResponse = await axios.post(
            "http://localhost:5000/api/auth/refresh",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          token = refreshResponse.data.token;
          localStorage.setItem("token", token);

          // Retry with new token
          await axios.put(
            `http://localhost:5000/api/employees/${selectedEmployee._id}`,
            selectedEmployee,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          throw error;
        }
      }

      setOpenEditModal(false);
      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const calculateInsuranceDeduction = (healthInsurancePlan) => {
    switch (healthInsurancePlan) {
      case "None":
        return 0;
      case "Basic":
        return 500;
      case "Gold":
        return 1000;
      case "Premium":
        return 2000;
      default:
        return 0;
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        margin: "20px auto",
        maxWidth: "95%",
        overflow: "auto",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#025b4d" }}>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
              Employee
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
              Basic Salary
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
              Allowances
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
              Deductions
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
              Health Insurance
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
              Insurance Deduction
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
              Net Salary
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => {
            const insuranceDeduction = calculateInsuranceDeduction(
              employee.healthInsurancePlan
            );
            const netSalary =
              employee.basicSalary +
              employee.allowances -
              employee.deductions -
              insuranceDeduction;

            return (
              <TableRow
                key={employee._id}
                sx={{
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  "&:nth-of-type(even)": { backgroundColor: "#fafafa" },
                }}
              >
                <TableCell sx={{ fontSize: "0.95rem" }}>
                  {employee.fullName}
                </TableCell>
                <TableCell sx={{ fontSize: "0.95rem" }}>
                  {employee.basicSalary}
                </TableCell>
                <TableCell sx={{ fontSize: "0.95rem" }}>
                  {employee.allowances}
                </TableCell>
                <TableCell sx={{ fontSize: "0.95rem" }}>
                  {employee.deductions}
                </TableCell>
                <TableCell sx={{ fontSize: "0.95rem" }}>
                  {employee.healthInsurancePlan}
                </TableCell>
                <TableCell sx={{ fontSize: "0.95rem" }}>
                  {insuranceDeduction}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                  {netSalary}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#025b4d",
                      "&:hover": { backgroundColor: "#024a3d" },
                      fontSize: "0.875rem",
                      padding: "6px 12px",
                    }}
                    onClick={() => handleEditClick(employee)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <DialogTitle
          sx={{
            backgroundColor: "#025b4d",
            color: "white",
            fontSize: "1.25rem",
            fontWeight: "bold",
          }}
        >
          Edit Payroll Details
        </DialogTitle>
        <DialogContent sx={{ paddingTop: 3 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Basic Salary"
            value={selectedEmployee?.basicSalary || ""}
            onChange={(e) =>
              setSelectedEmployee({
                ...selectedEmployee,
                basicSalary: e.target.value,
              })
            }
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Allowances"
            value={selectedEmployee?.allowances || ""}
            onChange={(e) =>
              setSelectedEmployee({
                ...selectedEmployee,
                allowances: e.target.value,
              })
            }
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Deductions"
            value={selectedEmployee?.deductions || ""}
            onChange={(e) =>
              setSelectedEmployee({
                ...selectedEmployee,
                deductions: e.target.value,
              })
            }
            sx={{ marginBottom: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditModal(false)}
            sx={{
              color: "#025b4d",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            sx={{
              backgroundColor: "#025b4d",
              color: "white",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#024a3d" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default Payroll;
