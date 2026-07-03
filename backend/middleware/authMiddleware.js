const jwt = require("jsonwebtoken");

const authMiddleware = (allowedRoles) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Debug logs
    console.log("Decoded Token:", decoded);
    console.log("User Role:", req.user.role);
    console.log("Allowed Roles:", allowedRoles);

    // Special case: Admin should bypass all role checks
    if (req.user.role === "Admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid Token" });
  }
};
module.exports = authMiddleware;
