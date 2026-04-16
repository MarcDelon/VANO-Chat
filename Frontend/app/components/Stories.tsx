"use client";

import { motion } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { StoryViewer } from './StoryViewer';

interface Story {
  id: number;
  username: string;
  avatar: string;
  lastStoryAt: string;
  latestMediaUrl: string;
  allViewed: boolean;
}

export function Stories() {
  const { user, token } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingUser, setViewingUser] = useState<{ id: number; username: string; avatar: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchStories = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/stories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (error) {
      console.error("Erreur Stories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [token]);

  const handleStoryViewed = (viewedUserId: number) => {
    setStories(prev => prev.map(s => 
      s.id === viewedUserId ? { ...s, allViewed: true } : s
    ));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !token) return;

    setIsUploading(true);
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    const toastId = toast.loading(`Publication de votre story (${mediaType})...`);

    try {
      // 1. Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(`stories/${filePath}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(`stories/${filePath}`);

      // 2. Enregistrer en DB
      const res = await fetch(`${API_URL}/api/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          media_url: publicUrl,
          media_type: mediaType
        })
      });

      if (!res.ok) throw new Error('Erreur serveur lors de la sauvegarde');

      toast.success('Story publiée !', { id: toastId });
      fetchStories(); // Rafraîchir la liste
    } catch (error: any) {
      console.error("Erreur upload story:", error);
      toast.error("Impossible de publier la story", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  const userHasStory = stories.some(s => s.id === user?.id);

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 overflow-hidden relative">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="image/*,video/*" 
        />
        
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {/* User's own story button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0 flex flex-col items-center gap-1"
          >
            <div 
              onClick={() => {
                if (userHasStory) {
                  setViewingUser({ id: user!.id, username: user!.username, avatar: user!.avatar || '' });
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className={`p-[2.5px] rounded-full cursor-pointer transition-transform hover:scale-105 ${userHasStory ? 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' : 'bg-gray-600'}`}
            >
              <div className="p-[3px] bg-card rounded-full relative">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  ) : user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {!isUploading && (
                  <div 
                    className="absolute bottom-0 right-0 w-5 h-5 bg-[#0095f6] border-2 border-card rounded-full flex items-center justify-center text-white z-10 cursor-pointer hover:bg-blue-600 transition-colors"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      fileInputRef.current?.click(); 
                    }}
                  >
                    <Plus size={12} strokeWidth={4} />
                  </div>
                )}
              </div>
            </div>
            <span className="text-[12px] text-gray-400 max-w-[64px] truncate">Votre story</span>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center h-14 px-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-700" />
            </div>
          ) : (
            stories.filter(s => s.id !== user?.id).map((story, index) => (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setViewingUser(story)}
                className="flex-shrink-0 flex flex-col items-center gap-1 group"
              >
                <div className={`p-[2.5px] rounded-full ${story.allViewed ? 'bg-[#333]' : 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'}`}>
                  <div className="p-[3px] bg-card rounded-full border border-black/10">
                    <img
                      src={story.latestMediaUrl || story.avatar || '/default-avatar.png'}
                      alt={story.username}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[12px] text-white max-w-[64px] truncate">
                  {story.username}
                </span>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Story Viewer Overlay - Moved outside of overflow-hidden div */}
      {viewingUser && (
        <StoryViewer 
          userId={viewingUser.id}
          username={viewingUser.username}
          avatar={viewingUser.avatar}
          onStoryViewed={() => handleStoryViewed(viewingUser.id)}
          onClose={() => {
            setViewingUser(null);
            fetchStories(); // Rafraîchir pour le tri définitif
          }}
        />
      )}
    </>
  );
}
