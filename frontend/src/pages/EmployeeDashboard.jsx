import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { ExitToApp, Person, Event, Paid, Healing } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser({
        ...decoded,
        employeeId: decoded.employeeId || decoded._id,
        fullName: decoded.fullName || decoded.name,
        healthInsurancePlan: decoded.healthInsurancePlan || "None",
      });
    } catch (error) {
      setError("Session expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Add this loading state check
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }
  if (error || !user) {
    return (
      <Typography color="error" variant="h6">
        {error || "User information not found. Please log in again."}
      </Typography>
    );
  }

  const features = [
    {
      title: "My Profile",
      description: "View and edit your profile",
      icon: <Person />,
      link: `/employee/profile/${user.employeeId}`,
    },
    {
      title: "Attendance",
      description: "Mark attendance & view history",
      icon: <Event />,
      link: "/employee/attendance", // Changed from "/employee/employee-attendance"
    },
    {
      title: "Payslips",
      description: "View salary breakdowns",
      icon: <Paid />,
      link: `/employee/payroll/${user.employeeId}`,
    },
    {
      title: "Leave Requests",
      description: "Apply for leaves",
      icon: <Event />,
      link: "/employee/leave-request", // Updated path
    },
    {
      title: "Health Insurance",
      description: `Your plan: ${user.healthInsurancePlan}`,
      icon: <Healing />,
      link: "/employee-insurance",
    },
    {
      title: "Clock In/Out",
      description: "Mark your daily attendance",
      icon: <Event />,
      link: "/employee/clock-in-out",
    },
  ];

  return (
    <Box
      sx={{
        p: 4,
        background: "linear-gradient(to bottom, rgba(2, 91, 77, 0.03), white)",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#025b4d",
          fontWeight: 700,
          mb: 4,
          textTransform: "uppercase",
          letterSpacing: 1,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -8,
            left: 0,
            width: "80px",
            height: "4px",
            backgroundColor: "#025b4d",
            borderRadius: 2,
          },
        }}
      >
        Welcome, {user.fullName}
      </Typography>

      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 16px rgba(2, 91, 77, 0.1)",
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 12px 24px rgba(2, 91, 77, 0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box
                    sx={{
                      color: "#025b4d",
                      fontSize: "2rem",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ color: "#025b4d" }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to={feature.link}
                  fullWidth
                  sx={{
                    mt: 2,
                    backgroundColor: "#025b4d",
                    "&:hover": {
                      backgroundColor: "#014a42",
                    },
                  }}
                >
                  Go
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={6}>
        <Button
          variant="outlined"
          startIcon={<ExitToApp />}
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          sx={{
            color: "#025b4d",
            borderColor: "#025b4d",
            px: 4,
            "&:hover": {
              backgroundColor: "rgba(2, 91, 77, 0.08)",
              borderColor: "#025b4d",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;
