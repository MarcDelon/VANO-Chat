"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface SuggestionUser {
  id: number;
  username: string;
  avatar: string;
  bio: string;
}

export function Suggestions() {
  const { user, token } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState<number[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/users/suggestions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Erreur Suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [token]);

  const handleFollow = async (id: number) => {
    if (!token || followedIds.includes(id)) return;

    try {
      const res = await fetch(`${API_URL}/api/users/follow/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFollowedIds(prev => [...prev, id]);
        toast.success("Vous suivez maintenant cet utilisateur");
      }
    } catch (error) {
      toast.error("Erreur d'abonnement");
    }
  };

  return (
    <div className="sticky top-[84px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#333]">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Your profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#222] flex items-center justify-center text-xl font-bold text-gray-400">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-[14px] font-bold text-white">{user?.username}</div>
            <div className="text-[12px] text-gray-400">{user?.username}</div>
          </div>
        </div>
        <button className="text-[12px] text-[#0095f6] font-semibold hover:text-white transition-colors">
          Basculer
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-bold text-gray-400">Suggestions pour vous</span>
          <button className="text-[12px] font-bold text-white hover:opacity-60 transition-opacity">
            Tout voir
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((sugUser) => (
              <div key={sugUser.id} className="flex items-center justify-between">
                <Link 
                  href={`/profile/${sugUser.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary">
                    {sugUser.avatar ? (
                      <img
                        src={sugUser.avatar}
                        alt={sugUser.username}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 bg-[#222] group-hover:bg-[#333] transition-colors font-bold">
                        {sugUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-white group-hover:text-gray-300 transition-colors">{sugUser.username}</div>
                    <div className="text-[11px] text-gray-500">Suggéré(e) pour vous</div>
                  </div>
                </Link>
                <button 
                  onClick={() => handleFollow(sugUser.id)}
                  className={`text-[12px] font-bold transition-colors ${
                    followedIds.includes(sugUser.id) 
                    ? 'text-gray-500 cursor-default' 
                    : 'text-[#0095f6] hover:text-white'
                  }`}
                >
                  {followedIds.includes(sugUser.id) ? 'Suivi(e)' : 'Suivre'}
                </button>
              </div>
            ))
          ) : (
            <div className="text-[12px] text-gray-500 p-2">Aucune suggestion pour le moment.</div>
          )}
        </div>
      </div>

      <footer className="text-[12px] text-gray-500 space-y-2 uppercase tracking-tight mt-10">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {['À propos', 'Aide', 'Presse', 'API', 'Emplois', 'Confidentialité', 'Conditions'].map(item => (
            <span key={item} className="hover:underline cursor-pointer">{item}</span>
          ))}
        </div>
        <div className="mt-4">© 2026 VANO CHAT PAR NOVA</div>
      </footer>
    </div>
  );
}
