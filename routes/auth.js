const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

// Routes publiques, aucune authentification requise pour s'inscrire ou se connecter
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
