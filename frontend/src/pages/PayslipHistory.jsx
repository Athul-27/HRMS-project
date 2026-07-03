import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AdminLayout from "../components/AdminLayout";

const PayslipHistory = () => {
  const [payslips, setPayslips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/payslips", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayslips(response.data);
      } catch (error) {
        console.error("Error fetching payslips", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchPayslips();
  }, [navigate]);

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Payslip History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payslips.map((payslip) => (
              <TableRow key={payslip._id}>
                <TableCell>{payslip.month}</TableCell>
                <TableCell>{payslip.employeeId}</TableCell>
                <TableCell>${payslip.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminLayout>
  );
};

export default PayslipHistory;
