# 🌍 Guide de Déploiement : Vano-Chat

Ce guide vous explique comment mettre votre application en ligne gratuitement en utilisant **Render** (pour le Backend) et **Vercel** (pour le Frontend).

---

## 1. Déploiement du Backend (Serveur API) sur [Render.com](https://render.com)

1. **Créez un compte** sur Render et liez votre compte GitHub.
2. Cliquez sur **"New +"** > **"Web Service"**.
3. Sélectionnez votre dépôt `VANO-Chat`.
4. Configurez les paramètres suivants :
   - **Name** : `vano-chat-api` (ou ce que vous voulez).
   - **Root Directory** : `Backend` (Très important !).
   - **Environment** : `Node`.
   - **Build Command** : `npm install`.
   - **Start Command** : `node server.js`.
5. Cliquez sur **"Advanced"** pour ajouter les **Variables d'Environnement** :
   - `SUPABASE_URL` : (Votre URL Supabase)
   - `SUPABASE_KEY` : (Votre Service Role Key ou Anon Key)
   - `JWT_SECRET` : (Une phrase secrète longue et complexe)
   - `NODE_ENV` : `production`
6. Cliquez sur **"Create Web Service"**.
7. **Notez l'URL** que Render vous donne (ex: `https://vano-chat-api.onrender.com`).

---

## 2. Déploiement du Frontend (Interface) sur [Vercel.com](https://vercel.com)

1. **Créez un compte** sur Vercel et liez votre compte GitHub.
2. Cliquez sur **"Add New"** > **"Project"**.
3. Sélectionnez votre dépôt `VANO-Chat`.
4. Dans la configuration du projet :
   - **Framework Preset** : Sélectionnez `Next.js`.
   - **Root Directory** : Cliquez sur "Edit" et sélectionnez le dossier `Frontend`.
5. Dans la section **"Environment Variables"**, ajoutez :
   - `NEXT_PUBLIC_API_URL` : **Mettez ici l'URL que Render vous a donnée** (ex: `https://vano-chat-api.onrender.com`).
   - `NEXT_PUBLIC_SUPABASE_URL` : (Votre URL Supabase).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : (Votre clé Anon Supabase).
6. Cliquez sur **"Deploy"**.

---

## 3. Mise à jour finale
Une fois que tout est déployé, n'oubliez pas d'aller dans vos paramètres **Supabase** (Authentication > URL Configuration) pour ajouter l'URL de votre site Vercel dans les "Redirect URLs" autorisés.

---
*Bravo ! Votre réseau social est maintenant accessible partout dans le monde !* 🚀
