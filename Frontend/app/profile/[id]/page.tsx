"use client";

import { useEffect, useState, use } from 'react';
import { Settings, Grid, Bookmark, UserSquare, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Header } from '../../components/Header';
import { MessagesFloating } from '../../components/MessagesFloating';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type TabType = 'posts' | 'saved' | 'tagged';

interface ProfileData {
  id: number;
  username: string;
  avatar: string;
  bio: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing: boolean;
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user: currentUser, token, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [tabData, setTabData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showMiniChat, setShowMiniChat] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/login');
      return;
    }

    // Si on regarde notre propre profil, on redirige vers /profile (facultatif mais propre)
    if (currentUser && id === currentUser.id.toString()) {
       router.replace('/profile');
       return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/profile/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          toast.error("Utilisateur introuvable");
          router.push('/feed');
        }
      } catch (error) {
        console.error("Erreur profil:", error);
      }
    };

    fetchProfile();
  }, [id, token, authLoading, currentUser]);

  useEffect(() => {
    const fetchTabData = async () => {
      if (!token || !profile) return;
      
      setLoading(true);
      try {
        let endpoint = `${API_URL}/api/posts/user/${id}`;
        // Pour les profils tiers, on ne peut voir que les posts (et pas leurs saved/tagged par défaut sur Insta)
        if (activeTab === 'posts') {
            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTabData(data);
            }
        } else {
            setTabData([]); // Placeholder pour saved/tagged tiers
        }
      } catch (error) {
        console.error("Erreur tabs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) fetchTabData();
  }, [profile, activeTab, token]);

  const handleFollow = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);

    try {
      const method = profile.isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/api/users/follow/${id}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const newIsFollowing = !profile.isFollowing;
        setProfile({ 
          ...profile, 
          isFollowing: newIsFollowing,
          stats: {
            ...profile.stats,
            followers: newIsFollowing ? profile.stats.followers + 1 : profile.stats.followers - 1
          }
        });
        toast.success(profile.isFollowing ? "Désabonné" : "Abonnement réussi");
      }
    } catch (error) {
      toast.error("Erreur lors de l'action");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleContact = () => {
    // On déclenche l'ouverture de la messagerie flottante pour cet utilisateur
    // On passe l'info via un événement custom ou via le state local si on modifie le composant
    window.dispatchEvent(new CustomEvent('open-mini-chat', { detail: profile }));
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 text-primary animate-spin" />
           <p className="text-gray-400 animate-pulse">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark pb-20">
      <Header />
      
      <main className="pt-[90px] max-w-[975px] mx-auto px-5 text-white">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row mb-12 gap-8 md:gap-24 md:mx-16 items-center md:items-start text-center md:text-left">
          <div className="shrink-0">
            <div className="w-36 h-36 rounded-full overflow-hidden border border-[#333] shadow-xl">
              {profile.avatar ? (
                <img src={profile.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-4xl font-bold text-gray-500 uppercase">
                  {profile.username.charAt(0)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col w-full md:mt-2">
            <div className="flex flex-col md:flex-row items-center gap-5 mb-6">
              <h2 className="text-xl font-light tracking-wide">{profile.username}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    profile.isFollowing 
                    ? 'bg-[#363636] text-white hover:bg-[#262626]' 
                    : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'
                  }`}
                >
                  {followLoading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : profile.isFollowing ? 'Suivi(e)' : 'Suivre'}
                </button>
                <button 
                  onClick={handleContact}
                  className="bg-[#363636] hover:bg-[#262626] border border-[#444] rounded-lg px-6 py-1.5 text-sm font-bold transition-colors"
                >
                  Contacter
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-10 mb-6 text-[15px]">
              <span><strong>{profile.stats.posts}</strong> publications</span>
              <span><strong>{profile.stats.followers}</strong> followers</span>
              <span><strong>{profile.stats.following}</strong> suivi(e)s</span>
            </div>
            
            <div className="text-[14px]">
              <p className="font-semibold mb-1">{profile.username}</p>
              <p className="text-gray-300 max-w-sm line-clamp-3">{profile.bio || "Pas encore de bio."}</p>
            </div>
          </div>
        </div>

        {/* Divider & Tabs */}
        <div className="border-t border-[#262626] mt-10">
          <div className="flex justify-center gap-14 uppercase text-xs font-semibold text-gray-400 tracking-widest relative -top-[1px]">
            <div 
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-4 cursor-pointer transition-colors ${activeTab === 'posts' ? 'border-t border-white text-white' : 'hover:text-white'}`}
            >
              <Grid className="w-3 h-3" />
              <span>Publications</span>
            </div>
            {/* Saved/Tagged are usually private on other's profiles or handled differently */}
            <div className={`flex items-center gap-2 py-4 text-gray-600 cursor-not-allowed`}>
              <Bookmark className="w-3 h-3" />
              <span>Enregistrements</span>
            </div>
            <div className={`flex items-center gap-2 py-4 text-gray-600 cursor-not-allowed`}>
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
                    <div key={post.id} className="aspect-square bg-secondary relative group cursor-pointer overflow-hidden">
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
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <Grid size={48} className="mb-4 opacity-20" />
                <h3 className="text-xl font-bold mb-1">Aucune publication</h3>
                <p>Cet utilisateur n'a pas encore partagé de photos.</p>
            </div>
        )}

      </main>

      <MessagesFloating />
    </div>
  );
}
