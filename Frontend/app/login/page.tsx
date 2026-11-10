"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Eye, EyeOff, AlertCircle, ExternalLink, KeyRound, X } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Authentification officielle Google
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showClientIdPrompt, setShowClientIdPrompt] = useState(false);
  const [customClientId, setCustomClientId] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const ENV_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleGoogleAuth = () => {
    setError('');

    // Récupérer le Client ID depuis les variables d'environnement ou le localStorage
    const activeClientId = ENV_CLIENT_ID || customClientId || (typeof window !== 'undefined' ? localStorage.getItem('google_client_id') || '' : '');

    if (!activeClientId) {
      // Si aucun Client ID n'est configuré, afficher le panneau d'aide avec saisie directe
      setShowClientIdPrompt(true);
      return;
    }

    triggerRealGoogleOAuth(activeClientId);
  };

  const triggerRealGoogleOAuth = (clientId: string) => {
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      setError("Le service officiel Google Identity est en cours de chargement... Veuillez réessayer dans quelques secondes.");
      return;
    }

    setIsGoogleLoading(true);

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            console.error('Erreur retournée par Google:', tokenResponse);
            setError(`Erreur Google (${tokenResponse.error}) : ${tokenResponse.error_description || ''}`);
            setIsGoogleLoading(false);
            return;
          }

          try {
            // Envoi du jeton Google au backend NOVA : c'est le serveur qui le vérifie
            // auprès de Google, puis connecte ou crée le compte.
            const backendRes = await fetch(`${API_URL}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_token: tokenResponse.access_token }),
            });

            const data = await backendRes.json();

            if (!backendRes.ok) {
              throw new Error(data.message || "Erreur lors de l'enregistrement de votre compte.");
            }

            // Mémorisation du client_id validé pour les prochaines connexions
            if (typeof window !== 'undefined') {
              localStorage.setItem('google_client_id', clientId);
            }

            setShowClientIdPrompt(false);
            login(data.token);
          } catch (err: any) {
            setError(err.message || "Erreur de synchronisation avec le serveur");
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });

      // Déclenche l'ouverture de la VRAIE fenêtre popup officielle de Google
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      console.error(err);
      setIsGoogleLoading(false);
      setError("Impossible d'initialiser la fenêtre officielle Google. Vérifiez la validité de votre Google Client ID.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password } 
        : { username, email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      if (isLogin) {
        login(data.token);
      } else {
        setIsLogin(true);
        setError('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Chargement du SDK officiel Google Identity Services */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
      />

      <div className="max-w-[850px] w-full grid grid-cols-1 md:grid-cols-2 bg-[#0a0a0a] rounded-lg overflow-hidden min-h-[600px] border-y md:border border-[#262626]">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 border-r border-[#262626]">
          {/* Logo NOVA */}
          <div className="mb-6 w-full flex justify-start">
             <Image src="/NOVA.png" alt="NOVA Logo" width={56} height={56} className="w-14 h-14 object-contain" />
          </div>
          
          <h1 className="text-white text-[28px] font-semibold text-left leading-[1.3] mb-12 w-full pr-4">
            Découvrez des moments du quotidien de vos <span className="text-[#E1306C]">ami(e)s</span> <span className="text-[#C13584]">proches.</span>
          </h1>

          {/* Collage Images */}
          <div className="relative w-full h-56 flex justify-center items-center">
            <div className="absolute top-2 left-4 w-36 h-48 bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl transform -rotate-12 border border-[#363636] z-10 transition-transform duration-500 hover:z-30 hover:scale-105 hover:rotate-0">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop" alt="Friend 1" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-2 right-4 w-36 h-48 bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl transform rotate-6 border border-[#363636] z-20 transition-transform duration-500 hover:scale-105 hover:rotate-0">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop" alt="Friend 2" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-52 bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl border border-[#363636] z-15 transform rotate-3 transition-transform duration-500 hover:z-30 hover:scale-105 hover:rotate-0">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop" alt="Friend 3" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col items-center justify-between py-10 px-8 relative">
          <div className="w-full max-w-[320px] flex flex-col justify-center h-full">
            
            <div className="w-full text-[#F5F5F5] mb-8 flex items-center">
              <button 
                type="button"
                className="mr-3 p-1 hover:bg-[#262626] rounded-full transition-colors -ml-2" 
                onClick={() => router.push('/')}
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="font-semibold text-[17px]">
                {isLogin ? 'Se connecter à NOVA' : 'Créer un compte NOVA'}
              </h2>
            </div>
            
            <form className="w-full space-y-3.5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="relative">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur" 
                    className="w-full bg-[#121212] border border-[#363636] text-[13px] rounded-lg px-4 py-[14px] focus:outline-none focus:border-zinc-500 text-[#F5F5F5] placeholder-[#737373] transition-colors"
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse e-mail" 
                  className="w-full bg-[#121212] border border-[#363636] text-[13px] rounded-lg px-4 py-[14px] focus:outline-none focus:border-zinc-500 text-[#F5F5F5] placeholder-[#737373] transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe" 
                  className="w-full bg-[#121212] border border-[#363636] text-[13px] rounded-lg px-4 py-[14px] pr-12 focus:outline-none focus:border-zinc-500 text-[#F5F5F5] placeholder-[#737373] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#F5F5F5] transition-colors p-1 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className={`text-[13px] text-center p-2 rounded ${error.includes('réussie') ? 'text-green-500 bg-green-950/20' : 'text-red-400 bg-red-950/20 border border-red-900/30'}`}>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                className="w-full bg-[#005C98] hover:bg-[#0084cc] text-[#F5F5F5] font-semibold py-[12px] flex items-center justify-center rounded-full mt-2 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={(!email || !password || (!isLogin && !username)) || isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                {isLogin ? 'Se connecter' : 'S\'inscrire'}
              </button>
            </form>

            <div className="text-center mt-6 mb-8 text-sm">
                {isLogin && (
                  <button className="text-[#F5F5F5] font-semibold hover:text-white transition-colors">
                    Mot de passe oublié ?
                  </button>
                )}
            </div>

            {/* Vrai Bouton Google Officiel */}
            <div className="w-full">
              <button 
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full bg-transparent border border-[#363636] text-[#E0E0E0] hover:bg-[#262626] transition-colors py-[12px] rounded-full flex items-center justify-center font-semibold text-sm disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2 text-zinc-400" />
                ) : (
                  <svg className="w-[18px] h-[18px] mr-2.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                {isLogin ? 'Se connecter avec Google' : 'S\'inscrire avec Google'}
              </button>
            </div>
            
            <div className="w-full mt-3">
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="w-full bg-transparent border border-[#363636] text-[#0095f6] hover:bg-[#262626] transition-colors py-[12px] rounded-full font-semibold text-sm"
              >
                {isLogin ? 'Créer un nouveau compte' : 'Déjà un compte ? Se connecter'}
              </button>
            </div>
            
          </div>
          
          {/* Footer Logo Meta */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center text-[#737373] text-[13px] items-center space-x-1.5">
             <span className="text-[18px] leading-none mb-[2px]">∞</span>
             <span className="font-semibold tracking-wide lowercase text-[15px]">Meta</span>
          </div>
        </div>

      </div>

      {/* Boîte de configuration / activation du vrai Google OAuth */}
      {showClientIdPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-[460px] p-6 shadow-2xl relative text-white">
            <button 
              type="button"
              onClick={() => setShowClientIdPrompt(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  Google Client ID requis
                </h3>
                <p className="text-xs text-zinc-400">
                  Pour ouvrir la vraie fenêtre popup de sélection Google
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Pour que Google affiche sa véritable fenêtre officielle de sélection de compte (<code className="text-blue-400 bg-zinc-900 px-1 py-0.5 rounded">accounts.google.com</code>), Google exige l&apos;identifiant de votre application.
            </p>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 mb-4 text-xs space-y-2">
              <div className="font-semibold text-zinc-200">Comment l&apos;obtenir en 1 minute :</div>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                <li>Allez sur la <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center">Google Cloud Console <ExternalLink size={12} className="ml-1" /></a></li>
                <li>Cliquez sur <strong>Créer des identifiants</strong> &gt; <strong>ID client OAuth</strong></li>
                <li>Type : <strong>Application Web</strong></li>
                <li>Origines JavaScript autorisées : <code className="text-zinc-200 bg-zinc-800 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}</code></li>
              </ol>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (customClientId.trim()) {
                  triggerRealGoogleOAuth(customClientId.trim());
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Collez votre Google Client ID ici :
                </label>
                <input
                  type="text"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  placeholder="ex: 123456789-abcdef.apps.googleusercontent.com"
                  className="w-full bg-[#121212] border border-zinc-700 text-xs rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowClientIdPrompt(false)}
                  className="w-1/3 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={!customClientId.trim() || isGoogleLoading}
                  className="w-2/3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isGoogleLoading ? <Loader2 className="animate-spin w-4 h-4 mr-1.5" /> : null}
                  Lancer Google OAuth
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}