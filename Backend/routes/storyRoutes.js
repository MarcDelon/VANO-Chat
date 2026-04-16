const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/auth');

// Base route: /api/stories

router.get('/', auth, storyController.getActiveStories);
router.post('/', auth, storyController.createStory);
router.get('/content/:userId', auth, storyController.getUserStories);
router.post('/view/:storyId', auth, storyController.markStoryAsViewed);


module.exports = router;
