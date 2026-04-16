"use client";

import { useEffect, useState, useRef } from 'react';
import { Send, MoreHorizontal, X, Minimize2, Maximize2, Loader2, Paperclip, Smile } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function MessagesFloating() {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/messages/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Erreur unread count:", error);
    }
  };

  const fetchChatHistory = async (otherUserId: number) => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Erreur history:", error);
    } finally {
      setLoadingHistory(false);
      fetchUnreadCount(); // Rafraîchir le compteur car les messages sont maintenant marqués comme lus
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatUser || !token) return;
    
    const text = newMessage;
    setNewMessage('');

    try {
      const res = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: activeChatUser.id,
          message: text
        })
      });

      if (!res.ok) throw new Error('Erreur envoi');
      
      // Le temps réel (Supabase) ajoutera le message à la liste s'il est configuré, 
      // sinon on l'ajoute manuellement pour une UX fluide
      const msg = {
        id: Date.now(),
        sender_id: user?.id,
        receiver_id: activeChatUser.id,
        message: text,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, msg]);
    } catch (error) {
      toast.error("Échec de l'envoi");
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    if (!user) return;

    // Écouter l'événement d'ouverture depuis un profil
    const handleOpenChat = (e: any) => {
      setActiveChatUser(e.detail);
      setIsOpen(true);
      fetchChatHistory(e.detail.id);
    };

    window.addEventListener('open-mini-chat', handleOpenChat);

    const channel = supabase
      .channel('mini_chat_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.receiver_id === user.id) {
            fetchUnreadCount();
            // Si on est dans le chat avec cet envoyeur, on ajoute le message
            if (activeChatUser && payload.new.sender_id === activeChatUser.id) {
                setMessages(prev => [...prev, payload.new]);
            }
          }
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel);
      window.removeEventListener('open-mini-chat', handleOpenChat);
    };
  }, [user, token, activeChatUser]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (isOpen && activeChatUser) {
    return (
      <div className="fixed bottom-0 right-6 w-[350px] h-[500px] bg-[#262626] border border-[#333] rounded-t-2xl shadow-2xl z-[100] flex flex-col animate-in slide-in-from-bottom-5">
        {/* Header du Chat */}
        <div className="p-3 border-b border-[#333] flex items-center justify-between bg-[#1a1a1a] rounded-t-2xl">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#444]">
                {activeChatUser.avatar ? (
                  <img src={activeChatUser.avatar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#333] flex items-center justify-center text-xs font-bold text-gray-400">
                    {activeChatUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none">{activeChatUser.username}</div>
                <div className="text-[10px] text-green-500 font-medium">En ligne</div>
              </div>
           </div>
           <div className="flex items-center gap-1">
             <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-[#333] rounded-lg text-gray-400 transition-colors">
                <Minimize2 size={18} />
             </button>
             <button onClick={() => { setIsOpen(false); setActiveChatUser(null); }} className="p-1.5 hover:bg-[#333] rounded-lg text-gray-400 transition-colors">
                <X size={18} />
             </button>
           </div>
        </div>

        {/* Corps des messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
           {loadingHistory ? (
              <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-gray-600" /></div>
           ) : messages.length === 0 ? (
              <div className="text-center pt-20 text-gray-500 text-sm">Début de votre conversation</div>
           ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                     msg.sender_id === user?.id 
                     ? 'bg-[#0095f6] text-white rounded-br-none' 
                     : 'bg-[#363636] text-white rounded-bl-none'
                   }`}>
                     {msg.message}
                   </div>
                </div>
              ))
           )}
        </div>

        {/* Input area */}
        <div className="p-3 border-t border-[#333]">
           <div className="bg-[#1a1a1a] rounded-xl flex items-center px-3 py-2 gap-2 border border-transparent focus-within:border-gray-600 transition-all">
              <Smile size={20} className="text-gray-400 cursor-pointer hover:text-white" />
              <input 
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="bg-transparent border-none outline-none text-sm text-white w-full py-1 h-auto"
              />
              <button 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="text-[#0095f6] font-bold text-sm disabled:opacity-30 hover:text-white transition-colors"
              >
                Envoyer
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 flex items-center bg-[#262626] rounded-full py-2.5 px-5 shadow-2xl border border-[#333] cursor-pointer hover:bg-[#333] transition-colors gap-3 group"
    >
      <div className="relative flex items-center shrink-0">
        <Send className="w-6 h-6 text-white -rotate-45 mb-1 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#262626]">
            {unreadCount}
          </div>
        )}
      </div>
      <span className="font-bold text-white text-[16px] tracking-wide ml-1">Messages</span>
      <div className="ml-1 shrink-0">
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

