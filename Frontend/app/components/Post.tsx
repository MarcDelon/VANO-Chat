import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, X, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface PostProps {
  id: number;
  username: string;
  avatar: string;
  image: string;
  initialLikes: number;
  initialCommentsCount: number;
  caption: string;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
  priority?: boolean;
}

export function Post({ 
  id, 
  username, 
  avatar, 
  image, 
  initialLikes, 
  initialCommentsCount,
  caption, 
  timeAgo, 
  isLiked = false,
  isSaved = false,
  priority = false
}: PostProps) {
  const { token } = useAuth();
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [saved, setSaved] = useState(isSaved);
  
  // États pour les commentaires
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  
  // États pour le partage
  const [showShareModal, setShowShareModal] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const toggleLike = async () => {
    if (!token) return;
    
    try {
      const method = liked ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/api/posts/like/${id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setLiked(!liked);
        setLikesCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error("Erreur like:", error);
    }
  };

  const toggleSave = async () => {
    if (!token) return;
    
    try {
      const method = saved ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/api/posts/save/${id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setSaved(!saved);
        toast.success(saved ? 'Enregistrement retiré' : 'Publication enregistrée !');
      }
    } catch (error) {
      console.error("Erreur save:", error);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    if (friends.length === 0) fetchFriends();
  };

  const fetchFriends = async () => {
    if (!token) return;
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

  const toggleFriendSelection = (id: number) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const sendPostToFriends = async () => {
    if (selectedFriends.length === 0 || !token) return;
    
    setSending(true);
    const postUrl = `${window.location.origin}/post/${id}`;
    const message = `Regarde cette publication sur NOVA : ${postUrl}`;
    
    try {
      // Envoi séquentiel pour chaque ami sélectionné
      const promises = selectedFriends.map(friendId => 
        fetch(`${API_URL}/api/messages/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ receiverId: friendId, message })
        })
      );
      
      await Promise.all(promises);
      
      toast.success(`Publication partagée avec ${selectedFriends.length} personne${selectedFriends.length > 1 ? 's' : ''} !`);
      setShowShareModal(false);
      setSelectedFriends([]);
    } catch (err) {
      console.error("Erreur partage:", err);
      toast.error("Une erreur est survenue lors du partage.");
    } finally {
      setSending(false);
    }
  };

  const fetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setShowComments(true);
    if (comments.length > 0) return;

    setLoadingComments(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/comment/${id}`);
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (error) {
      console.error("Erreur fetch comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim() || !token) return;

    try {
      const res = await fetch(`${API_URL}/api/posts/comment/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment.trim() })
      });

      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
        setShowComments(true);
      }
    } catch (error) {
      console.error("Erreur add comment:", error);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg mb-5 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 p-[2px] flex items-center justify-center overflow-hidden">
            {avatar ? (
            <Image
                src={avatar}
                alt={username}
                width={32}
                height={32}
                className="w-full h-full rounded-full object-cover border-2 border-card"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {username.charAt(0)}
              </div>
            )}
          </div>
          <span className="text-[14px] text-white">{username}</span>
        </div>
        <button className="hover:opacity-60 transition-opacity">
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>
      </div>

      <motion.div
        className="relative w-full aspect-square bg-secondary overflow-hidden"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={image}
          alt="Post"
          fill
          priority={priority}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleLike}
              className="hover:opacity-60 transition-opacity"
            >
              <Heart
                className={`w-6 h-6 ${liked ? 'fill-red-500 stroke-red-500' : 'text-white'}`}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={fetchComments}
              className="hover:opacity-60 transition-opacity"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="hover:opacity-60 transition-opacity"
            >
              <Send className="w-6 h-6 text-white" />
            </motion.button>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSave}
            className="hover:opacity-60 transition-opacity"
          >
            <Bookmark
              className={`w-6 h-6 ${saved ? 'fill-white text-white' : 'text-white'}`}
            />
          </motion.button>
        </div>

        <div className="mb-2">
          <span className="text-[14px] text-white font-bold">{likesCount.toLocaleString()} likes</span>
        </div>

        <div className="mb-2">
          <span className="text-[14px] text-white">
            <span className="font-bold mr-2">{username}</span> {caption}
          </span>
        </div>

        {commentsCount > 0 && (
          <button onClick={fetchComments} className="text-[14px] text-gray-400 mb-1 hover:underline">
            {showComments ? 'Hide comments' : `View all ${commentsCount} comments`}
          </button>
        )}

        {showComments && (
          <div className="mt-3 space-y-3 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {loadingComments ? (
              <div className="flex justify-center py-2"><Loader2 className="w-5 h-5 animate-spin text-gray-500" /></div>
            ) : comments.map(comment => (
              <div key={comment.id} className="flex gap-3 text-[14px]">
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5">
                  {comment.users?.avatar ? (
                    <img src={comment.users.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-[8px] font-bold text-white uppercase">
                      {comment.users?.username?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-bold text-white mr-2">{comment.users?.username}</span>
                  <span className="text-gray-200">{comment.text}</span>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-[12px] text-gray-500 mt-1">
          {timeAgo}
        </div>
      </div>

      <form onSubmit={handleAddComment} className="border-t border-border p-3 flex items-center gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder:text-gray-400"
        />
        <button 
          type="submit"
          disabled={!newComment.trim()}
          className={`text-accent text-[14px] font-bold hover:opacity-60 transition-opacity ${!newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Post
        </button>
      </form>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#121212] w-full max-w-md rounded-2xl border border-[#262626] shadow-2xl overflow-hidden flex flex-col h-[70vh] max-h-[600px]"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#262626]">
              <h3 className="text-lg font-bold text-white">Partager avec</h3>
              <button 
                onClick={() => {setShowShareModal(false); setSelectedFriends([]);}} 
                className="p-1 hover:bg-[#262626] rounded-full transition-colors text-gray-400"
              >
                <X size={22} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {loadingFriends ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-600" /></div>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <div 
                    key={friend.id} 
                    onClick={() => toggleFriendSelection(friend.id)}
                    className="flex items-center justify-between p-3 hover:bg-[#1a1a1a] rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[44px] h-[44px] shrink-0 rounded-full bg-[#333] overflow-hidden border border-[#262626]">
                        {friend.avatar ? (
                          <img src={friend.avatar} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="text-[15px] font-semibold text-white">{friend.username}</div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedFriends.includes(friend.id) 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-[#333] group-hover:border-gray-500'
                    }`}>
                      {selectedFriends.includes(friend.id) && <Check size={14} className="text-white font-bold" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-500">
                  <p className="text-sm">Vous n'avez pas encore d'amis à qui partager.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#262626] bg-[#0a0a0a]">
              <button 
                onClick={sendPostToFriends}
                disabled={selectedFriends.length === 0 || sending}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  selectedFriends.length > 0 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-[#262626] text-gray-500 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  `Envoyer ${selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.article>
  );
}

// Support imports
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
