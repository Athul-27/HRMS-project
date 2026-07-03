import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { Download } from "@mui/icons-material";

export default function EmployeeMasterReport() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/reports/employee-master",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employee master data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredEmployees.map((emp) => ({
        "Employee ID": emp.employeeID,
        "Full Name": emp.fullName,
        Department: emp.department,
        Designation: emp.designation,
        "Join Date": new Date(emp.dateOfJoining).toLocaleDateString(),
        Status: emp.employmentStatus,
        Email: emp.email,
        Phone: emp.phoneNumber,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Master");
    XLSX.writeFile(
      workbook,
      `Employee_Master_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Employee Master Report</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      <TextField
        label="Search Employees"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#025b4d" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>ID</TableCell>
              <TableCell sx={{ color: "white" }}>Full Name</TableCell>
              <TableCell sx={{ color: "white" }}>Department</TableCell>
              <TableCell sx={{ color: "white" }}>Designation</TableCell>
              <TableCell sx={{ color: "white" }}>Join Date</TableCell>
              <TableCell sx={{ color: "white" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp._id}>
                <TableCell>{emp.employeeID}</TableCell>
                <TableCell>{emp.fullName}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>{emp.designation}</TableCell>
                <TableCell>
                  {new Date(emp.dateOfJoining).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      color:
                        emp.employmentStatus === "Active" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {emp.employmentStatus}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
