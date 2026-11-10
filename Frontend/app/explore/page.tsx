"use client";

import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { MessagesFloating } from '../components/MessagesFloating';
import { BottomNav } from '../components/BottomNav';
import { Heart, MessageCircle, Send, Bookmark, Music, Play, Flame, Compass, Sparkles, X, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface ReelItem {
  id: number;
  username: string;
  avatar: string;
  media: string;
  caption: string;
  likes: number;
  comments: number;
  audio: string;
  tag: string;
}

const REELS_DATA: ReelItem[] = [
  {
    id: 101,
    username: "lena.style",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    media: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1080&q=85",
    caption: "Golden hour outfit in Paris ✨🖤 Quel look préférez-vous ? #fashion #paris #ootd",
    likes: 12400,
    comments: 342,
    audio: "Nova Beats - Lo-Fi Summer Chill",
    tag: "Mode"
  },
  {
    id: 102,
    username: "lucas_explorer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    media: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1080&q=85",
    caption: "Le lever de soleil le plus spectaculaire des Alpes 🏔️☀️ À couper le souffle !",
    likes: 28900,
    comments: 890,
    audio: "Original Sound - Mountain Echoes",
    tag: "Voyage"
  },
  {
    id: 103,
    username: "cyber_vibes",
    avatar: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&q=80",
    media: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&q=85",
    caption: "Nouveau setup de dev terminé ! Dark mode activé 🚀⚡ Qu'en pensez-vous ?",
    likes: 18200,
    comments: 412,
    audio: "Synthwave Horizon - Cyber Sound",
    tag: "Tech"
  },
  {
    id: 104,
    username: "chef_nasser",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    media: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=85",
    caption: "Recette secrète : Ramen maison au bouillon mijoté 12h 🍜🤤 Sauvegardez pour tester !",
    likes: 34500,
    comments: 1120,
    audio: "Foodie Vibes - Acoustic Cooking",
    tag: "Food"
  }
];

const EXPLORE_MOSAIC = [
  { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", likes: "14.2K", comments: "312", tag: "Design", isLarge: true },
  { src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", likes: "28.5K", comments: "890", tag: "Voyage" },
  { src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80", likes: "9.8K", comments: "128", tag: "Tech" },
  { src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", likes: "33.1K", comments: "940", tag: "Mode" },
  { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", likes: "18.4K", comments: "450", tag: "Food", isLarge: true },
  { src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", likes: "12.7K", comments: "210", tag: "Voyage" },
  { src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80", likes: "8.2K", comments: "95", tag: "Art" },
  { src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80", likes: "21.6K", comments: "512", tag: "Tech" },
  { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80", likes: "42.0K", comments: "1.2K", tag: "Mode" },
  { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", likes: "15.9K", comments: "340", tag: "Produit" },
  { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80", likes: "11.3K", comments: "188", tag: "Mode" },
  { src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", likes: "55.8K", comments: "2.1K", tag: "Supercar", isLarge: true }
];

const CATEGORIES = ["Tout", "🔥 Tendances", "👗 Mode", "✈️ Voyage", "💻 Tech", "🍕 Food", "🎨 Art"];

export default function ExplorePage() {
  const { token } = useAuth();
  const [activeMode, setActiveMode] = useState<'reels' | 'grid'>('reels');
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [likedReels, setLikedReels] = useState<Record<number, boolean>>({});
  const [reelLikesCount, setReelLikesCount] = useState<Record<number, number>>({
    101: 12400,
    102: 28900,
    103: 18200,
    104: 34500
  });
  const [savedReels, setSavedReels] = useState<Record<number, boolean>>({});
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);

  const toggleReelLike = (id: number) => {
    const isCurrentlyLiked = likedReels[id];
    setLikedReels(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
    setReelLikesCount(prev => ({
      ...prev,
      [id]: isCurrentlyLiked ? prev[id] - 1 : prev[id] + 1
    }));
  };

  const toggleReelSave = (id: number) => {
    const isCurrentlySaved = savedReels[id];
    setSavedReels(prev => ({ ...prev, [id]: !isCurrentlySaved }));
    toast.success(isCurrentlySaved ? "Retiré des enregistrements" : "Ajouté aux enregistrements !");
  };

  const handleShareReel = (username: string) => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success(`Lien du Reel de @${username} copié dans le presse-papiers !`);
  };

  const filteredMosaic = selectedCategory === "Tout" 
    ? EXPLORE_MOSAIC 
    : EXPLORE_MOSAIC.filter(item => selectedCategory.toLowerCase().includes(item.tag.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 pb-24 md:pb-12">
      <Header />

      <main className="pt-[76px] max-w-[1020px] mx-auto px-4">
        {/* Switcher Haut de Page : Reels TikTok vs Grille Instagram */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-2xl border border-white/10 shadow-lg">
            <button
              onClick={() => setActiveMode('reels')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeMode === 'reels' 
                  ? 'bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#ff0844] text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Reels & TikTok
            </button>
            <button
              onClick={() => setActiveMode('grid')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeMode === 'grid' 
                  ? 'story-gradient text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explorer
            </button>
          </div>

          {/* Catégories / Filtres rapides */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-white text-black border-white' 
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MODE 1: REELS / TIKTOK STYLE FEED VERTICAL */}
        {activeMode === 'reels' && (
          <div className="flex flex-col items-center gap-8 max-w-[440px] mx-auto">
            {REELS_DATA.map((reel) => {
              const isLiked = likedReels[reel.id];
              const isSaved = savedReels[reel.id];
              const likes = reelLikesCount[reel.id] || reel.likes;

              return (
                <div 
                  key={reel.id}
                  className="w-full h-[620px] rounded-3xl overflow-hidden relative shadow-2xl border border-white/10 group select-none bg-black"
                >
                  {/* Media principal */}
                  <img 
                    src={reel.media} 
                    alt={reel.caption} 
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient sombre bas pour lisibilité */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

                  {/* Tag thématique haut-gauche */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {reel.tag}
                    </span>
                  </div>

                  {/* Rail d'action vertical à droite (Identique TikTok & Instagram Reels) */}
                  <div className="absolute bottom-6 right-4 z-20 flex flex-col items-center gap-5">
                    {/* Profil Créateur avec badge + */}
                    <div className="relative cursor-pointer group-hover:scale-105 transition-transform">
                      <div className="w-11 h-11 rounded-full story-gradient p-[2px]">
                        <img 
                          src={reel.avatar} 
                          alt={reel.username}
                          className="w-full h-full rounded-full object-cover" 
                        />
                      </div>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ff0844] rounded-full text-white text-[11px] font-bold flex items-center justify-center border-2 border-black">
                        +
                      </div>
                    </div>

                    {/* Like */}
                    <button 
                      type="button"
                      onClick={() => toggleReelLike(reel.id)}
                      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
                        <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#ff0844] text-[#ff0844]' : 'text-white'}`} />
                      </div>
                      <span className="text-[12px] font-bold text-white drop-shadow">
                        {likes.toLocaleString()}
                      </span>
                    </button>

                    {/* Commentaires */}
                    <button 
                      type="button"
                      onClick={() => setActiveModalItem(reel)}
                      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[12px] font-bold text-white drop-shadow">
                        {reel.comments}
                      </span>
                    </button>

                    {/* Sauvegarder */}
                    <button 
                      type="button"
                      onClick={() => toggleReelSave(reel.id)}
                      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
                      </div>
                    </button>

                    {/* Partager */}
                    <button 
                      type="button"
                      onClick={() => handleShareReel(reel.username)}
                      className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                    </button>

                    {/* Disque vinyle musical qui tourne (Signature TikTok) */}
                    <div className="mt-2 w-9 h-9 rounded-full bg-zinc-950 p-1 border border-zinc-700 animate-spin-slow flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-yellow-400 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                      </div>
                    </div>
                  </div>

                  {/* Informations du bas (Auteur, Légende, Musique) */}
                  <div className="absolute bottom-5 left-5 right-20 z-10 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-[15px] hover:underline cursor-pointer">
                        @{reel.username}
                      </span>
                      <button className="text-xs px-2.5 py-0.5 rounded-full border border-white/40 text-white font-medium hover:bg-white/20 transition-colors">
                        Suivre
                      </button>
                    </div>

                    <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed mb-3">
                      {reel.caption}
                    </p>

                    {/* Audio track ticker */}
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="truncate">{reel.audio}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODE 2: GRILLE EXPLORER (INSTAGRAM MOSAIC STYLE) */}
        {activeMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {filteredMosaic.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveModalItem(item)}
                className={`aspect-square relative rounded-xl overflow-hidden cursor-pointer group border border-white/5 bg-zinc-900 ${
                  item.isLarge ? 'md:row-span-2 md:aspect-auto' : ''
                }`}
              >
                <img 
                  src={item.src} 
                  alt={`Explore ${idx}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />

                {/* Overlay hover avec compteurs de likes et commentaires */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Heart className="w-5 h-5 fill-white" />
                    {item.likes}
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    {item.comments}
                  </div>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white border border-white/20">
                    {item.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modal d'aperçu d'un élément sélectionné */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass-surface border border-white/10 rounded-3xl w-full max-w-[480px] overflow-hidden shadow-2xl relative text-white">
            <button 
              type="button"
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-20 p-2 text-white/80 hover:text-white rounded-full bg-black/50 backdrop-blur-md hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative aspect-square w-full bg-black">
              <img 
                src={activeModalItem.media || activeModalItem.src} 
                alt="Aperçu" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-zinc-100">
                  @{activeModalItem.username || 'createur_nova'}
                </span>
                <span className="text-xs text-zinc-400">
                  {activeModalItem.likes || '18K'} mentions J&apos;aime
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                {activeModalItem.caption || "Découvrez les meilleurs moments partagés sur NOVA Social."}
              </p>
              <button
                type="button"
                onClick={() => {
                  toast.success("Publication likée !");
                  setActiveModalItem(null);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00f2fe] via-[#4facfe] to-[#ff0844] text-white font-semibold text-xs transition-opacity hover:opacity-90"
              >
                Aimer la publication
              </button>
            </div>
          </div>
        </div>
      )}

      <MessagesFloating />
      <BottomNav />
    </div>
  );
}
