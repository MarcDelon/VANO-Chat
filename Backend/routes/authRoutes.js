const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route d'inscription : POST /api/auth/register
router.post('/register', authController.register);

// Route de connexion : POST /api/auth/login
router.post('/login', authController.login);

// Route de connexion Google : POST /api/auth/google
router.post('/google', authController.googleAuth);

module.exports = router;
