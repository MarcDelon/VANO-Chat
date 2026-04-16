require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Vérification de la présence des clés d'environnement
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn("⚠️ Attention: Les variables SUPABASE_URL ou SUPABASE_ANON_KEY sont manquantes dans votre fichier .env");
}

// URL et clé Anon fournies par l'interface Supabase
// Ces variables pointent vers votre projet en ligne (par exemple : https://eizurlytawzfmvebbxeg.supabase.co)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Création du client officiel Supabase Javascript
// Ce "client" nous permet de dialoguer avec la base de données sans écrire une seule ligne de SQL manuel.
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ SDK Supabase initialisé avec succès !');

module.exports = supabase;
