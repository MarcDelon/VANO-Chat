const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Toutes les routes de messagerie sont protégées
router.get('/conversations', auth, messageController.getConversations);
router.get('/unread-count', auth, messageController.getUnreadCount);
router.get('/:contactId', auth, messageController.getMessagesWithUser);
router.post('/send', auth, messageController.sendMessage);

module.exports = router;
