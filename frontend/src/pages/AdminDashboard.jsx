import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import PaidIcon from "@mui/icons-material/Paid";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    totalPayroll: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/admin/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchStats();
  }, [navigate]);

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Welcome, Admin
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <PeopleIcon fontSize="large" />
            <Typography variant="h6">Total Employees</Typography>
            <Typography variant="h4">{stats.totalEmployees}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <WorkIcon fontSize="large" />
            <Typography variant="h6">Active Projects</Typography>
            <Typography variant="h4">{stats.activeProjects}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
            <PaidIcon fontSize="large" />
            <Typography variant="h6">Payroll Processed</Typography>
            <Typography variant="h4">${stats.totalPayroll}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminDashboard;
