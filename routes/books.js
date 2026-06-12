const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getAllBooks,
  getBookById,
  getBestRatedBooks,
  createBook,
  updateBook,
  deleteBook,
  rateBook,
} = require("../controllers/booksController");
const authMiddleware = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safeName);
  },
});

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

router.get("/bestrating", getBestRatedBooks);
router.get("/:id", getBookById);
router.get("/", getAllBooks);
router.post("/", authMiddleware, upload.single("image"), createBook);
router.put("/:id", authMiddleware, upload.single("image"), updateBook);
router.delete("/:id", authMiddleware, deleteBook);
router.post("/:id/rating", authMiddleware, rateBook);

module.exports = router;
