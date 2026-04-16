require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importation de nos routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const storyRoutes = require('./routes/storyRoutes');

const app = express();

//--- Middlewares globaux ---
// Permet de communiquer avec ton Frontend Next.js (évite les erreurs CORS)
app.use(cors());
// Permet à Express de lire le corps des requêtes en JSON
app.use(express.json());


//--- Montage des routes ---
// Toutes les routes définies dans authRoutes.js commenceront par "/api/auth"
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stories', storyRoutes);


// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});
