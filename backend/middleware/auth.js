// const jwt = require("jsonwebtoken");
// const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "No token provided." });

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: "Invalid token." });
//     console.log("Decoded user:", user); // Debug log
//     req.user = user;
//     next();
//   });
// }
// console.log("User object in middleware:", req.user);
// middleware/auth.js
console.log("Token received:", token ? token.substring(0, 10) + "..." : "none");
// After decoding:
console.log("User from token:", decoded.user);
// After fetching from DB:
console.log("User from DB:", user);
console.log("User role:", user.role);

module.exports = { authenticateToken };
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log(
    "Token received:",
    token ? token.substring(0, 10) + "..." : "none"
  );

  if (!token) return res.status(401).json({ message: "No token provided." });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token." });

    // Map the decoded token data to match the structure expected by routes
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    console.log("Decoded user:", req.user);
    console.log("User role:", req.user.role);

    next();
  });
}

module.exports = { authenticateToken };