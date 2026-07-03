import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortColumn, setSortColumn] = useState("fullName");
  const [searchQuery, setSearchQuery] = useState("");

  const planLabels = {
    None: "None",
    Basic: "Basic",
    Premium: "Premium",
    Gold: "Gold",
  };

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      setError("Error fetching employees");
      console.error("Error fetching employees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) return <p style={styles.loading}>Loading...</p>;

  const handleSortChange = (e) => {
    const [column, direction] = e.target.value.split("-");
    setSortColumn(column);
    setSortDirection(direction);
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const filteredEmployees = sortedEmployees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (employeeId) => {
    navigate(`/admin-dashboard/employees/edit/${employeeId}`);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Employee List</h2>

      <div style={styles.controlsContainer}>
        <input
          type="text"
          placeholder="Search by name, email, or department"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.sortingDropdown}>
          <label htmlFor="sortDropdown">Sort by: </label>
          <select
            id="sortDropdown"
            onChange={handleSortChange}
            value={`${sortColumn}-${sortDirection}`}
            style={styles.dropdown}
          >
            <option value="employeeID-asc">Employee ID Ascending</option>
            <option value="employeeID-desc">Employee ID Descending</option>
            <option value="fullName-asc">Full Name (A-Z)</option>
            <option value="fullName-desc">Full Name (Z-A)</option>
            <option value="experience-asc">Experience (Low to High)</option>
            <option value="experience-desc">Experience (High to Low)</option>
            <option value="basicSalary-asc">Salary (Low to High)</option>
            <option value="basicSalary-desc">Salary (High to Low)</option>
          </select>
        </div>
      </div>

      {error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Gender</th>
                <th style={styles.th}>Date of Birth</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Experience</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Basic Salary</th>
                <th style={styles.th}>Health Plan</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp._id}>
                  <td style={styles.td}>{emp.employeeID || "N/A"}</td>
                  <td style={styles.td}>{emp.fullName}</td>
                  <td style={styles.td}>{emp.gender || "N/A"}</td>
                  <td style={styles.td}>
                    {emp.dateOfBirth
                      ? new Date(emp.dateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td style={styles.td}>{emp.address || "N/A"}</td>
                  <td style={styles.td}>{emp.experience || "N/A"}</td>
                  <td style={styles.td}>{emp.email}</td>
                  <td style={styles.td}>{emp.department}</td>
                  <td style={styles.td}>${emp.basicSalary}</td>
                  <td
                    style={{
                      ...styles.td,
                      fontWeight: "bold",
                      color:
                        emp.healthInsurancePlan === "Gold"
                          ? "goldenrod"
                          : emp.healthInsurancePlan === "Premium"
                          ? "purple"
                          : emp.healthInsurancePlan === "Basic"
                          ? "#007BFF"
                          : "gray",
                    }}
                  >
                    {planLabels[emp.healthInsurancePlan] || "None"}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEditClick(emp._id)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  heading: {
    textAlign: "center",
    color: "#025b4d",
    fontSize: "28px",
    marginBottom: "20px",
  },
  error: {
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    padding: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
  },
  th: {
    backgroundColor: "#025b4d",
    color: "white",
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    color: "#333",
  },
  searchInput: {
    padding: "10px",
    fontSize: "16px",
    width: "100%",
    maxWidth: "350px",
    margin: "0 auto",
    display: "block",
    borderRadius: "5px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  sortingDropdown: {
    marginTop: "10px",
    textAlign: "right",
    display: "inline-block",
    minWidth: "200px",
  },
  dropdown: {
    padding: "8px 12px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    width: "100%",
  },
  controlsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "0 20px",
  },
  editButton: {
    padding: "6px 12px",
    backgroundColor: "#04574b",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default EmployeeList;
