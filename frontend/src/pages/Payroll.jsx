import React, { useState, useEffect } from "react";
import axios from "axios";

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayrollOverview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/employees/payroll-overview",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching payroll data:", err);
      setError("Failed to fetch employee payroll data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollOverview();
  }, []);

  // Filter employees by name
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Payroll Management</h2>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search by employee name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            width: "200px",
            marginBottom: "20px",
          }}
        />
      </div>

      {/* Loading and Error Handling */}
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Employee ID
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Full Name
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Gender
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Email
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Department
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Designation
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Basic Salary
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Allowances
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Deductions
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Health Plan (type)
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Health Plan Deduction
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Net Salary
            </th>
            <th style={{ padding: "12px", backgroundColor: "#f4f4f4" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => {
              const payroll = emp.latestPayroll;
              return (
                <tr key={emp._id}>
                  <td style={{ padding: "12px" }}>{emp.employeeID}</td>
                  <td style={{ padding: "12px" }}>{emp.name}</td>
                  <td style={{ padding: "12px" }}>{emp.gender}</td>
                  <td style={{ padding: "12px" }}>{emp.email}</td>
                  <td style={{ padding: "12px" }}>{emp.department}</td>
                  <td style={{ padding: "12px" }}>{emp.designation}</td>
                  <td style={{ padding: "12px" }}>{emp.basicSalary || "-"}</td>
                  <td style={{ padding: "12px" }}>
                    {payroll ? payroll.allowances : "-"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {payroll ? payroll.deductions : "-"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {emp.healthInsurancePlan || "-"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {payroll ? payroll.insuranceDeduction : "-"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {payroll ? payroll.netSalary : "-"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {payroll ? (
                      <button
                        onClick={() => alert(`Edit payroll for ${emp.name}`)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          alert(`Generate payroll for ${emp.name}`)
                        }
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Generate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="13" style={{ textAlign: "center", padding: "12px" }}>
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Payroll;
