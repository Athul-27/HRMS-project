import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/leave/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const leaves = response.data.leaves || response.data;
        setLeaveRequests(
          leaves.map((leave) => ({
            ...leave,
            employeeName: leave.employee?.fullName || "Unknown Employee",
          }))
        );
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        setSnackbar({
          open: true,
          message: "Failed to fetch leave requests",
          severity: "error",
        });
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [navigate]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/leave/update/${id}`,
        { status: "Approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLeaveRequests(leaveRequests.filter((request) => request._id !== id));
      setSnackbar({
        open: true,
        message: "Leave request approved",
        severity: "success",
      });
    } catch (error) {
      console.error("Error approving leave:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to approve leave",
        severity: "error",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/leave/update/${id}`,
        { status: "Rejected" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLeaveRequests(leaveRequests.filter((request) => request._id !== id));
      setSnackbar({
        open: true,
        message: "Leave request rejected",
        severity: "error",
      });
    } catch (error) {
      console.error("Error rejecting leave:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to reject leave",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#025b4d",
          fontWeight: 700,
          textAlign: "center",
          textTransform: "uppercase",
          marginBottom: 4,
          letterSpacing: 1.2,
        }}
      >
        Leave Requests Approval
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 8,
            borderRadius: "16px",
            padding: 3,
            backgroundColor: "#ffffff",
            maxWidth: "90%",
            margin: "auto",
            overflow: "hidden",
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead
              sx={{
                backgroundColor: "#025b4d",
                borderRadius: "12px",
                borderBottom: "2px solid #004f40",
              }}
            >
              <TableRow>
                {[
                  "Employee",
                  "Leave Type",
                  "Start Date",
                  "End Date",
                  "Reason",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: "#ffffff",
                      fontWeight: "bold",
                      padding: "16px",
                      fontSize: "1.1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow
                  key={request._id}
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "#f4f4f4",
                    },
                    "&:hover": {
                      backgroundColor: "#e3f2f1",
                      transform: "scale(1.02)",
                      transition: "all 0.3s ease-in-out",
                    },
                    borderBottom: "1px solid #d6d6d6",
                  }}
                >
                  <TableCell sx={{ padding: "16px" }}>
                    {request.employeeName}
                  </TableCell>
                  <TableCell sx={{ padding: "16px" }}>
                    {request.leaveType}
                  </TableCell>
                  <TableCell sx={{ padding: "16px" }}>
                    {new Date(request.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ padding: "16px" }}>
                    {new Date(request.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ padding: "16px" }}>
                    {request.reason}
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "16px",
                      color:
                        request.status === "Approved"
                          ? "#388e3c"
                          : request.status === "Rejected"
                          ? "#d32f2f"
                          : "#ff9800",
                      fontWeight: 600,
                    }}
                  >
                    {request.status}
                  </TableCell>
                  <TableCell sx={{ padding: "16px" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(request._id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(request._id)}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LeaveApproval;
