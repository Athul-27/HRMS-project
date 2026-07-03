import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
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
  CircularProgress,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
} from "@mui/material";
import { Event, Refresh } from "@mui/icons-material";

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const navigate = useNavigate();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/attendance/my-attendance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let filteredAttendance = response.data;

      if (month !== "") {
        filteredAttendance = filteredAttendance.filter(
          (record) => new Date(record.date).getMonth() === parseInt(month)
        );
      }

      if (year !== "") {
        filteredAttendance = filteredAttendance.filter(
          (record) => new Date(record.date).getFullYear() === parseInt(year)
        );
      }

      setAttendance(filteredAttendance);
      setErrorMsg("");
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMsg("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        setErrorMsg(
          error.response?.data?.message || "Failed to load attendance records"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const clearFilters = () => {
    setMonth("");
    setYear("");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          textAlign: "center",
          backgroundColor: "rgba(2, 91, 77, 0.1)",
          p: 3,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/employee-dashboard")}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "#025b4d",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Event fontSize="large" />
          My Attendance Records
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        mb={4}
      >
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={month}
            label="Month"
            onChange={(e) => setMonth(e.target.value)}
            sx={{ backgroundColor: "white" }}
          >
            <MenuItem value="">All Months</MenuItem>
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((monthName, index) => (
              <MenuItem key={index} value={index}>
                {monthName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={year}
            label="Year"
            onChange={(e) => setYear(e.target.value)}
            sx={{ backgroundColor: "white" }}
          >
            <MenuItem value="">All Years</MenuItem>
            {[2023, 2024, 2025].map((yearOption) => (
              <MenuItem key={yearOption} value={yearOption}>
                {yearOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={clearFilters}
          sx={{ height: "56px" }}
        >
          Clear Filters
        </Button>

        <Button
          variant="contained"
          onClick={fetchAttendance}
          startIcon={<Refresh />}
          sx={{ height: "56px" }}
        >
          Refresh
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress size={60} thickness={4} sx={{ color: "#025b4d" }} />
        </Box>
      ) : errorMsg ? (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      ) : attendance.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            p: 4,
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="textSecondary">
            No attendance records found for selected filters
          </Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            mt: 2,
            borderRadius: 2,
            boxShadow: 3,
            "& .MuiTableCell-root": {
              py: 1.5,
            },
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#025b4d" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Check-In
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Check-Out
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map((record) => (
                <TableRow
                  key={record._id}
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "rgba(2, 91, 77, 0.05)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(2, 91, 77, 0.08)",
                    },
                  }}
                >
                  <TableCell>
                    {new Date(record.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      weekday: "short",
                    })}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {record.checkIn || "--"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {record.checkOut || "--"}
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        color:
                          record.status === "Present"
                            ? "success.main"
                            : "error.main",
                        fontWeight: 600,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor:
                          record.status === "Present"
                            ? "rgba(46, 125, 50, 0.1)"
                            : "rgba(211, 47, 47, 0.1)",
                      }}
                    >
                      {record.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default EmployeeAttendance;
