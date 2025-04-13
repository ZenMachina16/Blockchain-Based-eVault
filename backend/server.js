const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mount route modules
const authRoutes = require("./routes/auth-routes");
const uploadRoutes = require("./routes/upload");
const filesRoutes = require("./routes/files");
const caseRoutes = require("./routes/caseRoutes");
app.use("/api/cases", caseRoutes);

app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/files", filesRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
