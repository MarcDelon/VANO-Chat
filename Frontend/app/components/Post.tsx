import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface PostProps {
  username: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  timeAgo: string;
}

export function Post({ username, avatar, image, likes, caption, timeAgo }: PostProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg mb-5 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 p-[2px]">
            <img
              src={avatar}
              alt={username}
              className="w-full h-full rounded-full object-cover border-2 border-card"
            />
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
        <img
          src={image}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLiked(!liked)}
              className="hover:opacity-60 transition-opacity"
            >
              <Heart
                className={`w-6 h-6 ${liked ? 'fill-red-500 stroke-red-500' : 'text-white'}`}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="hover:opacity-60 transition-opacity"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="hover:opacity-60 transition-opacity"
            >
              <Send className="w-6 h-6 text-white" />
            </motion.button>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSaved(!saved)}
            className="hover:opacity-60 transition-opacity"
          >
            <Bookmark
              className={`w-6 h-6 ${saved ? 'fill-white text-white' : 'text-white'}`}
            />
          </motion.button>
        </div>

        <div className="mb-2">
          <span className="text-[14px] text-white">{likes.toLocaleString()} likes</span>
        </div>

        <div className="mb-2">
          <span className="text-[14px] text-white">
            <strong>{username}</strong> {caption}
          </span>
        </div>

        <button className="text-[14px] text-gray-400">
          View all comments
        </button>

        <div className="text-[12px] text-gray-500 mt-1">
          {timeAgo}
        </div>
      </div>

      <div className="border-t border-border p-3 flex items-center gap-3">
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-white placeholder:text-gray-400"
        />
        <button className="text-accent text-[14px] hover:opacity-60 transition-opacity">
          Post
        </button>
      </div>
    </motion.article>
  );
}
