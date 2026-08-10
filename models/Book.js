const mongoose = require("mongoose");

// Un livre appartient à l'utilisateur qui l'a créé (userId) et regroupe toutes les notes reçues
const bookSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    // Chaque utilisateur ne peut noter le livre qu'une seule fois
    ratings: [
      {
        userId: {
          type: String,
          required: true,
        },
        grade: {
          type: Number,
          required: true,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      // Arrondi automatique à 1 décimale, quel que soit l'endroit où la valeur est assignée
      set: (value) => Math.round(value * 10) / 10,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Book", bookSchema);
