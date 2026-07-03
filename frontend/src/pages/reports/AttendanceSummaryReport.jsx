import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Grid,
} from "@mui/material";
import { Download, Refresh } from "@mui/icons-material";

export default function AttendanceSummaryReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/reports/attendance-summary",
        {
          params: { month, year },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality will be implemented here
    console.log("Exporting attendance summary");
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
        <Typography variant="h5">Attendance Summary Report</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Export
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={month}
              label="Month"
              onChange={(e) => setMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i} value={i}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              label="Year"
              onChange={(e) => setYear(e.target.value)}
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - 2 + i
              ).map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{ height: "56px" }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#025b4d" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Status</TableCell>
              <TableCell sx={{ color: "white" }}>Count</TableCell>
              <TableCell sx={{ color: "white" }}>Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => {
              const total = data.reduce((sum, curr) => sum + curr.count, 0);
              const percentage =
                total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;

              return (
                <TableRow key={item._id}>
                  <TableCell>{item._id}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>{percentage}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
