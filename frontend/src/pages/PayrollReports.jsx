// Create this new file for payroll reports
import React from "react";
import { Button, Typography } from "@mui/material";
import axios from "axios";

const PayrollReports = () => {
  const generateReport = async (type) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/payroll/reports?type=${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_report.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4">Payroll Reports</Typography>
      <Button variant="contained" onClick={() => generateReport("monthly")}>
        Generate Monthly Report
      </Button>
      <Button variant="contained" onClick={() => generateReport("annual")}>
        Generate Annual Report
      </Button>
    </div>
  );
};

export default PayrollReports;
