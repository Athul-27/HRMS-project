import React, { useState } from "react";
import { Box, Tabs, Tab, Container } from "@mui/material";
import EmployeeMasterReport from "./reports/EmployeeMasterReport";
import PayrollSummaryReport from "./reports/PayrollSummaryReport";
import LeaveHistoryReport from "./reports/LeaveHistoryReport";

// ... rest of the file remains exactly the same ...

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Reports() {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleChange}>
          <Tab label="Employee Master" />
          <Tab label="Attendance Summary" />
          <Tab label="Payroll Summary" />
          <Tab label="Leave History" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <EmployeeMasterReport />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AttendanceSummaryReport />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <PayrollSummaryReport />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <LeaveHistoryReport />
      </TabPanel>
    </Container>
  );
}
