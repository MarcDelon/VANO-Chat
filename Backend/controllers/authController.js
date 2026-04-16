const bcrypt = require('bcryptjs'); // Bibliothèque utilisée pour hacher (crypter) les mots de passe par mesure de sécurité
const jwt = require('jsonwebtoken'); // Permet de créer un Token (un badge d'accès) pour garder l'utilisateur connecté sans lui redemander son mot de passe
const db = require('../config/db'); // Notre pool pg vers Supabase

/**
 * Fonction d'inscription (Register)
 * Rôle : Créer un nouvel utilisateur dans la base de données de manière sécurisée.
 */
exports.register = async (req, res) => {
    try {
        // Extraction des données envoyées par le client (le Frontend)
        const { username, email, password } = req.body;

        // ÉTAPE 1 : Vérification des champs requis
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs (username, email, password).' });
        }

        // ÉTAPE 2 : Vérification des doublons dans la Base de Données
        const { data: userByEmail, error: errEmail } = await db.from('users').select('id').eq('email', email);
        const { data: userByUsername, error: errName } = await db.from('users').select('id').eq('username', username);

        if (errEmail || errName) {
            console.error('Erreur Supabase lors de la vérification:', errEmail || errName);
            return res.status(500).json({ message: 'Erreur serveur lors de la vérification.' });
        }

        if ((userByEmail && userByEmail.length > 0) || (userByUsername && userByUsername.length > 0)) {
            return res.status(409).json({ message: 'Un utilisateur avec cet email ou ce pseudo existe déjà.' }); // 409 Conflict
        }

        // ÉTAPE 3 : Sécurisation du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ÉTAPE 4 : Insertion du nouveau membre
        const { data: insertData, error: insertError } = await db
            .from('users')
            .insert([{ username, email, password: hashedPassword }])
            .select('id');
            
        if (insertError) {
            console.error('Erreur Supabase lors de l\'insertion:', insertError);
            return res.status(500).json({ message: 'Erreur serveur lors de la création du compte.' });
        }

        // 201 Created : Indique que la ressource a bien été créée
        res.status(201).json({ message: 'Utilisateur créé avec succès !', userId: insertData[0].id });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' }); // 500 Internal Server Error
    }
};

/**
 * Fonction de Connexion (Login)
 * Rôle : Vérifier l'identité de la personne et lui donner un jeton (Token JWT) s'il a le bon mot de passe.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ÉTAPE 1 : Vérification basique
        if (!email || !password) {
            return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe.' });
        }

        // ÉTAPE 2 : Recherche de l'utilisateur
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

        // ÉTAPE 3 : Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' }); // 401 Unauthorized
        }

        // ÉTAPE 4 : Génération du Token JWT
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
