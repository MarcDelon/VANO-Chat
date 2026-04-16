"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      <div className="max-w-[850px] w-full grid grid-cols-1 md:grid-cols-2 bg-[#0a0a0a] rounded-lg overflow-hidden h-[600px] border-y md:border border-[#262626]">
        
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
              <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&fit=crop" alt="Friend 1" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-2 right-4 w-36 h-48 bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl transform rotate-6 border border-[#363636] z-20 transition-transform duration-500 hover:scale-105 hover:rotate-0">
              <img src="https://images.unsplash.com/photo-1506869640319-fea1a275306c?w=400&fit=crop" alt="Friend 2" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-52 bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl border border-[#363636] z-15 transform rotate-3 transition-transform duration-500 hover:z-30 hover:scale-105 hover:rotate-0">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&fit=crop" alt="Friend 3" className="w-full h-full object-cover" />
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
                <div className={`text-[13px] text-center ${error.includes('réussie') ? 'text-green-500' : 'text-red-500'}`}>
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

            <div className="w-full">
              <button className="w-full bg-transparent border border-[#363636] text-[#E0E0E0] hover:bg-[#262626] transition-colors py-[12px] rounded-full flex items-center justify-center font-semibold text-sm">
                <svg className="w-[18px] h-[18px] mr-2 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {isLogin ? 'Se connecter avec Facebook' : 'S\'inscrire avec Facebook'}
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
    </div>
  );
}
