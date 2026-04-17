const db = require('../config/db');

/**
 * Récupérer les notifications de l'utilisateur connecté
 * Inclut les infos du "sender" (celui qui a liké/suivi).
 */
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await db
            .from('notifications')
            .select(`
                *,
                sender:sender_id(username, avatar)
            `)
            .eq('receiver_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur getNotifications:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des notifications.' });
    }
};

/**
 * Récupérer le nombre de notifications non lues
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const { count, error } = await db
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);

        if (error) throw error;

        res.status(200).json({ unreadCount: count || 0 });
    } catch (error) {
        console.error('Erreur getUnreadCount:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du compteur.' });
    }
};

/**
 * Marquer toutes les notifications comme lues
 */
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await db
            .from('notifications')
            .update({ is_read: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);

        if (error) throw error;

        res.status(200).json({ message: 'Notifications marquées comme lues.' });
    } catch (error) {
        console.error('Erreur markAsRead:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
    }
};
