import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const LeaveRequest = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: null,
    endDate: null,
    reason: "",
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
    fetchLeaveRequests();
  }, []);

  const baseLeaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Personal Leave",
    "Emergency Leave",
  ];

  const leaveTypes = [
    ...baseLeaveTypes,
    ...(user?.gender === "Female" ? ["Maternity Leave"] : []),
  ];

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/leave/my-leaves",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.data) {
        throw new Error("No data received from server");
      }

      setLeaveRequests(response.data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch leave requests. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ... existing code ...
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      // Validate form data
      if (
        !formData.leaveType ||
        !formData.startDate ||
        !formData.endDate ||
        !formData.reason
      ) {
        setError("All fields are required");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/leave/apply",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      }

      setSuccess("Leave request submitted successfully");
      setFormData({
        leaveType: "",
        startDate: null,
        endDate: null,
        reason: "",
      });
      fetchLeaveRequests();
    } catch (err) {
      console.error("Error submitting leave request:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit leave request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };
  // ... existing code ...
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" gutterBottom>
            Leave Request
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/employee-dashboard")}
          >
            Back to Dashboard
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            New Leave Request
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Leave Type"
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveType: e.target.value })
                  }
                  required
                >
                  {leaveTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) =>
                    setFormData({ ...formData, startDate: date })
                  }
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) =>
                    setFormData({ ...formData, endDate: date })
                  }
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" type="submit" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Submit Request"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Typography variant="h6" gutterBottom>
          My Leave Requests
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>
                    {new Date(leave.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(leave.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      color={getStatusColor(leave.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </LocalizationProvider>
  );
};

export default LeaveRequest;
