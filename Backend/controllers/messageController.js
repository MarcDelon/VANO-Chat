const db = require('../config/db');

/**
 * Récupérer la liste des conversations (utilisateurs avec qui on a discuté)
 * On cherche tous les messages où l'utilisateur est soit l'expéditeur, soit le destinataire.
 */
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Requête Supabase pour obtenir les messages impliquant l'utilisateur
        const { data: messages, error } = await db
            .from('messages')
            .select(`
                *,
                sender:sender_id(id, username, avatar),
                receiver:receiver_id(id, username, avatar)
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Grouper par contact unique pour former les "conversations"
        const conversationsMap = new Map();

        messages.forEach(msg => {
            const contact = msg.sender_id === userId ? msg.receiver : msg.sender;
            if (!contact) return; // Sécurité si un utilisateur a été supprimé

            if (!conversationsMap.has(contact.id)) {
                conversationsMap.set(contact.id, {
                    id: contact.id,
                    username: contact.username,
                    avatar: contact.avatar,
                    lastMessage: msg.message,
                    time: msg.created_at,
                    unread: !msg.is_read && msg.receiver_id === userId
                });
            } else if (!msg.is_read && msg.receiver_id === userId) {
                // Si on a déjà l'entrée mais qu'on trouve un message plus ancien non lu, on marque la conversation comme non lue
                conversationsMap.get(contact.id).unread = true;
            }
        });

        res.status(200).json(Array.from(conversationsMap.values()));
    } catch (error) {
        console.error('Erreur getConversations:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des conversations.' });
    }
};

/**
 * Récupérer l'historique des messages avec un utilisateur spécifique
 */
exports.getMessagesWithUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contactId } = req.params;

        const { data, error } = await db
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // MARQUER COMME LU : On met à jour tous les messages reçus de ce contact
        await db
            .from('messages')
            .update({ is_read: true })
            .eq('receiver_id', userId)
            .eq('sender_id', contactId)
            .eq('is_read', false);

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur getMessagesWithUser:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
    }
};

/**
 * Envoyer un message
 */
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({ message: 'Destinataire et message requis.' });
        }

        const { data, error } = await db
            .from('messages')
            .insert([{ sender_id: senderId, receiver_id: receiverId, message }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Erreur sendMessage:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message.' });
    }
};

/**
 * Récupérer le nombre de messages non lus
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const { count, error } = await db
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);

        if (error) throw error;

        res.status(200).json({ count: count || 0 });
    } catch (error) {
        console.error('Erreur getUnreadCount:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du compteur.' });
    }
};

/**
 * Modifier un message (Seulement si l'utilisateur est l'expéditeur)
 */
exports.updateMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { message } = req.body;

        const { data, error } = await db
            .from('messages')
            .update({ message })
            .eq('id', id)
            .eq('sender_id', userId) // Sécurité : Seul l'expéditeur peut modifier
            .select();

        if (error) throw error;
        if (data.length === 0) return res.status(403).json({ message: 'Non autorisé ou message introuvable.' });

        res.status(200).json(data[0]);
    } catch (error) {
        console.error('Erreur updateMessage:', error);
        res.status(500).json({ message: 'Erreur lors de la modification du message.' });
    }
};

/**
 * Supprimer un message (Seulement si l'utilisateur est l'expéditeur)
 */
exports.deleteMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { error } = await db
            .from('messages')
            .delete()
            .eq('id', id)
            .eq('sender_id', userId); // Sécurité : Seul l'expéditeur peut supprimer

        if (error) throw error;

        res.status(200).json({ message: 'Message supprimé.' });
    } catch (error) {
        console.error('Erreur deleteMessage:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression.' });
    }
};
