const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Inscription classique
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
        }

        const { data: existingUsers, error: searchError } = await db
            .from('users')
            .select('*')
            .or(`email.eq.${email},username.eq.${username}`);

        if (searchError) {
            console.error('Erreur Supabase lors de la recherche:', searchError);
            return res.status(500).json({ message: 'Erreur serveur lors de la vérification du compte.' });
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ message: 'Cet email ou ce nom d\'utilisateur est déjà utilisé.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: newUser, error: insertError } = await db
            .from('users')
            .insert([{
                username,
                email,
                password: hashedPassword,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Erreur Supabase lors de l\'insertion:', insertError);
            return res.status(500).json({ message: 'Erreur serveur lors de la création du compte.' });
        }

        const token = jwt.sign(
            { userId: newUser.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès !',
            userId: newUser.id,
            token: token
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
    }
};

// Connexion classique
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe.' });
        }

        const { data: users, error: searchError } = await db
            .from('users')
            .select('*')
            .eq('email', email);

        if (searchError) {
            console.error('Erreur Supabase lors de la recherche:', searchError);
            return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
        }

        if (!users || users.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' } 
        );

        res.status(200).json({
            message: 'Connexion réussie.',
            userId: user.id,
            token: token
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
    }
};

// Connexion Google OAuth
exports.googleAuth = async (req, res) => {
    try {
        let { email, name, google_id, avatar_url, access_token } = req.body;

        // Si l'email n'a pas été envoyé directement, le récupérer via l'access_token Google
        if (!email && access_token) {
            try {
                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${access_token}` }
                });
                if (response.ok) {
                    const googleData = await response.json();
                    email = googleData.email;
                    name = googleData.name || googleData.given_name;
                    avatar_url = googleData.picture;
                    google_id = googleData.sub;
                }
            } catch (googleErr) {
                console.error('Erreur validation Google access_token:', googleErr);
            }
        }

        if (!email) {
            return res.status(400).json({ message: "L'adresse email Google est requise." });
        }

        const { data: users, error: searchError } = await db
            .from('users')
            .select('*')
            .eq('email', email);

        if (searchError) {
            console.error('Erreur Supabase lors de la recherche Google:', searchError);
            return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
        }

        let user = users && users.length > 0 ? users[0] : null;

        if (!user) {
            const baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : email.split('@')[0];
            const username = (baseUsername || 'user') + '_' + Math.floor(1000 + Math.random() * 9000);
            const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);

            const { data: newUser, error: createError } = await db
                .from('users')
                .insert([{
                    email,
                    username,
                    full_name: name || username,
                    password: hashedPassword,
                    avatar: avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                }])
                .select()
                .single();

            if (createError) {
                console.error('Erreur création compte Google:', createError);
                return res.status(500).json({ message: 'Erreur lors de la création du compte.' });
            }
            user = newUser;
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.password;
        return res.status(200).json({
            message: 'Connexion réussie.',
            userId: user.id,
            token,
            user
        });
    } catch (error) {
        console.error('Erreur Google Auth:', error);
        res.status(500).json({ message: "Erreur lors de l'authentification Google." });
    }
};
