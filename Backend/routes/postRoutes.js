const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Base route: /api/posts

router.get('/', auth, postController.getAllPosts);
router.post('/', auth, postController.createPost);
router.get('/:id', postController.getOnePost);
router.delete('/:id', auth, postController.deletePost);

// Nouvelles routes pour le profil et les enregistrements
router.get('/user/:userId', postController.getUserPosts);
router.get('/saved', auth, postController.getSavedPosts);
router.get('/tagged/:userId', postController.getTaggedPosts);
router.post('/save/:postId', auth, postController.savePost);
router.delete('/save/:postId', auth, postController.unsavePost);

// Likes
router.post('/like/:postId', auth, postController.likePost);
router.delete('/like/:postId', auth, postController.unlikePost);

// Commentaires
router.post('/comment/:postId', auth, postController.addComment);
router.get('/comment/:postId', postController.getPostComments);

module.exports = router;
