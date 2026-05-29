const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const app = express();

const PORT = process.env.PORT || 4000;

connectDB();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    return res.status(200).end();
  }
  next();
});

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Serveur Express fonctionne !" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Serveur Express fonctionne !" });
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "Route protégée accessible", userId: req.user.userId });
});

app.listen(PORT, () => {
  console.log(`Serveur running on http://localhost:${PORT}`);
});

module.exports = app;
