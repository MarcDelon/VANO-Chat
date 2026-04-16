const db = require('../config/db');

/**
 * Récupérer toutes les publications (Fil d'actualité)
 * On utilise une jointure Supabase pour récupérer aussi les infos de l'auteur.
 */
exports.getAllPosts = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        const { data: posts, error } = await db
            .from('posts')
            .select(`
                *,
                users(username, avatar),
                likes(user_id),
                comments(id),
                saved_posts(user_id)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transformer les données pour le Frontend
        const enrichedPosts = posts.map(post => {
            const isLiked = userId ? post.likes.some(l => l.user_id === userId) : false;
            const isSaved = userId ? post.saved_posts.some(s => s.user_id === userId) : false;
            
            return {
                ...post,
                likesCount: post.likes.length,
                commentsCount: post.comments.length,
                isLiked,
                isSaved,
                // On nettoie les objets bruts de jointure pour ne pas alourdir le JSON
                likes: undefined,
                comments: undefined,
                saved_posts: undefined
            };
        });
        
        res.status(200).json(enrichedPosts);
    } catch (error) {
        console.error('Erreur getAllPosts:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des posts.' });
    }
};

/**
 * Créer une nouvelle publication
 */
exports.createPost = async (req, res) => {
    try {
        const userId = req.user.id; // Récupéré via le middleware Auth
        const { image_url, content } = req.body;

        if (!image_url) {
            return res.status(400).json({ message: 'Une URL d\'image est requise.' });
        }

        const { data, error } = await db
            .from('posts')
            .insert([{ user_id: userId, image_url, content }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Publication créée avec succès !', post: data[0] });
    } catch (error) {
        console.error('Erreur createPost:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la publication.' });
    }
};

/**
 * Récupérer une seule publication par son ID
 */
exports.getOnePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await db
            .from('posts')
            .select('*, users(username, avatar)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ message: 'Publication introuvable.' });
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur getOnePost:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du post.' });
    }
};

/**
 * Supprimer une publication
 * Vérifie d'abord que l'utilisateur est bien l'auteur.
 */
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 1. Vérification de l'existence et de la propriété
        const { data: post, error: fetchError } = await db
            .from('posts')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') return res.status(404).json({ message: 'Publication introuvable.' });
            throw fetchError;
        }

        if (post.user_id !== userId) {
            return res.status(403).json({ message: 'Action non autorisée. Vous n\'êtes pas l\'auteur de ce post.' });
        }

        // 2. Suppression
        const { error: deleteError } = await db
            .from('posts')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.status(200).json({ message: 'Publication supprimée avec succès !' });
    } catch (error) {
        console.error('Erreur deletePost:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la publication.' });
    }
};

/**
 * Récupérer les publications d'un utilisateur spécifique
 */
exports.getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await db
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur getUserPosts:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des posts utilisateur.' });
    }
};

/**
 * Enregistrer une publication
 */
exports.savePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;

        const { data, error } = await db
            .from('saved_posts')
            .insert([{ user_id: userId, post_id: postId }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Publication enregistrée !', data: data[0] });
    } catch (error) {
        console.error('Erreur savePost:', error);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement.' });
    }
};

/**
 * Désenregistrer une publication
 */
exports.unsavePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;

        const { error } = await db
            .from('saved_posts')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId);

        if (error) throw error;
        res.status(200).json({ message: 'Enregistrement supprimé.' });
    } catch (error) {
        console.error('Erreur unsavePost:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'enregistrement.' });
    }
};

/**
 * Récupérer les publications enregistrées par l'utilisateur connecté
 */
exports.getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await db
            .from('saved_posts')
            .select('*, posts(*, users(username, avatar))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // On aplatit le résultat pour n'avoir que les objets "post"
        const savedPosts = data.map(item => item.posts);
        res.status(200).json(savedPosts);
    } catch (error) {
        console.error('Erreur getSavedPosts:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des enregistrements.' });
    }
};

/**
 * Récupérer les publications où un utilisateur est identifié
 */
exports.getTaggedPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await db
            .from('post_tags')
            .select('*, posts(*, users(username, avatar))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const taggedPosts = data.map(item => item.posts);
        res.status(200).json(taggedPosts);
    } catch (error) {
        console.error('Erreur getTaggedPosts:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des identifications.' });
    }
};

/**
 * Liker une publication
 */
exports.likePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;

        const { error } = await db
            .from('likes')
            .insert([{ user_id: userId, post_id: postId }]);

        if (error) {
            if (error.code === '23505') return res.status(200).json({ message: 'Déjà liké.' });
            throw error;
        }

        res.status(201).json({ message: 'Post liké !' });
    } catch (error) {
        console.error('Erreur likePost:', error);
        res.status(500).json({ message: 'Erreur lors du like.' });
    }
};

/**
 * Enlever un like
 */
exports.unlikePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;

        const { error } = await db
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId);

        if (error) throw error;
        res.status(200).json({ message: 'Like retiré.' });
    } catch (error) {
        console.error('Erreur unlikePost:', error);
        res.status(500).json({ message: 'Erreur lors du retrait du like.' });
    }
};

/**
 * Ajouter un commentaire
 */
exports.addComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { postId } = req.params;
        const { text } = req.body;

        if (!text) return res.status(400).json({ message: 'Le texte du commentaire est requis.' });

        const { data, error } = await db
            .from('comments')
            .insert([{ user_id: userId, post_id: postId, text }])
            .select('*, users(username, avatar)')
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Erreur addComment:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire.' });
    }
};

/**
 * Récupérer les commentaires d'un post
 */
exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const { data, error } = await db
            .from('comments')
            .select('*, users(username, avatar)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur getPostComments:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires.' });
    }
};

