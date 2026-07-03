import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box,
  Paper,
  Card,
  CardContent,
  Divider,
  Stack,
} from "@mui/material";
import {
  AccessTime,
  CheckCircle,
  HighlightOff,
  ArrowBack,
} from "@mui/icons-material";

const ClockInOut = () => {
  const navigate = useNavigate();
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please login first");
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const res = await axios.get(
        "http://localhost:5000/api/attendance/my-attendance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            date: today.toISOString(),
          },
        }
      );

      const record = res.data.find((log) => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === today.toDateString();
      });

      if (record) {
        setCheckedIn(true);
        setCheckedOut(!!record.checkOut);
        setTodayRecord(record);
      } else {
        setCheckedIn(false);
        setCheckedOut(false);
        setTodayRecord(null);
      }
    } catch (err) {
      // ... error handling remains unchanged ...
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please login first");
        return;
      }

      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const res = await axios.post(
        "http://localhost:5000/api/attendance/check-in",
        { checkIn: time },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(res.data.message);
      await fetchTodayStatus();
    } catch (err) {
      setMessage(err.response?.data?.message || "Clock In failed.");
    }
  };

  const handleClockOut = async () => {
    try {
      if (!checkedIn && !todayRecord) {
        setMessage("You must clock in before clocking out");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please login first");
        return;
      }

      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const res = await axios.post(
        "http://localhost:5000/api/attendance/check-out",
        { checkOut: time },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(res.data.message);
      await fetchTodayStatus();
    } catch (err) {
      if (err.response?.status === 400) {
        setMessage(err.response.data.message || "Clock out failed");
      } else {
        setMessage("Clock Out failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 4,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #f5f9ff 0%, #e8f4ff 100%)",
      }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/employee-dashboard")}
        sx={{
          mb: 3,
          alignSelf: "flex-start",
          color: "#025b4d",
          borderColor: "#025b4d",
          "&:hover": {
            backgroundColor: "rgba(2, 91, 77, 0.08)",
            borderColor: "#025b4d",
          },
        }}
        variant="outlined"
      >
        Back to Dashboard
      </Button>

      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: "20px",
          flexGrow: 1,
          background: "white",
          boxShadow: "0 8px 32px rgba(2, 91, 77, 0.1)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "#025b4d",
            mb: 4,
            textTransform: "uppercase",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <AccessTime sx={{ fontSize: "2.5rem" }} />
          Attendance Portal
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress
              size={80}
              thickness={4}
              sx={{ color: "#025b4d" }}
            />
            <Typography variant="body1" mt={3} color="text.secondary">
              Loading your attendance data...
            </Typography>
          </Box>
        ) : (
          <>
            {message && (
              <Alert
                severity={message.includes("success") ? "success" : "error"}
                sx={{
                  mb: 4,
                  borderRadius: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                  fontSize: "0.95rem",
                }}
              >
                {message}
              </Alert>
            )}

            <Card
              variant="outlined"
              sx={{
                mb: 4,
                borderRadius: "16px",
                borderColor: "rgba(2, 91, 77, 0.2)",
                boxShadow: "0 4px 20px rgba(2, 91, 77, 0.08)",
                background: "rgba(255, 255, 255, 0.7)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="center"
                  sx={{ mb: 3 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CheckCircle />}
                    onClick={handleClockIn}
                    disabled={checkedIn}
                    sx={{
                      px: 5,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: "1rem",
                      borderRadius: "12px",
                      textTransform: "none",
                      boxShadow: "none",
                      background: "#025b4d",
                      "&:hover": {
                        background: "#024b4d",
                        boxShadow: "0 4px 12px rgba(2, 91, 77, 0.3)",
                      },
                      "&.Mui-disabled": {
                        background: "rgba(2, 91, 77, 0.12)",
                        color: "rgba(2, 91, 77, 0.5)",
                      },
                    }}
                  >
                    Clock In
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<HighlightOff />}
                    onClick={handleClockOut}
                    disabled={!checkedIn || checkedOut}
                    sx={{
                      px: 5,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: "1rem",
                      borderRadius: "12px",
                      textTransform: "none",
                      boxShadow: "none",
                      background: "#d32f2f",
                      "&:hover": {
                        background: "#b71c1c",
                        boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
                      },
                      "&.Mui-disabled": {
                        background: !checkedIn ? "rgba(211, 47, 47, 0.12)" : "",
                        color: !checkedIn ? "rgba(211, 47, 47, 0.5)" : "",
                      },
                    }}
                  >
                    {!checkedIn ? "Clock In Required" : "Clock Out"}
                  </Button>
                </Stack>

                <Divider
                  sx={{
                    my: 3,
                    borderColor: "rgba(2, 91, 77, 0.1)",
                  }}
                />

                {todayRecord && (
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 3,
                      backgroundColor: "rgba(2, 91, 77, 0.03)",
                      borderRadius: "12px",
                      border: "1px solid rgba(2, 91, 77, 0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: "#025b4d",
                      }}
                    >
                      Today's Attendance Record
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        textAlign: "left",
                        maxWidth: 300,
                        mx: "auto",
                        "& > p": {
                          p: 1.5,
                          borderRadius: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Status:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color:
                            todayRecord.status === "Present"
                              ? "#2e7d32"
                              : "#d32f2f",
                          fontWeight: 600,
                        }}
                      >
                        {todayRecord.status}
                      </Typography>

                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Check In:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {todayRecord.checkIn || "--"}
                      </Typography>

                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Check Out:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {todayRecord.checkOut || "--"}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ClockInOut;
