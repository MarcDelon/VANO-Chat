"use client";

import { useState } from 'react';
import { Home, Search, Compass, Heart, MessageCircle, PlusSquare, Menu, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
      <div className="max-w-[975px] mx-auto px-5 h-[60px] flex items-center justify-between">
        <h1 className="text-[28px] font-[400] tracking-tight text-white">VANO chat</h1>

        <div className="hidden md:flex items-center gap-1 bg-secondary rounded-lg px-4 py-2 w-[268px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-[14px] w-full text-white placeholder:text-gray-400"
          />
        </div>

        <nav className="flex items-center gap-6 relative">
          <Link href="/" className={`hover:opacity-60 transition-opacity ${pathname === '/' ? 'text-white' : 'text-gray-400'}`}>
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
          <Link href="/profile" className="hover:opacity-60 transition-opacity">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-600 border-2 ${pathname === '/profile' ? 'border-primary' : 'border-foreground'}`} />
          </Link>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 -right-4 w-80 bg-[#262626] border border-[#333] rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-2">
              <h3 className="font-bold text-white mb-4">Notifications</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-gray-200"><span className="font-bold text-white">alexia.kdm</span> a aimé votre photo.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-gray-200"><span className="font-bold text-white">rick_knd</span> a commencé à vous suivre.</p>
                  <button className="ml-auto bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-bold">Suivre</button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Create Post Modal */}
      {showCreateMenu && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <button onClick={() => setShowCreateMenu(false)} className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X className="w-8 h-8" />
          </button>
          <div className="bg-[#262626] rounded-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="border-b border-[#333] p-4 text-center">
              <h2 className="text-white font-bold text-lg">Créer une publication</h2>
            </div>
            <div className="p-16 flex flex-col items-center justify-center">
              <Upload className="w-20 h-20 text-gray-400 mb-6" />
              <p className="text-white text-xl mb-6">Faites glisser les photos et les vidéos ici</p>
              <button className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl transition-colors">
                Sélectionner sur l'ordinateur
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
