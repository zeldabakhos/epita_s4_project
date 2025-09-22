const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

require("dotenv").config();
const connectDB = require("./utils/db.js");

// ROUTES
const userRoutes = require("./routes/users");
const moodRoutes = require("./routes/mood.routes"); 
const chatRoutes = require("./routes/chatRoutes");
const resourcesRoutes = require("./routes/resourcesRoutes");
const caregiverRoutes = require("./routes/caregiverRoutes");

// Connect to MongoDB
connectDB();

// MIDDLEWARE
app.use(express.json());

// --- CORS ---
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
app.options("*", (_, res) => res.sendStatus(200));

// HEALTH (optional but handy)
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ROUTES
app.use("/api/users", userRoutes);
app.use("/api/mood", moodRoutes); 
app.use("/api/chat", chatRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/caregivers", caregiverRoutes);

// Root
app.get("/", (_req, res) => res.send("Welcome to Cancer Helper AI API"));

// ERROR HANDLER (ensure controllers can `next(err)`)
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
});

// 404
app.use((_, res) => res.status(404).json({ message: "Route not found" }));

app.listen(port, "0.0.0.0", () =>
  console.log(`Server running on port ${port}`)
);
