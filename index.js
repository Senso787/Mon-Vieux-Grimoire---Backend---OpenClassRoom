const express = require("express");
require("dotenv").config();
const connectDB = require("./config/database");
const app = express();

const PORT = process.env.PORT || 4000;

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Serveur Express fonctionne !" });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Serveur Express fonctionne !" });
});

app.listen(PORT, () => {
  console.log(`Serveur running on http://localhost:${PORT}`);
});

module.exports = app;
