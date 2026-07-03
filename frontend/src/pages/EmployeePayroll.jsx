import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EmployeePayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const decoded = jwtDecode(token);
        const employeeId = decoded.id;

        const response = await axios.get(
          `http://localhost:5000/api/payroll/employee/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPayrolls(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching payroll data"
        );
        console.error("Error fetching payrolls:", err);
        setLoading(false);
      }
    };

    fetchPayrolls();
  }, [navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert
          severity="error"
          sx={{
            fontSize: "1.1rem",
            "& .MuiAlert-icon": {
              fontSize: "2rem",
            },
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const getHealthPlanColor = (plan) => {
    switch (plan) {
      case "Gold":
        return "warning";
      case "Premium":
        return "info";
      default:
        return "success";
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: 4,
          px: 2,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/employee-dashboard")} // Changed from "/employee/dashboard" to "/dashboard"
            sx={{
              mb: 2,
              "&:hover": {
                backgroundColor: "primary.light",
                color: "white",
              },
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "primary.main",
            textAlign: "center",
            mb: 4,
          }}
        >
          Employee Payroll Details
        </Typography>

        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            "& .MuiTable-root": {
              minWidth: 1000,
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  }}
                >
                  Employee ID
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  }}
                >
                  Month
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  }}
                >
                  Basic Salary
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  }}
                >
                  Allowances
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  }}
                >
                  Deductions
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  }}
                >
                  Health Plan
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  }}
                >
                  Health Plan Deduction
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem",
                    py: 2,
                  }}
                >
                  Net Salary
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payrolls.length > 0 ? (
                payrolls.map((payroll) => (
                  <TableRow
                    key={payroll._id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell sx={{ fontSize: "0.95rem" }}>
                      {payroll.employeeId}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.95rem" }}>
                      {new Date().toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.95rem" }}>
                      ₹{payroll.basicSalary?.toLocaleString()}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.95rem", color: "success.main" }}
                    >
                      ₹{payroll.allowances?.toLocaleString()}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.95rem", color: "error.main" }}
                    >
                      ₹{payroll.deductions?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Gold"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.95rem", color: "error.main" }}
                    >
                      ₹{payroll.insuranceDeduction?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: "primary.main",
                          fontWeight: 700,
                          fontSize: "1rem",
                          backgroundColor: "primary.lighter",
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-block",
                        }}
                      >
                        ₹{payroll.netSalary?.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      py: 4,
                      fontSize: "1rem",
                      color: "text.secondary",
                    }}
                  >
                    No payroll data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default EmployeePayroll;
