# 📱 Projet 4 : API REST d'un Réseau Social (Backend)

Bienvenue dans le dépôt Backend de notre réseau social !
Ce projet utilise **Node.js, Express et MySQL** et s'intègre parfaitement avec notre Frontend.

## 📌 Exigences du Cahier des Charges
- Au minimum **12 endpoints** (opérations API).
- Authentification protégée par **Token (JWT)**.
- Base de données relationnelle **MySQL**.
- Code commenté et compréhensible.

---

## 👥 Répartition des Tâches (L'Équipe)

Afin d'avancer efficacement, le développement de ce Backend est divisé en **3 grands pôles**. Chaque membre est responsable de ses Endpoints et doit s'assurer que ses routes renvoient le bon format JSON au Frontend.

### 👩‍💻 1. ZILDA : Cœur du Serveur & Authentification
**Mission :** Mettre en place les fondations du projet, la base de données et sécuriser l'application.
* **Tâches à réaliser :**
  - Initialiser le projet Node.js (`npm init`, installation de `express`, `mysql2`, `jsonwebtoken`, `bcryptjs`).
  - Créer le fichier d'initialisation de la base de données (`database.sql`) avec toutes les tables.
  - Créer le middleware d'authentification (`middleware/auth.js`) pour lire les Tokens.
* **Endpoints à coder (Auth) :**
  - `POST /api/auth/register` : Inscription d'un nouvel utilisateur (hachage du mot de passe).
  - `POST /api/auth/login` : Connexion (Vérification et génération du Token JWT).


### 👨‍💻 2. KOM : Moteur de Publications (Fil d'actualité)
**Mission :** Gérer l'affichage et la création des publications du réseau social.
* **Tâches à réaliser :**
  - Mettre en place le routeur Express pour les "Posts".
  - Assurer la liaison entre l'utilisateur qui poste (extrait du Token) et l'image publiée.
* **Endpoints à coder (Posts) :**
  - `GET /api/posts` : Liste de toutes les publications pour le fil d'actualité (avec nom et avatar de l'auteur).
  - `POST /api/posts` : Création d'une nouvelle publication.
  - `GET /api/posts/:id` : Récupérer les informations d'un seul post précis.
  - `DELETE /api/posts/:id` : Supprimer la publication (uniquement si on en est l'auteur).
  - `GET /api/users/me` : Obtenir les informations privées du profil connecté.


### 🦸‍♂️ 3. MARCO : Interactions (Likes, Commentaires) & Profils
**Mission :** Rendre l'application sociale en liant les utilisateurs entre eux à travers les interactions.
* **Tâches à réaliser :**
  - Mettre en place les routes liées aux "Commentaires" et aux "J'aime" (mise à jour des compteurs).
  - Gérer l'affichage public d'un profil et de sa grille de photos.
* **Endpoints à coder (Interactions & Profils) :**
  - `POST /api/posts/:id/like` : Ajouter un like à un post (insérer dans la table `likes`).
  - `DELETE /api/posts/:id/like` : Retirer son like d'un post.
  - `POST /api/posts/:id/comments` : Publier un texte dans l'espace commentaire d'une photo.
  - `GET /api/posts/:id/comments` : Lire tous les commentaires (avec le pseudo des auteurs) de la photo.
  - `DELETE /api/comments/:id` : Supprimer un commentaire spécifique.
  - `GET /api/users/:id` : Lire le profil public d'un membre (avec son nombre d'abonnés et sa grille d'images).

---

## 🛠️ Instructions pour démarrer le projet

Lorsque chacun travaillera sur sa partie, voici les commandes standards à exécuter :

1. Ouvrir le dossier `Backend` dans un terminal.
2. Installer les modules : `npm install`
3. Configurer vos identifiants MySQL dans un fichier `.env`.
4. Lancer le serveur de développement : `node server.js` ou `npm run dev`

> **Note à l'équipe :** Mettez un maximum de commentaires en français dans vos lignes de code pour que tout le monde (et les examinateurs) puisse comprendre la logique !
