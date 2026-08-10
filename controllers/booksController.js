const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const Book = require("../models/Book");

// Redimensionne et compresse l'image uploadée pour limiter son poids
const optimizeImage = async (filePath) => {
  try {
    const optimizedPath = filePath;
    await sharp(filePath)
      .resize(400, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(optimizedPath);
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'image:", error);
  }
};

// Supprime le fichier image sur le disque quand un livre est modifié ou supprimé
const deleteUploadedFile = (imageUrl) => {
  try {
    if (!imageUrl) return;
    const filename = imageUrl.split("/uploads/")[1];
    if (filename) {
      const filepath = path.join(__dirname, "../uploads", filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier uploadé:", error);
  }
};

// Le frontend envoie parfois les données du livre en JSON dans un champ "book" (cas des formulaires multipart avec image)
const parseBookData = (req) => {
  if (req.body.book) {
    try {
      return JSON.parse(req.body.book);
    } catch (error) {
      return req.body;
    }
  }
  return req.body;
};

// Récupère tous les livres, du plus récent au plus ancien
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des livres." });
  }
};

// Récupère un livre précis, accessible publiquement (page de détail/notation)
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre introuvable." });
    }
    res.json(book);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération du livre." });
  }
};

// Renvoie les 3 livres les mieux notés pour la page d'accueil
exports.getBestRatedBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des meilleurs livres.",
    });
  }
};

// Crée un livre. Le propriétaire (userId) vient toujours du token, jamais du corps de la requête
exports.createBook = async (req, res) => {
  try {
    const bookData = parseBookData(req);
    if (!req.file) {
      return res.status(400).json({ message: "Image manquante." });
    }
    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    await optimizeImage(filePath);
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const book = await Book.create({
      ...bookData,
      userId: req.user.userId,
      imageUrl,
    });
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la création du livre." });
  }
};

// Modifie un livre existant, réservé au créateur du livre
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre introuvable." });
    }
    // Seul le créateur du livre peut le modifier, même avec un lien partagé
    if (book.userId !== req.user.userId) {
      return res.status(403).json({ message: "Accès refusé." });
    }
    const bookData = parseBookData(req);
    const updatedData = {
      title: bookData.title ?? book.title,
      author: bookData.author ?? book.author,
      year: bookData.year ?? book.year,
      genre: bookData.genre ?? book.genre,
    };
    if (req.file) {
      deleteUploadedFile(book.imageUrl);
      const filePath = path.join(__dirname, "../uploads", req.file.filename);
      await optimizeImage(filePath);
      updatedData.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      },
    );
    res.json(updatedBook);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du livre." });
  }
};

// Supprime un livre et son image, réservé au créateur du livre
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre introuvable." });
    }
    if (book.userId !== req.user.userId) {
      return res.status(403).json({ message: "Accès refusé." });
    }
    deleteUploadedFile(book.imageUrl);
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Livre supprimé." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du livre." });
  }
};

// Ajoute la note d'un utilisateur (une seule fois par livre) et recalcule la moyenne
exports.rateBook = async (req, res) => {
  try {
    const { rating } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre introuvable." });
    }
    const grade = parseFloat(rating);
    if (Number.isNaN(grade) || grade < 0 || grade > 5) {
      return res.status(400).json({ message: "Note invalide." });
    }
    const existingRating = book.ratings.find(
      (elt) => elt.userId === req.user.userId,
    );
    if (existingRating) {
      return res.status(409).json({ message: "Vous avez déjà noté ce livre." });
    }
    book.ratings.push({ userId: req.user.userId, grade });
    const average =
      book.ratings.reduce((sum, elt) => sum + elt.grade, 0) /
      book.ratings.length;
    // Arrondi à 1 décimale pour éviter les nombres à rallonge (ex 2.6666666)
    book.averageRating = Math.round(average * 10) / 10;
    await book.save();
    res.json(book);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la notation du livre." });
  }
};
