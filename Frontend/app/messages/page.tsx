"use client";

import { useEffect, useState, useRef } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Search, 
  Phone, 
  Video, 
  Info, 
  Smile, 
  Image as ImageIcon, 
  Send, 
  MoreVertical,
  ChevronLeft,
  Loader2,
  Plus,
  X,
  Trash2,
  Edit2,
  CornerUpLeft
} from 'lucide-react';

interface Conversation {
  id: number;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Nouveaux états
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [convSearchQuery, setConvSearchQuery] = useState('');
  
  // États pour l'édition et suppression
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editValue, setEditValue] = useState('');
  const [mobileMenuMsg, setMobileMenuMsg] = useState<Message | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // 1. Initialiser les conversations
  useEffect(() => {
    console.log("🔍 [VANO-CHAT] API_URL configurée :", API_URL);
    if (token) fetchConversations();
  }, [token]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setConversations(await res.json());
    } catch (err) {
      console.error("Erreur conv:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  // 2. Charger les messages quand un chat est sélectionné
  useEffect(() => {
    if (selectedChat && token) fetchMessages(selectedChat.id);
  }, [selectedChat, token]);

  const fetchMessages = async (contactId: number) => {
    setLoadingMsg(true);
    try {
      const res = await fetch(`${API_URL}/api/messages/${contactId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error("Erreur messages:", err);
    } finally {
      setLoadingMsg(false);
    }
  };

  // 3. Supabase Realtime : Écouter les nouveaux messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
            if (selectedChat && (newMsg.sender_id === selectedChat.id || newMsg.receiver_id === selectedChat.id)) {
                setMessages(prev => [...prev.filter(m => m.id !== newMsg.id), newMsg]);
            }
            fetchConversations();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload: any) => {
          const updatedMsg = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload: any) => {
          const deletedId = payload.old.id;
          setMessages(prev => prev.filter(m => m.id !== deletedId));
          fetchConversations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedChat]);

  // Chargement des amis pour la modale
  useEffect(() => {
    if (showNewChatModal && token) {
      const fetchFriends = async () => {
        setLoadingFriends(true);
        try {
          const res = await fetch(`${API_URL}/api/users/friends`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setFriends(await res.json());
        } catch (err) {
          console.error("Erreur amis:", err);
        } finally {
          setLoadingFriends(false);
        }
      };
      fetchFriends();
    }
  }, [showNewChatModal, token]);

  // Recherche d'utilisateurs
  useEffect(() => {
    if (searchQuery.trim().length > 0 && token) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const res = await fetch(`${API_URL}/api/users/search?q=${searchQuery}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setSearchResults(await res.json());
        } catch (err) {
          console.error("Erreur recherche:", err);
        }
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, token]);

  const handleStartChat = (contact: any) => {
    setShowNewChatModal(false);
    setSearchQuery('');
    
    // Si la conversation existe déjà, on la sélectionne
    const existingConv = conversations.find(c => c.id === contact.id);
    if (existingConv) {
      setSelectedChat(existingConv);
    } else {
      const newConv: Conversation = {
        id: contact.id,
        username: contact.username,
        avatar: contact.avatar,
        lastMessage: '',
        time: new Date().toISOString(),
        unread: false
      };
      setSelectedChat(newConv);
    }
  };

  // Auto-scroll en bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChat || !token) return;

    try {
      const res = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedChat.id,
          message: newMessage.trim()
        })
      });

      if (res.ok) setNewMessage('');
    } catch (err) {
      console.error("❌ [VANO-CHAT] Erreur envoi:", err);
      toast.error("Échec de l'envoi.");
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/messages/${msgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        toast.success("Message supprimé");
      }
    } catch (err) {
      console.error("Erreur delete:", err);
    }
    setMobileMenuMsg(null);
  };

  const handleUpdateMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editingMessage || !editValue.trim() || !token) return;

    try {
      const res = await fetch(`${API_URL}/api/messages/${editingMessage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: editValue.trim() })
      });

      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, message: editValue.trim() } : m));
        setEditingMessage(null);
        setEditValue('');
        toast.success("Message modifié");
      }
    } catch (err) {
      console.error("Erreur update:", err);
    }
  };

  const startLongPress = (msg: Message) => {
    if (msg.sender_id !== user?.id) return;
    longPressTimer.current = setTimeout(() => {
      setMobileMenuMsg(msg);
    }, 500);
  };

  const stopLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Header />
      
      <main className="pt-[60px] flex-1 max-w-[1200px] mx-auto w-full flex overflow-hidden h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <div className={`w-full md:w-[380px] border-r border-[#262626] flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="h-[75px] flex items-center justify-between px-6 border-b border-[#262626]">
            <h2 className="text-xl font-bold tracking-tight">{user?.username}</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowNewChatModal(true)} className="p-2 hover:bg-[#1a1a1a] rounded-full transition-colors">
                <Plus size={20} className="text-gray-400" />
              </button>
              <button className="p-2 hover:bg-[#1a1a1a] rounded-full transition-colors">
                <MoreVertical size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-4 px-6">
            <div className="relative flex items-center bg-[#1a1a1a] rounded-xl px-4 py-2.5 transition-all focus-within:ring-1 focus-within:ring-gray-600">
              <Search size={18} className="text-gray-500 mr-3" />
              <input 
                type="text" 
                value={convSearchQuery}
                onChange={(e) => setConvSearchQuery(e.target.value)}
                placeholder="Rechercher..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingConv ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-700" /></div>
            ) : conversations.length > 0 ? (
                conversations
                 .filter(c => c.username.toLowerCase().includes(convSearchQuery.toLowerCase()))
                 .map((chat) => (
                <div 
                    key={chat.id} 
                    onClick={() => setSelectedChat(chat)}
                    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-[#121212] ${selectedChat?.id === chat.id ? 'bg-[#1a1a1a]' : ''}`}
                >
                    <div className="relative shrink-0">
                    <div className="w-[56px] h-[56px] rounded-full overflow-hidden border border-[#262626]">
                        {chat.avatar ? (
                            <img src={chat.avatar} className="w-full h-full object-cover" alt={chat.username} />
                        ) : (
                            <div className="w-full h-full bg-[#333] flex items-center justify-center text-xl font-bold text-gray-500">
                                {chat.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    {chat.unread && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-black"></div>
                    )}
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                        <p className={`text-[15px] truncate ${chat.unread ? 'font-bold' : 'font-semibold'}`}>{chat.username}</p>
                        <span className="text-[12px] text-gray-500">
                            {format(new Date(chat.time), 'HH:mm')}
                        </span>
                    </div>
                    <p className={`text-sm truncate font-medium ${chat.unread ? 'text-white' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center p-10 text-gray-600 text-sm">Aucune conversation.</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-black ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-[75px] flex items-center justify-between px-6 border-b border-[#262626] backdrop-blur-md bg-black/50 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 mr-1">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#262626]">
                    {selectedChat.avatar ? (
                        <img src={selectedChat.avatar} className="w-full h-full object-cover" alt={selectedChat.username} />
                    ) : (
                        <div className="w-full h-full bg-[#333] flex items-center justify-center font-bold text-gray-500">
                            {selectedChat.username.charAt(0).toUpperCase()}
                        </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] leading-tight">{selectedChat.username}</h3>
                    <p className="text-[12px] text-green-500 font-medium">Actif maintenant</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-gray-400">
                  <button className="hover:text-white transition-colors"><Phone size={20} /></button>
                  <button className="hover:text-white transition-colors"><Video size={20} /></button>
                  <button className="hover:text-white transition-colors"><Info size={22} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {loadingMsg ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-800" /></div>
                ) : (
                    messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[70%] group relative`}
                          onTouchStart={() => startLongPress(msg)}
                          onTouchEnd={stopLongPress}
                          onMouseDown={() => startLongPress(msg)}
                          onMouseUp={stopLongPress}
                          onMouseLeave={stopLongPress}
                        >
                          {/* Desktop Actions (Hover) */}
                          {msg.sender_id === user?.id && (
                            <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                              <button 
                                onClick={() => { setEditingMessage(msg); setEditValue(msg.message); }}
                                className="p-1.5 hover:bg-[#1a1a1a] rounded-full text-gray-500 hover:text-blue-500 transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1.5 hover:bg-[#1a1a1a] rounded-full text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}

                          <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-all active:scale-[0.98] ${
                              msg.sender_id === user?.id 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-[#1a1a1a] text-gray-100 rounded-tl-none border border-[#262626]'
                          }`}>
                              {msg.message}
                          </div>
                          <span className={`text-[10px] text-gray-500 mt-1 block font-medium ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                              {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                        </div>
                    </div>
                    ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input / Edit Mode */}
              <form onSubmit={editingMessage ? handleUpdateMessage : handleSendMessage} className="p-4 px-6 border-t border-[#262626] bg-black">
                {editingMessage && (
                  <div className="flex items-center justify-between mb-2 px-2 bg-blue-600/10 py-1.5 rounded-lg border border-blue-600/20">
                    <div className="flex items-center gap-2 text-blue-500 text-[12px] font-bold">
                       <CornerUpLeft size={14} />
                       Modification en cours
                    </div>
                    <button onClick={() => { setEditingMessage(null); setEditValue(''); }} className="text-gray-500 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-4 bg-[#121212] border border-[#262626] rounded-2xl px-4 py-2 focus-within:border-gray-600 transition-all">
                  <button type="button" className="text-gray-400 hover:text-white transition-colors">
                    <Smile size={22} />
                  </button>
                  <input 
                    type="text" 
                    value={editingMessage ? editValue : newMessage}
                    onChange={(e) => editingMessage ? setEditValue(e.target.value) : setNewMessage(e.target.value)}
                    placeholder={editingMessage ? "Modifier le message..." : "Envoyer un message..."} 
                    className="bg-transparent border-none outline-none text-[15px] flex-1 py-1 text-white placeholder:text-gray-600"
                  />
                  <div className="flex items-center gap-3">
                    {editingMessage ? (
                      <button type="submit" className="text-blue-500 font-bold text-[15px] hover:text-blue-400 transition-colors uppercase tracking-tight pr-1">
                        Enregistrer
                      </button>
                    ) : (
                      <>
                        {!newMessage ? (
                          <>
                            <button type="button" className="text-gray-400 hover:text-white transition-colors">
                              <ImageIcon size={22} />
                            </button>
                            <button type="button" className="text-gray-400 hover:text-white transition-colors">
                              <Send size={22} className="-rotate-45" />
                            </button>
                          </>
                        ) : (
                          <button type="submit" className="text-blue-500 font-bold text-[15px] hover:text-blue-400 transition-colors uppercase tracking-tight pr-1">
                            Envoyer
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-black to-[#050505]">
              <div className="w-24 h-24 bg-gradient-to-br from-[#1a1a1a] to-black border border-[#262626] rounded-full flex items-center justify-center mb-6 shadow-2xl">
                 <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center">
                   <img src="/NOVA.png" alt="Logo" className="w-10 h-10 object-contain" />
                 </div>
              </div>
              <h2 className="text-white text-2xl font-bold mb-3 tracking-tight">Vos messages directs</h2>
              <p className="text-gray-500 mb-8 max-w-sm text-[15px] leading-relaxed">
                Commencez à envoyer des messages privés, des photos ou lancez une discussion de groupe avec vos amis.
              </p>
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-blue-600/20 active:scale-95 text-sm uppercase tracking-wider"
              >
                Envoyer un message
              </button>
            </div>
          )}
        </div>
      </main>

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#121212] w-full max-w-md rounded-2xl border border-[#262626] shadow-2xl overflow-hidden flex flex-col h-[60vh] max-h-[500px]">
            <div className="flex items-center justify-between p-4 border-b border-[#262626]">
              <h3 className="text-lg font-bold text-white">Nouveau message</h3>
              <button onClick={() => {setShowNewChatModal(false); setSearchQuery('');}} className="p-1 hover:bg-[#262626] rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-[#262626]">
                <div className="flex items-center bg-[#1a1a1a] rounded-xl px-4 py-2.5 border border-[#262626] focus-within:border-gray-500 transition-colors">
                  <span className="text-gray-400 mr-3 text-sm font-medium">À :</span>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un utilisateur..." 
                    autoFocus
                    className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-gray-600"
                  />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {searchQuery.trim().length > 0 ? (
                <>
                  <div className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Résultats</div>
                  {searchResults.map(u => (
                    <div key={u.id} onClick={() => handleStartChat(u)} className="flex items-center gap-3 p-3 hover:bg-[#1a1a1a] rounded-xl cursor-pointer transition-colors">
                        <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-[#333] overflow-hidden border border-[#262626]">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{u.username.charAt(0).toUpperCase()}</div>}
                        </div>
                        <div className="text-[15px] font-semibold text-white">{u.username}</div>
                    </div>
                  ))}
                  {searchResults.length === 0 && <div className="p-8 text-center text-[13px] text-gray-500">Aucun résultat.</div>}
                </>
              ) : (
                <>
                  <div className="px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Suggestions</div>
                  {loadingFriends ? (
                     <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-600" /></div>
                  ) : friends.length > 0 ? friends.map(f => (
                    <div key={f.id} onClick={() => handleStartChat(f)} className="flex items-center gap-3 p-3 hover:bg-[#1a1a1a] rounded-xl cursor-pointer transition-colors">
                        <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-[#333] overflow-hidden border border-[#262626]">
                            {f.avatar ? <img src={f.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{f.username.charAt(0).toUpperCase()}</div>}
                        </div>
                        <div className="text-[15px] font-semibold text-white">{f.username}</div>
                    </div>
                  )) : (
                     <div className="p-8 text-center text-[13px] text-gray-500">Aucune suggestion disponible.</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE OPTIONS MODAL (LONG PRESS) */}
      {mobileMenuMsg && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuMsg(null)}>
          <div className="bg-[#121212] w-full rounded-t-3xl border-t border-[#262626] p-6 pb-10 animate-in slide-in-from-bottom-full" onClick={e => e.stopPropagation()}>
             <div className="w-12 h-1.5 bg-[#262626] rounded-full mx-auto mb-6"></div>
             <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 px-2">Options du message</p>
             <div className="space-y-2">
                <button 
                  onClick={() => { setEditingMessage(mobileMenuMsg); setEditValue(mobileMenuMsg.message); setMobileMenuMsg(null); }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-2xl transition-colors text-white font-semibold"
                >
                   <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500"><Edit2 size={18} /></div>
                   Modifier le message
                </button>
                <button 
                  onClick={() => handleDeleteMessage(mobileMenuMsg.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#1a1a1a] rounded-2xl transition-colors text-red-500 font-semibold"
                >
                   <div className="w-10 h-10 bg-red-600/10 rounded-full flex items-center justify-center text-red-500"><Trash2 size={18} /></div>
                   Supprimer pour tout le monde
                </button>
             </div>
             <button onClick={() => setMobileMenuMsg(null)} className="w-full mt-4 p-4 text-gray-400 font-medium">Annuler</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}

