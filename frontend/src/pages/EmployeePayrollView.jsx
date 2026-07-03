// Create this new file for employees to view their payslips
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

const EmployeePayrollView = () => {
  const [payslips, setPayslips] = useState([]);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/payroll/my-payslips",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPayslips(response.data);
      } catch (error) {
        console.error("Error fetching payslips:", error);
      }
    };
    fetchPayslips();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Month</TableCell>
            <TableCell>Basic Salary</TableCell>
            <TableCell>Allowances</TableCell>
            <TableCell>Deductions</TableCell>
            <TableCell>Net Salary</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payslips.map((payslip) => (
            <TableRow key={payslip._id}>
              <TableCell>{payslip.month}</TableCell>
              <TableCell>₹{payslip.basicSalary}</TableCell>
              <TableCell>₹{payslip.allowances}</TableCell>
              <TableCell>
                ₹{payslip.deductions + payslip.insuranceDeduction}
              </TableCell>
              <TableCell>₹{payslip.netSalary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EmployeePayrollView;
