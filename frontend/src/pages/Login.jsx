import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );
      console.log("API response:", response); // Log the response to verify token
      const token = response.data.token;
      localStorage.setItem("token", token); // Store token in localStorage

      const user = jwtDecode(token);
      console.log("Decoded user:", user);

      // Give AuthGuard time to see token in localStorage
      setTimeout(() => {
        handleRoleBasedRedirect(user);
      }, 100);
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // console.log("Token saved to localStorage:", localStorage.getItem("token"));

  const handleRoleBasedRedirect = (user) => {
    switch (user.role) {
      case "Employee":
        navigate("/employee-dashboard");
        break;
      case "Admin":
        navigate("/admin-dashboard");
        break;
      case "HR":
        navigate("/dashboard");
        break;
      default:
        navigate("/login"); // Redirect to login if no role matched
    }
  };

  // console.log("Token saved to localStorage:", localStorage.getItem("token"));

  return (
    <div style={wrapperStyle}>
      <div style={formContainer}>
        <h1 style={mainHeading}>Login</h1>
        <form onSubmit={handleLogin} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <div style={passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyleWithIcon}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={toggleIcon}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {error && <p style={errorStyle}>{error}</p>}

          <div style={buttonContainer}>
            <button type="submit" style={buttonStyle} disabled={isLoading}>
              {isLoading ? "Logging In..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Styles =====
const wrapperStyle = {
  minHeight: "100vh",
  width: "100vw",
  background: "url('/your/background.jpg') no-repeat center center/cover",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0",
  boxSizing: "border-box",
};

const formContainer = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  padding: "40px",
  borderRadius: "15px",
  width: "90%",
  maxWidth: "400px",
  boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
  color: "#fff",
};

const mainHeading = {
  color: "#025B4D",
  fontSize: "32px",
  textAlign: "center",
  marginBottom: "30px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  marginBottom: "6px",
  color: "#000",
  fontWeight: "bold",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "7px",
  border: "2px solid #000",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  color: "#000",
  fontSize: "16px",
};

const inputStyleWithIcon = {
  ...inputStyle,
  paddingRight: "182px",
};

const passwordWrapper = {
  position: "relative",
};

const toggleIcon = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  fontSize: "18px",
  color: "#000",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  marginTop: "20px",
};

const buttonStyle = {
  backgroundColor: "#025B4D",
  color: "#fff",
  padding: "12px 30px",
  border: "none",
  borderRadius: "7px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

const errorStyle = {
  color: "red",
  fontSize: "14px",
  textAlign: "center",
  marginTop: "10px",
};

export default Login;
