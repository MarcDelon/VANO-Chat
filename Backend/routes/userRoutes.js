const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Base route: /api/users

router.get('/me', auth, userController.getMyProfile);
router.put('/me', auth, userController.updateProfile);
router.get('/suggestions', auth, userController.getSuggestions);
router.get('/search', auth, userController.searchUsers);
router.get('/friends', auth, userController.getFriends);
router.get('/profile/:id', auth, userController.getUserProfile);
router.post('/follow/:id', auth, userController.followUser);
router.delete('/follow/:id', auth, userController.unfollowUser);

module.exports = router;
