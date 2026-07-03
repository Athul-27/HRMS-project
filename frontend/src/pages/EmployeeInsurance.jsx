import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const plans = {
  None: {
    color: "default",
    benefits: [
      "₹0 deducted monthly",
      "No coverage",
      "Emergency only",
      "No dependents included",
    ],
  },
  Basic: {
    color: "info",
    benefits: [
      "₹500 deducted monthly",
      "Covers up to ₹50,000/year",
      "Outpatient services",
      "Single room hospitalization",
    ],
  },
  Gold: {
    color: "warning",
    benefits: [
      "₹1000 deducted monthly",
      "Unlimited coverage",
      "International hospitals",
      "Executive health checkups",
      "Family + Dependents fully covered",
    ],
  },
  Premium: {
    color: "success",
    benefits: [
      "₹2000 deducted monthly",
      "Covers up to ₹2,00,000/year",
      "Includes dental & eye care",
      "Family coverage included",
    ],
  },
};

const EmployeeInsurance = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded); // Debug decoded token

        // Get employee ID from token
        const employeeId = decoded.employeeId || decoded._id || decoded.id;
        console.log("Employee ID:", employeeId); // Debug employee ID

        // Fetch employee data from backend
        const response = await axios.get(
          `http://localhost:5000/api/employees/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("API Response:", response.data); // Debug API response

        // Set employee data ensuring we get the insurance plan
        setEmployee({
          ...response.data,
          employeeId: employeeId,
          fullName: response.data.fullName,
          healthInsurancePlan:
            response.data.healthInsurancePlan || decoded.healthInsurancePlan,
        });

        console.log("Set Employee Data:", {
          ...response.data,
          employeeId: employeeId,
          fullName: response.data.fullName,
          healthInsurancePlan:
            response.data.healthInsurancePlan || decoded.healthInsurancePlan,
        }); // Debug set employee data

        setLoading(false);
      } catch (err) {
        console.error("Error fetching employee data:", err);
        console.error("Error details:", err.response?.data); // Debug error details
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(`Failed to load employee data: ${err.message}`);
          setLoading(false);
        }
      }
    };

    fetchEmployeeData();
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
      <Box p={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  const currentPlan = employee?.healthInsurancePlan || "None";
  const planDetails = plans[currentPlan];

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        <LocalHospitalIcon fontSize="large" color="error" sx={{ mr: 1 }} />
        Your Health Insurance Plan
      </Typography>

      <Typography variant="h6" mt={2} mb={3}>
        Current Plan:{" "}
        <Chip
          label={currentPlan}
          color={planDetails?.color || "default"}
          size="medium"
          sx={{ fontWeight: "bold", fontSize: "1rem" }}
        />
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {Object.entries(plans).map(([planName, plan]) => (
          <Grid item xs={12} sm={6} md={3} key={planName}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                backgroundColor: currentPlan === planName ? "#025b4d" : "white",
                color: currentPlan === planName ? "white" : "inherit",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {planName} Plan
                </Typography>
                <ul style={{ paddingLeft: "1.2rem" }}>
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {benefit}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/employee-dashboard")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 4,
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default EmployeeInsurance;
