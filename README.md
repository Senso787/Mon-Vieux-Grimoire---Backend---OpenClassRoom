# Mon Vieux Grimoire - Backend

API backend pour le site de notation de livres "Mon Vieux Grimoire".

**Auteur**: CREPISSON Nathan-Noël

## Prérequis

- Node.js (v14+)
- npm
- MongoDB
- Git

## Installation

```bash
git clone https://github.com/Senso787/Mon-Vieux-Grimoire---Backend---OpenClassRoom.git
cd Mon-Vieux-Grimoire---Backend---OpenClassRoom
npm install
```

## Lancement

Mode développement:

```bash
npm run dev
```

Mode production:

```bash
npm start
```

Le serveur démarre sur http://localhost:4000

## Routes API

**Authentification:**

- POST /api/auth/signup - Créer un compte
- POST /api/auth/login - Se connecter

**Livres:**

- GET /api/books - Tous les livres
- GET /api/books/bestrating - Top 3 mieux notés
- GET /api/books/:id - Détail d'un livre
- POST /api/books - Créer un livre (authentifié)
- PUT /api/books/:id - Modifier un livre (authentifié)
- DELETE /api/books/:id - Supprimer un livre (authentifié)
- POST /api/books/:id/rating - Noter un livre (authentifié)

## Fonctionnalités

- Authentification JWT
- Hachage des mots de passe (bcrypt)
- Optimisation automatique des images (Sharp)
- CRUD complet pour les livres
- Système de notation avec moyenne
- Isolation des données par utilisateur

## Technologies

- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Sharp
