import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

const Attendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/attendance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setAttendanceLogs(response.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError("You do not have permission to view attendance records");
        } else {
          setError("Error fetching attendance data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Attendance Logs
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Employee</strong>
              </TableCell>
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Check-in</strong>
              </TableCell>
              <TableCell>
                <strong>Check-out</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.employeeName}</TableCell>
                <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                <TableCell>{log.checkIn}</TableCell>
                <TableCell>{log.checkOut || "--"}</TableCell>
                <TableCell>{log.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Attendance;
