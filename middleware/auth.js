const jwt = require("jsonwebtoken");

// Middleware qui protège une route en exigeant un token JWT valide dans le header Authorization
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultsecret",
    );
    // Les infos de l'utilisateur sont attachées à la requête pour les contrôleurs suivants
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide." });
  }
};
