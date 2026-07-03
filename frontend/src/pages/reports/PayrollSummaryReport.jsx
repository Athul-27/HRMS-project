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

export default function PayrollSummaryReport() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchData();
  }, [month]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/reports/payroll-summary",
        {
          params: { month },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching payroll summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality will be implemented here
    console.log("Exporting payroll summary");
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
        <Typography variant="h5">Payroll Summary Report</Typography>
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
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                return date.toISOString().slice(0, 7);
              })
                .reverse()
                .map((m) => (
                  <MenuItem key={m} value={m}>
                    {new Date(m).toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
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
              <TableCell sx={{ color: "white" }}>Metric</TableCell>
              <TableCell sx={{ color: "white" }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Total Payroll</TableCell>
              <TableCell>
                ${data.totalPayroll?.toLocaleString() || "0"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Average Salary</TableCell>
              <TableCell>
                ${data.averageSalary?.toLocaleString() || "0"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Employees Processed</TableCell>
              <TableCell>{data.count || "0"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
