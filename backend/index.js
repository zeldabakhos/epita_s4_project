const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

require("dotenv").config();
const connectDB = require("./utils/db.js");

// ROUTES
const userRoutes = require("./routes/users");

// Connect to MongoDB
connectDB();

// MIDDLEWARE
app.use(express.json());

// --- CORS ---
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
app.options("*", (_, res) => res.sendStatus(200));

// ROUTES
app.use("/api/users", userRoutes);

// Root
app.get("/", (_req, res) => res.send("Welcome to Cancer Helper AI API"));

// 404
app.use((_, res) => res.status(404).json({ message: "Route not found" }));

app.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));
