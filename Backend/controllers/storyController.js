const db = require('../config/db');

/**
 * Créer une nouvelle story
 */
exports.createStory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { media_url, media_type = 'image' } = req.body;

        if (!media_url) {
            return res.status(400).json({ message: 'URL du média manquante.' });
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Tentative d'insertion avec tous les champs
        let { data, error } = await db
            .from('stories')
            .insert([{ 
                user_id: userId, 
                media_url, 
                media_type,
                expires_at: expiresAt.toISOString() 
            }])
            .select();

        // Si l'erreur est que la colonne 'media_type' n'existe pas, on réessaie sans
        if (error && error.message.includes('media_type')) {
            console.warn('⚠️ Colonne media_type manquante, repli sur insertion sans type.');
            const retry = await db
                .from('stories')
                .insert([{ 
                    user_id: userId, 
                    media_url, 
                    expires_at: expiresAt.toISOString() 
                }])
                .select();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.error('❌ Erreur Critique Supabase:', error);
            return res.status(500).json({ message: 'Erreur base de données', details: error.message });
        }

        const savedStory = (data && data.length > 0) ? data[0] : { id: 'temp' };
        res.status(201).json({ message: 'Story publiée !', story: savedStory });
    } catch (error) {
        console.error('❌ Crash createStory:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la story.' });
    }
};

/**
 * Récupérer les stories actives
 * On récupère les utilisateurs qui ont au moins une story non expirée.
 */
exports.getActiveStories = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date().toISOString();
        console.log(`[Stories] Fetching active stories for user ${userId}`);
        
        // 1. Récupérer TOUTES les stories actives
        const { data: allActiveStories, error: storiesError } = await db
            .from('stories')
            .select('*, users(id, username, avatar)')
            .gt('expires_at', now)
            .order('created_at', { ascending: false });

        if (storiesError) {
            console.error('[Stories] Fetch error:', storiesError);
            throw storiesError;
        }

        // 2. Récupérer les VUES de l'utilisateur connecté pour ces stories
        const activeStoryIds = allActiveStories.map(s => s.id);
        const { data: viewsData, error: viewsError } = await db
            .from('story_views')
            .select('story_id')
            .eq('user_id', userId)
            .in('story_id', activeStoryIds);
        
        if (viewsError) {
            console.warn('[Stories] Views fetching warn:', viewsError.message);
        }

        const viewedStoryIds = new Set((viewsData || []).map(v => Number(v.story_id)));
        console.log(`[Stories] Viewed IDs:`, Array.from(viewedStoryIds));

        // 3. Groupement par utilisateur & calcul du statut "vocal"
        const usersMap = new Map();

        allActiveStories.forEach(item => {
            const uid = item.user_id;
            const isUnviewed = !viewedStoryIds.has(Number(item.id));

            if (!usersMap.has(uid)) {
                usersMap.set(uid, {
                    id: uid,
                    username: item.users.username,
                    avatar: item.users.avatar,
                    lastStoryAt: item.created_at,
                    latestMediaUrl: item.media_url,
                    allViewed: true 
                });
            }
            
            if (isUnviewed) {
                usersMap.get(uid).allViewed = false;
            }
        });
        
        const result = Array.from(usersMap.values()).sort((a, b) => {
            if (a.allViewed === b.allViewed) {
                return new Date(b.lastStoryAt).getTime() - new Date(a.lastStoryAt).getTime();
            }
            return a.allViewed ? 1 : -1;
        });

        console.log(`[Stories] Returning ${result.length} user blocks. First user allViewed: ${result[0]?.allViewed}`);
        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Erreur getActiveStories:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des stories.' });
    }
};

/**
 * Marquer une story comme vue
 */
exports.markStoryAsViewed = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storyId } = req.params;

        const { error } = await db
            .from('story_views')
            .upsert([{ user_id: userId, story_id: parseInt(storyId) }], { onConflict: 'user_id,story_id' });

        if (error) {
            console.error('[Stories] markViewed error:', error);

            // Si la table n'existe pas encore, on log l'erreur mais on ne bloque pas
            if (error.code === '42P01') {
                return res.status(200).json({ status: 'deferred', message: 'Table story_views non existante.' });
            }
            throw error;
        }

        res.status(200).json({ message: 'Vue enregistrée.' });
    } catch (error) {
        console.error('❌ Erreur markStoryAsViewed:', error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement de la vue." });
    }
};


/**
 * Récupérer toutes les stories d'un utilisateur spécifique
 */
exports.getUserStories = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`📥 Requête getUserStories pour l'utilisateur ID: ${userId}`);
        const now = new Date().toISOString();

        const { data, error } = await db
            .from('stories')
            .select('*')
            .eq('user_id', userId)
            .gt('expires_at', now)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur getUserStories:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du contenu.' });
    }
};
