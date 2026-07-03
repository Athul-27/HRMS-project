import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';
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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { Download, Refresh } from "@mui/icons-material";

export default function LeaveHistoryReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/reports/leave-history",
        {
          params: { status: statusFilter },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching leave history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(leave => ({
      'Employee': leave.employee?.fullName,
      'Department': leave.employee?.department,
      'Leave Type': leave.leaveType,
      'Start Date': new Date(leave.startDate).toLocaleDateString(),
      'End Date': new Date(leave.endDate).toLocaleDateString(),
      'Status': leave.status,
      'Reason': leave.reason,
      'Applied On': new Date(leave.createdAt).toLocaleDateString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave History');
    XLSX.writeFile(workbook, `Leave_History_${new Date().toISOString().slice(0,10)}.xlsx`);
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
        <Typography variant="h5">Leave History Report</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchData}
          sx={{ ml: 2, height: "56px" }}
        >
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#025b4d" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Employee</TableCell>
              <TableCell sx={{ color: "white" }}>Department</TableCell>
              <TableCell sx={{ color: "white" }}>Leave Type</TableCell>
              <TableCell sx={{ color: "white" }}>Dates</TableCell>
              <TableCell sx={{ color: "white" }}>Status</TableCell>
              <TableCell sx={{ color: "white" }}>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((leave) => (
              <TableRow key={leave._id}>
                <TableCell>{leave.employee?.fullName}</TableCell>
                <TableCell>{leave.employee?.department}</TableCell>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>
                  {new Date(leave.startDate).toLocaleDateString()} -{" "}
                  {new Date(leave.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={leave.status}
                    color={
                      leave.status === "Approved"
                        ? "success"
                        : leave.status === "Rejected"
                        ? "error"
                        : "warning"
                    }
                  />
                </TableCell>
                <TableCell>{leave.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}