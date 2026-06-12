const Book = require("../models/Book");

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

exports.createBook = async (req, res) => {
  try {
    const bookData = parseBookData(req);
    if (!req.file) {
      return res.status(400).json({ message: "Image manquante." });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const book = await Book.create({
      ...bookData,
      userId: bookData.userId || req.user.userId,
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

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre introuvable." });
    }
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

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre introuvable." });
    }
    if (book.userId !== req.user.userId) {
      return res.status(403).json({ message: "Accès refusé." });
    }
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Livre supprimé." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression du livre." });
  }
};

exports.rateBook = async (req, res) => {
  try {
    const { rating } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre introuvable." });
    }
    const grade = parseInt(rating, 10);
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
    book.averageRating =
      book.ratings.reduce((sum, elt) => sum + elt.grade, 0) /
      book.ratings.length;
    await book.save();
    res.json(book);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la notation du livre." });
  }
};
