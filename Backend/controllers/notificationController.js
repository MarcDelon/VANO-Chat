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

        if (error) {
            if (error.code === 'PGRST205') {
                return res.status(200).json([]);
            }
            throw error;
        }

        res.status(200).json(data || []);
    } catch (error) {
        if (error?.code !== 'PGRST205') {
            console.error('Erreur getNotifications:', error);
        }
        res.status(200).json([]);
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

        if (error) {
            if (error.code === 'PGRST205') {
                return res.status(200).json({ unreadCount: 0 });
            }
            throw error;
        }

        res.status(200).json({ unreadCount: count || 0 });
    } catch (error) {
        res.status(200).json({ unreadCount: 0 });
    }
};

/**
 * Marquer une notification comme lue
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { error } = await db
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('receiver_id', userId);

        if (error && error.code !== 'PGRST205') throw error;

        res.status(200).json({ message: 'Notification marquée comme lue.' });
    } catch (error) {
        res.status(200).json({ message: 'OK' });
    }
};

/**
 * Marquer toutes les notifications comme lues
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await db
            .from('notifications')
            .update({ is_read: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);

        if (error && error.code !== 'PGRST205') throw error;

        res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues.' });
    } catch (error) {
        res.status(200).json({ message: 'OK' });
    }
};
