const db = require('../config/db');

/**
 * Récupérer le profil de l'utilisateur connecté
 * Utilise l'ID présent dans le token (injecté par le middleware Auth).
 */
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await db
            .from('users')
            .select('id, username, email, avatar, bio, created_at')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ message: 'Utilisateur introuvable.' });
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur getMyProfile:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
    }
};

/**
 * Mettre à jour le profil (optionnel, mais utile)
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, bio, avatar } = req.body;

        const { data, error } = await db
            .from('users')
            .update({ username, bio, avatar })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Profil mis à jour !', user: data });
    } catch (error) {
        console.error('Erreur updateProfile:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
    }
};

/**
 * Récupérer des suggestions d'utilisateurs
 * Retourne une liste de membres à suivre (excluant l'utilisateur actuel).
 */
exports.getSuggestions = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Récupérer les IDs des personnes que l'on suit déjà
        const { data: followedData } = await db
            .from('followers')
            .select('following_id')
            .eq('follower_id', userId);
        
        const followedIds = followedData ? followedData.map(f => f.following_id) : [];
        // On s'exclut aussi soi-même de la liste à filtrer
        followedIds.push(userId);

        // 2. On récupère 5 utilisateurs qui ne sont pas dans la liste des suivis
        // Supabase NOT IN syntax with array
        const { data, error } = await db
            .from('users')
            .select('id, username, avatar, bio')
            .not('id', 'in', `(${followedIds.join(',')})`)
            .limit(5);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur getSuggestions:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des suggestions.' });
    }
};

/**
 * Rechercher des utilisateurs par pseudo
 */
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json([]);

        const { data, error } = await db
            .from('users')
            .select('id, username, avatar')
            .ilike('username', `%${q}%`)
            .limit(10);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur searchUsers:', error);
        res.status(500).json({ message: 'Erreur lors de la recherche.' });
    }
};

/**
 * Récupérer le profil public d'un utilisateur par son ID
 */
exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        // 1. Infos de base
        const { data: user, error: userError } = await db
            .from('users')
            .select('id, username, avatar, bio, created_at')
            .eq('id', id)
            .single();

        if (userError) throw userError;

        // 2. Statistiques (posts, followers, following)
        const { count: postsCount } = await db.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', id);
        const { count: followersCount } = await db.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', id);
        const { count: followingCount } = await db.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', id);

        // 3. Est-ce que l'utilisateur connecté le suit ?
        const { data: followData } = await db
            .from('followers')
            .select('*')
            .eq('follower_id', currentUserId)
            .eq('following_id', id);

        const isFollowing = followData && followData.length > 0;

        res.status(200).json({
            ...user,
            stats: {
                posts: postsCount || 0,
                followers: followersCount || 0,
                following: followingCount || 0
            },
            isFollowing
        });
    } catch (error) {
        console.error('Erreur getUserProfile:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
    }
};

/**
 * S'abonner à un utilisateur
 */
exports.followUser = async (req, res) => {
    try {
        const followerId = req.user.id;
        const { id: followingId } = req.params;

        if (followerId == followingId) {
            return res.status(400).json({ message: 'S\'abonner à soi-même est impossible.' });
        }

        const { error } = await db
            .from('followers')
            .insert([{ follower_id: followerId, following_id: followingId }]);

        if (error) {
            if (error.code === '23505') return res.status(200).json({ message: 'Déjà suivi.' });
            throw error;
        }

        res.status(201).json({ message: 'Abonnement réussi !' });
    } catch (error) {
        console.error('Erreur followUser:', error);
        res.status(500).json({ message: 'Erreur lors de l\'abonnement.' });
    }
};

/**
 * Se désabonner d'un utilisateur
 */
exports.unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.id;
        const { id: followingId } = req.params;

        const { error } = await db
            .from('followers')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);

        if (error) throw error;
        res.status(200).json({ message: 'Désabonnement réussi.' });
    } catch (error) {
        console.error('Erreur unfollowUser:', error);
        res.status(500).json({ message: 'Erreur lors du désabonnement.' });
    }
};

/**
 * Récupérer la liste des amis (personnes suivies ou abonnés)
 */
exports.getFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: follows, error: followError } = await db
            .from('followers')
            .select('follower_id, following_id')
            .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

        if (followError) throw followError;

        const friendIds = new Set();
        if (follows) {
            follows.forEach(f => {
                if (f.follower_id !== userId) friendIds.add(f.follower_id);
                if (f.following_id !== userId) friendIds.add(f.following_id);
            });
        }

        if (friendIds.size === 0) {
            return res.status(200).json([]);
        }

        const friendIdsArray = Array.from(friendIds);
        const { data: friends, error: userError } = await db
            .from('users')
            .select('id, username, avatar, bio')
            .in('id', friendIdsArray);

        if (userError) throw userError;

        res.status(200).json(friends);
    } catch (error) {
        console.error('Erreur getFriends:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des amis.' });
    }
};
