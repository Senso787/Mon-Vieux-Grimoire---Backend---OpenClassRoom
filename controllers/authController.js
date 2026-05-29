const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Cet utilisateur existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({ userId: user._id, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "24h" },
    );

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};
