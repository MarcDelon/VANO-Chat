"use client";

import { useEffect, useState, useRef } from 'react';
import { Home, Search, Compass, Heart, MessageCircle, PlusSquare, Menu, X, Upload, LogOut, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function Header() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // States pour la création de post
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/search?q=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error("Erreur recherche:", error);
      }
    }, 300);

    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, token]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCreatePost = async () => {
    if (!selectedFile || !token) return;

    setIsUploading(true);
    const toastId = toast.loading('Publication en cours...');

    try {
      // 1. Upload vers Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      // 3. Envoyer les données au Backend
      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_url: publicUrl,
          content: caption
        })
      });

      if (!res.ok) throw new Error('Erreur lors de la création du post sur le serveur');

      toast.success('Publication partagée !', { id: toastId });
      setShowCreateMenu(false);
      resetForm();
      
      // Optionnel : Recharger la page pour voir le nouveau post
      window.location.reload();
    } catch (error: any) {
      console.error('Erreur création post:', error);
      toast.error(`Erreur: ${error.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
      <div className="max-w-[975px] mx-auto px-5 h-[60px] flex items-center justify-between">
        <div className="cursor-pointer flex items-center" onClick={() => window.location.href = '/feed'}>
          <img src="/NOVA.png" alt="NOVA Logo" className="h-10 w-auto object-contain" />
        </div>

        <div className="hidden md:flex items-center gap-1 bg-secondary rounded-lg px-4 py-2 w-[268px] relative">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            className="bg-transparent border-none outline-none text-[14px] w-full text-white placeholder:text-gray-400"
          />

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-[120%] left-0 right-0 bg-[#262626] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              {searchResults.map((resUser) => (
                <Link
                  key={resUser.id}
                  href={`/profile/${resUser.id}`}
                  onClick={() => setShowSearchResults(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#333] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary">
                    {resUser.avatar ? (
                      <img src={resUser.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] bg-secondary text-gray-400">
                        {resUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-white font-medium group-hover:text-primary transition-colors">{resUser.username}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="flex items-center gap-6 relative">
          <Link href="/feed" className={`hover:opacity-60 transition-opacity ${pathname === '/feed' ? 'text-white' : 'text-gray-400'}`}>
            <Home className="w-6 h-6" />
          </Link>
          <Link href="/messages" className={`hover:opacity-60 transition-opacity ${pathname === '/messages' ? 'text-white' : 'text-gray-400'}`}>
            <MessageCircle className="w-6 h-6" />
          </Link>
          <button onClick={() => setShowCreateMenu(true)} className="hover:opacity-60 transition-opacity text-white">
            <PlusSquare className="w-6 h-6" />
          </button>
          <Link href="/explore" className={`hover:opacity-60 transition-opacity ${pathname === '/explore' ? 'text-white' : 'text-gray-400'}`}>
            <Compass className="w-6 h-6" />
          </Link>
          <button onClick={() => setShowNotifications(!showNotifications)} className={`hover:opacity-60 transition-opacity ${showNotifications ? 'text-red-500' : 'text-white'}`}>
            <Heart className="w-6 h-6" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)} 
              className="hover:opacity-60 transition-opacity focus:outline-none"
            >
              <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${pathname === '/profile' ? 'border-primary' : 'border-[#363636]'}`}>
                {user?.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-black flex items-center justify-center text-[10px] font-bold text-gray-300">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute top-12 right-0 w-48 bg-[#262626] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                <Link 
                  href="/profile" 
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#333] transition-colors text-sm text-white border-b border-[#333]"
                >
                  Profil
                </Link>
                <button 
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#333] transition-colors text-sm text-red-500 font-semibold"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 -right-4 w-80 bg-[#262626] border border-[#333] rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-2">
              <h3 className="font-bold text-white mb-4">Notifications</h3>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400 italic">Aucune nouvelle notification.</p>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Create Post Modal */}
      {showCreateMenu && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <button onClick={() => { setShowCreateMenu(false); resetForm(); }} className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X className="w-8 h-8" />
          </button>
          
          <div className="bg-[#262626] rounded-xl w-full max-w-[400px] md:max-w-4xl overflow-hidden animate-in zoom-in-95 flex flex-col md:flex-row h-[600px]">
            {/* L'image (ou zone d'upload) */}
            <div className="w-full md:w-[60%] bg-black flex items-center justify-center relative border-r border-[#333]">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center p-10 text-center">
                  <Upload className="w-20 h-20 text-gray-400 mb-6" />
                  <p className="text-white text-xl mb-6">Faites glisser les photos ici</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0095f6] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl transition-colors"
                  >
                    Sélectionner sur l'ordinateur
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              )}
            </div>

            {/* Détails et bouton partager */}
            <div className="w-full md:w-[40%] flex flex-col bg-[#262626]">
              <div className="p-4 border-b border-[#333] flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden">
                      {user?.avatar && <img src={user.avatar} className="w-full h-full object-cover" />}
                   </div>
                   <span className="text-white font-bold text-sm">{user?.username}</span>
                </div>
                <button 
                  onClick={handleCreatePost}
                  disabled={!selectedFile || isUploading}
                  className="text-[#0095f6] hover:text-white font-bold disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : 'Partager'}
                </button>
              </div>
              
              <textarea 
                placeholder="Écrire une légende..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full h-full bg-transparent p-4 text-white resize-none outline-none text-sm placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
