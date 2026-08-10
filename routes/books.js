const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getAllBooks,
  getBookById,
  getBookForEdit,
  getBestRatedBooks,
  createBook,
  updateBook,
  deleteBook,
  rateBook,
} = require("../controllers/booksController");
const authMiddleware = require("../middleware/auth");

// Configuration de l'upload d'image: nom de fichier unique et dossier de stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safeName);
  },
});

// Limite la taille et le type des fichiers acceptés pour éviter les abus
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non supporté."));
    }
  },
});

const router = express.Router();

// Lecture des livres accessible à tous, sans authentification
router.get("/bestrating", getBestRatedBooks);
router.get("/:id", getBookById);
router.get("/", getAllBooks);
// Route dédiée à l'édition: vérifie que l'appelant est bien le propriétaire avant de renvoyer les données
router.get("/:id/edit", authMiddleware, getBookForEdit);
// Création, modification, suppression et notation nécessitent d'être connecté
router.post("/", authMiddleware, upload.single("image"), createBook);
router.put("/:id", authMiddleware, upload.single("image"), updateBook);
router.delete("/:id", authMiddleware, deleteBook);
router.post("/:id/rating", authMiddleware, rateBook);

module.exports = router;
