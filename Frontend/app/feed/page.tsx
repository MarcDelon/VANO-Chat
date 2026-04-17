"use client";

import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Stories } from '../components/Stories';
import { Post } from '../components/Post';
import { Suggestions } from '../components/Suggestions';
import { MessagesFloating } from '../components/MessagesFloating';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { token, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des posts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPosts();
    }
  }, [token, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pt-[84px] max-w-[975px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_319px] gap-8">
          <div className="w-full max-w-[470px] mx-auto lg:mx-0">
            <div className="mb-6">
              <Stories />
            </div>

            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <Post 
                    key={post.id}
                    id={post.id}
                    username={post.users?.username || 'Utilisateur'}
                    avatar={post.users?.avatar || ''}
                    image={post.image_url}
                    initialLikes={post.likesCount || 0}
                    initialCommentsCount={post.commentsCount || 0}
                    isLiked={post.isLiked || false}
                    isSaved={post.isSaved || false}
                    caption={post.content || ''}
                    timeAgo={formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
                    priority={index < 2}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-card border border-border rounded-lg">
                  <p className="text-gray-400">Aucune publication pour le moment.</p>
                  <p className="text-sm text-gray-500 mt-2">Soyez le premier à partager quelque chose !</p>
                </div>
              )}
            </div>
          </div>

          <aside className="hidden lg:block">
            <Suggestions />
          </aside>
        </div>
      </main>

      <MessagesFloating />
    </div>
  );
}