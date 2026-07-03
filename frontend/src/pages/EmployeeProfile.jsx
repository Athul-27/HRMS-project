import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, ArrowBack } from "@mui/icons-material";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authorization token is missing.");
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const employeeId = decoded.id || decoded._id || decoded.employeeId;

        if (!employeeId) {
          throw new Error("Employee ID not found in token");
        }

        const response = await axios.get(
          `http://localhost:5000/api/employees/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setEmployee(response.data);
          setFormData({
            fullName: response.data.fullName || "",
            email: response.data.email || "",
            phoneNumber: response.data.phoneNumber || "",
            gender: response.data.gender || "",
            dateOfBirth: response.data.dateOfBirth?.substring(0, 10) || "",
            address: response.data.address || "",
          });
        }
      } catch (err) {
        console.error("Error details:", err);
        setError("Error fetching employee details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const today = new Date().toISOString().split("T")[0];

    // Basic validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.gender
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (formData.dateOfBirth && formData.dateOfBirth > today) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const employeeId = decoded.id || decoded._id || decoded.employeeId;

    try {
      setSubmitting(true);

      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : undefined,
        address: formData.address || "",
      };

      const response = await axios.put(
        `http://localhost:5000/api/employees/${employeeId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        setEmployee(response.data);
        setFormData({
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          phoneNumber: response.data.phoneNumber || "",
          gender: response.data.gender || "",
          dateOfBirth: response.data.dateOfBirth?.substring(0, 10) || "",
          address: response.data.address || "",
        });
        setIsEditing(false);
        setSuccess("Profile updated successfully.");
      }
    } catch (err) {
      console.error("Update error:", err);
      if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        navigate("/login");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to connect to server. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: employee.fullName || "",
      email: employee.email || "",
      phoneNumber: employee.phoneNumber || "",
      gender: employee.gender || "",
      dateOfBirth: employee.dateOfBirth?.substring(0, 10) || "",
      address: employee.address || "",
    });
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress sx={{ color: "#025b4d" }} size={60} thickness={4} />
      </Box>
    );
  }

  if (error && !isEditing) {
    return (
      <Box p={4}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box p={4}>
        <Typography color="error" variant="h6" align="center">
          Employee not found.
        </Typography>
      </Box>
    );
  }

  const themeColor = "#025b4d";
  const themeColorHover = "#014a3f";

  return (
    <Box
      sx={{
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        padding: 3,
      }}
    >
      <Container maxWidth="md">
        <Paper sx={{ padding: 4, borderRadius: 3, boxShadow: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/employee-dashboard")}
              variant="outlined"
              sx={{
                color: themeColor,
                borderColor: themeColor,
                "&:hover": {
                  borderColor: themeColorHover,
                  color: themeColorHover,
                },
              }}
            >
              Back
            </Button>
            {!isEditing && (
              <Button
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                variant="contained"
                sx={{
                  bgcolor: themeColor,
                  "&:hover": {
                    bgcolor: themeColorHover,
                  },
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: themeColor,
              textAlign: "center",
              fontWeight: 600,
              mb: 4,
            }}
          >
            Employee Profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: themeColor,
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: themeColor,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: themeColor,
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: themeColor,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: themeColor,
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: themeColor,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ "&.Mui-focused": { color: themeColor } }}>
                      Gender
                    </InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      label="Gender"
                      required
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          "&.Mui-focused": {
                            borderColor: themeColor,
                          },
                        },
                      }}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: themeColor,
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: themeColor,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: themeColor,
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: themeColor,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      disabled={submitting}
                      sx={{
                        color: themeColor,
                        borderColor: themeColor,
                        "&:hover": {
                          borderColor: themeColorHover,
                          color: themeColorHover,
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      sx={{
                        bgcolor: themeColor,
                        "&:hover": {
                          bgcolor: themeColorHover,
                        },
                      }}
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Full Name
                </Typography>
                <Typography variant="body1">{employee.fullName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Email
                </Typography>
                <Typography variant="body1">{employee.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Phone Number
                </Typography>
                <Typography variant="body1">{employee.phoneNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Gender
                </Typography>
                <Typography variant="body1">{employee.gender}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Date of Birth
                </Typography>
                <Typography variant="body1">
                  {new Date(employee.dateOfBirth).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Department
                </Typography>
                <Typography variant="body1">{employee.department}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Designation
                </Typography>
                <Typography variant="body1">{employee.designation}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Basic Salary
                </Typography>
                <Typography variant="body1">₹{employee.basicSalary}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Experience
                </Typography>
                <Typography variant="body1">
                  {employee.experience} years
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Address
                </Typography>
                <Typography variant="body1">{employee.address}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" sx={{ color: themeColor }}>
                  Health Insurance Plan
                </Typography>
                <Typography variant="body1">
                  {employee.healthInsurancePlan}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default EmployeeProfile;
