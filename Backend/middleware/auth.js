const jwt = require('jsonwebtoken');

/**
 * Middleware d'Authentification
 * Vérifie la présence et la validité du Token JWT dans les en-têtes de la requête.
 * Si valide, ajoute l'ID de l'utilisateur (userId) à l'objet req.user.
 */
module.exports = (req, res, next) => {
    try {
        // 1. Vérifier si l'en-tête Authorization existe
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
        }

        // 2. Extraire le token (format attendu: "Bearer <token>")
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Format de token invalide (Bearer token attendu).' });
        }

        // 3. Vérifier le token avec la clé Secrète
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Extraire le userId et l'attacher à la requête
        req.user = {
            id: decodedToken.userId
        };

        next(); // On passe au middleware/contrôleur suivant
    } catch (error) {
        console.error('Erreur Auth Middleware:', error.message);
        res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
};
