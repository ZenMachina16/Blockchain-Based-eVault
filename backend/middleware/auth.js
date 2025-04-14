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

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  console.log(
    "Token received:",
    token ? token.substring(0, 10) + "..." : "none"
  );
  console.log("Auth header:", authHeader);
  
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(403).json({ message: "Invalid token." });
    }
    
    console.log("Token verified, user:", user);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;