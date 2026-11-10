"use client";

import { useEffect, useState } from 'react';
import { Settings, Grid, Bookmark, UserSquare, Heart, MessageCircle, Loader2, X, Camera, Check, Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { MessagesFloating } from '../components/MessagesFloating';
import { BottomNav } from '../components/BottomNav';
import { StoryViewer } from '../components/StoryViewer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

type TabType = 'posts' | 'saved' | 'tagged';

export default function ProfilePage() {
  const { user, token, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [tabData, setTabData] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(false);

  // États pour la modification du profil
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleOpenEdit = () => {
    setEditUsername(user?.username || '');
    setEditBio(user?.bio || '');
    setEditAvatar(user?.avatar || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editUsername.trim(),
          bio: editBio.trim(),
          avatar: editAvatar.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erreur lors de la mise à jour');
      }

      toast.success('Profil mis à jour avec succès !');
      setShowEditModal(false);
      // Recharger la page pour actualiser partout
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Erreur de mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 pb-24 md:pb-12">
      <Header />
      
      <main className="pt-[80px] max-w-[975px] mx-auto px-4 md:px-5">
        {/* Profile Header (Instagram & TikTok Dark Aesthetics) */}
        <div className="flex flex-col md:flex-row mb-10 gap-6 md:gap-20 md:mx-12 items-center md:items-start glass-card p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="shrink-0 relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full story-gradient p-[3px] shadow-xl">
              <div className="w-full h-full rounded-full bg-black p-[2px] overflow-hidden">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full" 
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-gray-400 uppercase rounded-full">
                    {user?.username?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleOpenEdit}
              className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg border-2 border-black transition-transform active:scale-90"
              title="Changer d'avatar"
            >
              <Camera size={14} />
            </button>
          </div>
          
          <div className="flex flex-col w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-white">@{user?.username}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleOpenEdit}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl px-4 py-1.5 text-xs font-semibold transition-colors text-zinc-200"
                >
                  Modifier le profil
                </button>
                <button 
                  onClick={handleOpenEdit}
                  className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center md:justify-start gap-8 mb-4 text-sm">
              <div className="text-center md:text-left">
                <span className="font-bold text-white text-base block">{stats.posts}</span>
                <span className="text-xs text-zinc-400">publications</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-bold text-white text-base block">{stats.followers}</span>
                <span className="text-xs text-zinc-400">followers</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-bold text-white text-base block">{stats.following}</span>
                <span className="text-xs text-zinc-400">suivi(e)s</span>
              </div>
            </div>
            
            <div className="text-xs">
              <p className="font-semibold text-zinc-100 mb-1">{user?.username}</p>
              <p className="text-zinc-300 max-w-md leading-relaxed whitespace-pre-line">
                {user?.bio || "Aucune bio pour le moment. Cliquez sur 'Modifier le profil' pour en ajouter une ! ✨"}
              </p>
            </div>
          </div>
        </div>

        {/* Highlights Stories */}
        <div className="flex gap-6 mb-10 overflow-x-auto pb-2 px-2 md:mx-6 no-scrollbar">
          {['Voyages ✈️', 'Moments 📸', 'Musique 🎵', 'Projets 💻'].map((title, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
              <div className="w-16 h-16 rounded-full border border-white/20 bg-zinc-900 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-xl">
                  {i === 0 ? '🌍' : i === 1 ? '✨' : i === 2 ? '🎧' : '🚀'}
                </div>
              </div>
              <span className="text-[11px] text-zinc-300 font-medium">{title}</span>
            </div>
          ))}
        </div>

        {/* Divider & Tabs */}
        <div className="border-t border-white/10 mb-4">
          <div className="flex justify-center gap-12 list-none uppercase text-xs font-semibold text-zinc-400 tracking-wider">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-3.5 cursor-pointer border-t-2 transition-all ${
                activeTab === 'posts' ? 'border-white text-white font-bold' : 'border-transparent hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Publications</span>
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 py-3.5 cursor-pointer border-t-2 transition-all ${
                activeTab === 'saved' ? 'border-white text-white font-bold' : 'border-transparent hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Enregistrements</span>
            </button>
            <button 
              onClick={() => setActiveTab('tagged')}
              className={`flex items-center gap-2 py-3.5 cursor-pointer border-t-2 transition-all ${
                activeTab === 'tagged' ? 'border-white text-white font-bold' : 'border-transparent hover:text-white'
              }`}
            >
              <UserSquare className="w-3.5 h-3.5" />
              <span>Identifié</span>
            </button>
          </div>
        </div>

        {/* Grid Posts */}
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          </div>
        ) : tabData.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {tabData.map((post) => (
              <div 
                key={post.id} 
                className="aspect-square bg-zinc-900 relative group cursor-pointer overflow-hidden rounded-xl border border-white/5"
              >
                <img 
                  src={post.image_url} 
                  alt="Post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                    <Heart className="w-4 h-4 fill-white" /> {post.likesCount || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                    <MessageCircle className="w-4 h-4 fill-white" /> {post.commentsCount || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-3xl border border-white/10 p-8 my-4">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center mb-4 text-zinc-400 border border-white/10">
              {activeTab === 'posts' ? <Grid size={24} /> : activeTab === 'saved' ? <Bookmark size={24} /> : <UserSquare size={24} />}
            </div>
            <h3 className="text-lg font-bold mb-1 text-white">
              {activeTab === 'posts' ? 'Partagez vos photos & vidéos' : activeTab === 'saved' ? 'Enregistrements' : 'Photos avec vous'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mb-4">
              {activeTab === 'posts' 
                ? 'Lorsque vous publiez du contenu, il apparaît sur votre profil personnel.' 
                : activeTab === 'saved' 
                ? 'Sauvegardez des photos ou des vidéos pour les retrouver facilement plus tard.' 
                : 'Les publications dans lesquelles vous êtes mentionné apparaîtront ici.'}
            </p>
            {activeTab === 'posts' && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('nova:open-create'))}
                className="px-5 py-2 rounded-full story-gradient text-white text-xs font-semibold shadow-lg hover:opacity-90 transition-opacity"
              >
                Créer une publication
              </button>
            )}
          </div>
        )}

      </main>

      {/* Modal Modification de Profil (100% Fonctionnelle) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-surface border border-white/10 rounded-3xl w-full max-w-[440px] p-6 shadow-2xl relative text-white">
            <button 
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold mb-4 text-zinc-100">
              Modifier votre profil
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Pseudo */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-[#121212] border border-zinc-700 text-xs rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Bio / Description
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Décrivez-vous en quelques mots..."
                  rows={3}
                  className="w-full bg-[#121212] border border-zinc-700 text-xs rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Avatar URL ou choix */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Photo de profil (URL)
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#121212] border border-zinc-700 text-xs rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Avatars prédéfinis en 1 clic */}
              <div>
                <span className="block text-[11px] text-zinc-400 mb-2">Ou choisissez un avatar tendance :</span>
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
                    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&q=80",
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
                    "https://api.dicebear.com/7.x/bottts/svg?seed=nova1",
                    "https://api.dicebear.com/7.x/bottts/svg?seed=nova2"
                  ].map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setEditAvatar(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 transition-transform hover:scale-110 ${
                        editAvatar === url ? 'border-blue-500 scale-105' : 'border-zinc-700'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-1.5" /> : null}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MessagesFloating />
      <BottomNav />
    </div>
  );
}
