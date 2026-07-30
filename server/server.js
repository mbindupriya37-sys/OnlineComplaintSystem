const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

/* =========================================
   MIDDLEWARE
========================================= */

app.use(cors());
app.use(express.json());

/* =========================================
   SERVE UPLOADED IMAGES
========================================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================
   DATABASE
========================================= */

mongoose
  .connect("mongodb://127.0.0.1:27017/complaintdb")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* =========================================
   DEBUG
========================================= */

app.use((req, res, next) => {
  console.log("REQUEST =>", req.method, req.url);
  next();
});

/* =========================================
   HOME
========================================= */

app.get("/", (req, res) => {
  res.send("Complaint Management API Running");
});

/* =========================================
   TEST ROUTES
========================================= */

app.get("/abc123", (req, res) => {
  res.send("ABC TEST");
});

app.get("/api/complaints/test", (req, res) => {
  res.send("SERVER TEST WORKING");
});

/* =========================================
   ROUTES
========================================= */

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

/* =========================================
   SERVER
========================================= */

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});