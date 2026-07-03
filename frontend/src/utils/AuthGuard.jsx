import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthGuard = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const publicRoutes = ["/", "/login", "/register"];
    const currentPath = location.pathname;

    // Allow public routes to be accessed without authorization
    if (publicRoutes.includes(currentPath)) {
      setIsAuthorized(true);
      setCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Token expiration check
      if (decoded.exp < currentTime) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      // Role-based authorization check
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        navigate("/dashboard");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Token error:", error);
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setCheckingAuth(false);
    }
  }, [location.pathname, navigate, allowedRoles]);

  if (checkingAuth) return <div>Loading...</div>;

  return isAuthorized ? children : null;
};

export default AuthGuard;
