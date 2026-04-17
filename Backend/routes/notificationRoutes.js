const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Toutes les routes sont protégées
router.get('/', auth, notificationController.getNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/mark-read', auth, notificationController.markAsRead);

module.exports = router;
