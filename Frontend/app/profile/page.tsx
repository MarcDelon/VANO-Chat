"use client";

import { useEffect, useState } from 'react';
import { Settings, Grid, Bookmark, UserSquare, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Header } from '../components/Header';
import { MessagesFloating } from '../components/MessagesFloating';
import { useAuth } from '../context/AuthContext';

type TabType = 'posts' | 'saved' | 'tagged';

export default function ProfilePage() {
  const { user, token, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [tabData, setTabData] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchStats = async () => {
        if (!user || !token) return;
        try {
            const res = await fetch(`${API_URL}/api/users/profile/${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Erreur stats:", error);
        }
    };

    const fetchData = async () => {
      if (!user || !token) return;
      
      setLoading(true);
      try {
        let endpoint = `${API_URL}/api/posts/user/${user.id}`;
        if (activeTab === 'saved') endpoint = `${API_URL}/api/posts/saved`;
        if (activeTab === 'tagged') endpoint = `${API_URL}/api/posts/tagged/${user.id}`;

        const res = await fetch(endpoint, {
          headers: {
             'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setTabData(data);
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchStats();
      fetchData();
    }
  }, [user, token, activeTab, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark pb-20">
      <Header />
      
      <main className="pt-[90px] max-w-[975px] mx-auto px-5 text-white">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row mb-12 gap-8 md:gap-24 md:mx-16 items-center md:items-start">
          <div className="shrink-0 relative">
            <div className="w-36 h-36 rounded-full overflow-hidden border border-[#333]">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-4xl font-bold text-gray-400 uppercase">
                  {user?.username?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col w-full md:mt-2">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-5">
              <h2 className="text-xl font-light tracking-wide">{user?.username}</h2>
              <div className="flex items-center gap-2">
                <button className="bg-[#363636] hover:bg-[#262626] border border-[#444] rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors">
                  Modifier le profil
                </button>
                <button className="p-1 hover:text-gray-400">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-10 mb-5 text-[15px]">
              <span><strong>{stats.posts}</strong> publications</span>
              <span><strong>{stats.followers}</strong> followers</span>
              <span><strong>{stats.following}</strong> suivi(e)s</span>
            </div>
            
            <div className="text-[14px] text-center md:text-left">
              <p className="font-semibold mb-0.5">{user?.username}</p>
              <p className="text-gray-300 max-w-sm">{user?.bio || "Aucune bio pour le moment."}</p>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex gap-8 mb-12 overflow-x-auto pb-4 px-2 md:mx-16 hide-scrollbar">
           {/* Mock highlights */}
          {['À la une', 'Me', 'Music 🎵'].map((title, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
              <div className="w-[82px] h-[82px] rounded-full border border-gray-600 bg-secondary p-1 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-700">☀️</div>
              </div>
              <span className="text-[12px] text-white font-medium">{title}</span>
            </div>
          ))}
        </div>

        {/* Divider & Tabs */}
        <div className="border-t border-[#262626]">
          <div className="flex justify-center gap-14 list-none uppercase text-xs font-semibold text-gray-400 tracking-widest relative -top-[1px]">
            <div 
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-4 cursor-pointer transition-colors ${activeTab === 'posts' ? 'border-t border-white text-white' : 'hover:text-white'}`}
            >
              <Grid className="w-3 h-3" />
              <span>Publications</span>
            </div>
            <div 
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-4 cursor-pointer transition-colors ${activeTab === 'saved' ? 'border-t border-white text-white' : 'hover:text-white'}`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Enregistrements</span>
            </div>
            <div 
              onClick={() => setActiveTab('tagged')}
              className={`flex items-center gap-2 py-4 cursor-pointer transition-colors ${activeTab === 'tagged' ? 'border-t border-white text-white' : 'hover:text-white'}`}
            >
              <UserSquare className="w-3 h-3" />
              <span>Identifié</span>
            </div>
          </div>
        </div>

        {/* Grid Posts */}
        {loading ? (
             <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-gray-700" /></div>
        ) : tabData.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-4 mt-2">
                {tabData.map((post) => (
                    <div key={post.id} className="aspect-square bg-secondary relative group cursor-pointer overflow-hidden pb-[100%]">
                        <img 
                          src={post.image_url} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-white font-bold"><Heart className="w-5 h-5 fill-white" /> 0</div>
                            <div className="flex items-center gap-2 text-white font-bold"><MessageCircle className="w-5 h-5 fill-white" /> 0</div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center mb-4">
                    {activeTab === 'posts' ? <Grid size={32} /> : activeTab === 'saved' ? <Bookmark size={32} /> : <UserSquare size={32} />}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                    {activeTab === 'posts' ? 'Partagez des photos' : activeTab === 'saved' ? 'Enregistrez' : 'Photos de vous'}
                </h3>
                <p className="text-gray-400 max-w-xs">
                    {activeTab === 'posts' ? 'Quand vous partagez des photos, elles apparaîtront sur votre profil.' : activeTab === 'saved' ? 'Enregistrez les photos et vidéos que vous souhaitez revoir.' : 'Quand des personnes vous identifient sur des photos, elles apparaîtront ici.'}
                </p>
            </div>
        )}

      </main>

      <MessagesFloating />
    </div>
  );
}
