"use client";

import { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface StoryContent {
  id: number;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
}

interface StoryViewerProps {
  userId: number;
  username: string;
  avatar: string;
  onClose: () => void;
  onStoryViewed?: (storyId: number) => void;
}

export function StoryViewer({ userId, username, avatar, onClose, onStoryViewed }: StoryViewerProps) {
  const { token } = useAuth();
  const [stories, setStories] = useState<StoryContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const STORY_DURATION = 5000; // 5 secondes pour une image

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/stories/content/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStories(data);
        }
      } catch (error) {
        console.error("Erreur fetch user stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStories();
  }, [userId, token]);

  // Gestion de la progression
  useEffect(() => {
    if (loading || stories.length === 0) return;
    
    // Marquer comme vue
    const markViewed = async () => {
      try {
        await fetch(`${API_URL}/api/stories/view/${stories[currentIndex].id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (onStoryViewed) onStoryViewed(stories[currentIndex].id);
      } catch (err) {
        console.error("Erreur marquage vue:", err);
      }
    };
    markViewed();

    setProgress(0);
    const activeStory = stories[currentIndex];

    if (activeStory.media_type === 'image') {
      const startTime = Date.now();
      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / STORY_DURATION) * 100;
        
        if (newProgress >= 100) {
          handleNext();
        } else {
          setProgress(newProgress);
        }
      }, 50);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentIndex, stories, loading]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
         <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300 backdrop-blur-sm">
      {/* Background Close Click Area */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[450px] aspect-[9/16] bg-black rounded-none md:rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10">
        
        {/* Top Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-3 flex gap-1 z-30 bg-gradient-to-b from-black/70 to-transparent">
          {stories.map((_, idx) => (
            <div key={idx} className="h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-white transition-all duration-75 ease-linear ${idx < currentIndex ? 'w-full' : idx === currentIndex ? '' : 'w-0'}`}
                  style={{ width: idx === currentIndex ? `${progress}%` : undefined }}
                />
            </div>
          ))}
        </div>

        {/* Header Info */}
        <div className="absolute top-6 left-0 right-0 p-3 flex items-center justify-between z-30">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-lg bg-secondary flex items-center justify-center">
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt={username} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">{username?.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm drop-shadow-lg">{username}</span>
                  <span className="text-white/60 text-[10px]">{new Date(stories[currentIndex]?.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {currentStory?.media_type === 'video' && (
                  <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-white hover:scale-110 transition-transform p-1 bg-black/20 rounded-full">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                )}
                <button onClick={onClose} className="text-white hover:scale-110 transition-transform p-1 bg-black/20 rounded-full">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex items-center justify-center"
                >
                    {currentStory?.media_type === 'video' ? (
                        currentStory.media_url ? (
                          <video 
                              ref={videoRef}
                              src={currentStory.media_url} 
                              autoPlay 
                              muted={isMuted}
                              onTimeUpdate={handleVideoTimeUpdate}
                              onEnded={handleVideoEnded}
                              playsInline
                              className="max-h-full w-full object-contain"
                          />
                        ) : <Loader2 className="animate-spin text-white" />
                    ) : (
                        currentStory?.media_url ? (
                          <img 
                              src={currentStory.media_url} 
                              alt="Story" 
                              className="max-h-full w-full object-contain"
                          />
                        ) : <Loader2 className="animate-spin text-white" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Tap Navigation Controls */}
            <div className="absolute inset-0 flex z-20">
                <div className="flex-1 cursor-pointer" onClick={handlePrev} title="Précédent" />
                <div className="flex-1 cursor-pointer" onClick={handleNext} title="Suivant" />
            </div>
        </div>

      </div>

      {/* Side Navigation Buttons (Desktop) */}
      <button 
        onClick={handlePrev} 
        disabled={currentIndex === 0}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-0 transition-all z-20 border border-white/5"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={handleNext}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-20 border border-white/5"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
}
