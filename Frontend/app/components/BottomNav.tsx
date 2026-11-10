"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Image from 'next/image';

interface BottomNavProps {
  onOpenCreate?: () => void;
}

export function BottomNav({ onOpenCreate }: BottomNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-white/10 px-5 py-2 flex items-center justify-around pb-safe">
      {/* Feed */}
      <Link 
        href="/feed" 
        className={`flex flex-col items-center p-2 rounded-xl transition-all ${
          pathname === '/feed' ? 'text-white scale-110' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Home className="w-6 h-6" strokeWidth={pathname === '/feed' ? 2.5 : 1.75} />
      </Link>

      {/* Explore & Reels */}
      <Link 
        href="/explore" 
        className={`flex flex-col items-center p-2 rounded-xl transition-all ${
          pathname === '/explore' ? 'text-white scale-110' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Compass className="w-6 h-6" strokeWidth={pathname === '/explore' ? 2.5 : 1.75} />
      </Link>

      {/* Create Button (TikTok & Instagram Style Button) */}
      <button 
        type="button"
        onClick={() => {
          if (onOpenCreate) {
            onOpenCreate();
          } else {
            // Déclenche l'événement global de création
            window.dispatchEvent(new CustomEvent('nova:open-create'));
          }
        }}
        className="relative group p-1 -mt-2 transition-transform active:scale-95"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-lg shadow-pink-500/25 border border-white/20">
          <Plus className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
      </button>

      {/* Messages */}
      <Link 
        href="/messages" 
        className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${
          pathname === '/messages' ? 'text-white scale-110' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <MessageCircle className="w-6 h-6" strokeWidth={pathname === '/messages' ? 2.5 : 1.75} />
      </Link>

      {/* Profile */}
      <Link 
        href="/profile" 
        className={`flex flex-col items-center p-1.5 rounded-full transition-all ${
          pathname === '/profile' ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100'
        }`}
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
          {user?.avatar ? (
            <img src={user.avatar} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-zinc-300" />
          )}
        </div>
      </Link>
    </nav>
  );
}
