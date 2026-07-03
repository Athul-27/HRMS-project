import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AuthGuard from "./utils/AuthGuard.jsx";
import AdminLayout from "./components/AdminLayout.jsx";

//Pages
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboardHome from "./pages/AdminDashboard.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import EmployeeList from "./pages/EmployeeList.jsx";
import AddEmployee from "./pages/AddEmployee.jsx";
import EditEmployee from "./pages/EditEmployee.jsx";
import EmployeeProfile from "./pages/EmployeeProfile.jsx";
import EmployeeInsurance from "./pages/EmployeeInsurance.jsx";
import PayrollDashboard from "./pages/PayrollDashboard";
import ProcessPayroll from "./pages/ProcessPayroll";
import PayslipHistory from "./pages/PayslipHistory";
import Attendance from "./pages/Attendance.jsx";
import EmployeeAttendance from "./pages/EmployeeAttendance.jsx";
import Recruitment from "./pages/Recruitment.jsx";
import Reports from "./pages/Reports.jsx";
import LeaveRequest from "./pages/LeaveRequest.jsx";
import ClockInOut from "./pages/ClockInOut.jsx";
import LeaveApproval from "./pages/LeaveApproval.jsx";

// import EmployeePayroll from "./pages/EmployeePayroll";

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          setIsValidToken(false);
          localStorage.removeItem("token");
        }
      } catch (error) {
        setIsValidToken(false);
        localStorage.removeItem("token");
      }
    }
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  if (!isValidToken) {
    return <Navigate to="/" />;
  }

  return (
    <Router>
      <Routes key={localStorage.getItem("token") || "guest"}>
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <AuthGuard allowedRoles={["Admin"]}>
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route path="leave-approval" element={<LeaveApproval />} />
          <Route index element={<AdminDashboardHome />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="employees/edit/:id" element={<EditEmployee />} />
          <Route path="payroll" element={<PayrollDashboard />} />
          <Route path="process-payroll" element={<ProcessPayroll />} />
          <Route path="payslip-history" element={<PayslipHistory />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Employee Routes */}
        <Route
          path="/employee-dashboard"
          element={
            <AuthGuard allowedRoles={["Employee"]}>
              <EmployeeDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/employee/profile/:id"
          element={
            <AuthGuard allowedRoles={["Employee"]}>
              <EmployeeProfile />
            </AuthGuard>
          }
        />
        {/* <Route
          path="/employee/payroll/:id"
          element={
            <AuthGuard allowedRoles={["Employee"]}>
              <EmployeePayroll />
            </AuthGuard>
          }
        /> */}
        <Route
          path="/employee-insurance"
          element={
            <AuthGuard allowedRoles={["Employee"]}>
              <EmployeeInsurance />
            </AuthGuard>
          }
        />
        <Route
          path="/employee/leave-request"
          element={
            <AuthGuard allowedRoles={["Employee"]}>
              <LeaveRequest />
            </AuthGuard>
          }
        />
        <Route
          path="/employee/clock-in-out"
          element={
            <AuthGuard allowedRoles={["Employee"]}>
              <ClockInOut />
            </AuthGuard>
          }
        />
        <Route
          path="/employee/attendance"
          element={
            <AuthGuard allowedRoles={["Employee"]}>
              <EmployeeAttendance />
            </AuthGuard>
          }
        />

        {/* Common Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard allowedRoles={["Admin", "HR", "Employee", "Recruiter"]}>
              <Dashboard />
            </AuthGuard>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
