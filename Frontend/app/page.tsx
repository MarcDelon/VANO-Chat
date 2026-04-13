"use client";

import { Header } from './components/Header';
import { Stories } from './components/Stories';
import { Post } from './components/Post';
import { Suggestions } from './components/Suggestions';
import { MessagesFloating } from './components/MessagesFloating';

const posts = [
  {
    username: 'travel_explorer',
    avatar: 'https://images.unsplash.com/photo-1652549752120-d9beb4c86bd4?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1759200135367-278bd3d2a5f0?w=800&h=800&fit=crop',
    likes: 12847,
    caption: 'View from above 🌆✨',
    timeAgo: '2 HOURS AGO',
  },
  {
    username: 'urban_shots',
    avatar: 'https://images.unsplash.com/photo-1669206053726-bfafe8d4537f?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1771605344175-d2b159281bfa?w=800&h=800&fit=crop',
    likes: 8234,
    caption: 'Golden hour in the city 🌇',
    timeAgo: '5 HOURS AGO',
  },
  {
    username: 'city_vibes',
    avatar: 'https://images.unsplash.com/photo-1648415041078-d5b259c683be?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1764147385325-62900d196d87?w=800&h=800&fit=crop',
    likes: 15623,
    caption: 'Urban jungle 🏙️',
    timeAgo: '8 HOURS AGO',
  },
  {
    username: 'wanderlust_daily',
    avatar: 'https://images.unsplash.com/photo-1675908910500-2dcef146f9cf?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1608817306989-3f755fcbab1b?w=800&h=800&fit=crop',
    likes: 9876,
    caption: 'Aerial perspectives 🚁',
    timeAgo: '12 HOURS AGO',
  },
  {
    username: 'photo_journey',
    avatar: 'https://images.unsplash.com/photo-1668834894230-d2ba3e55baa9?w=150&h=150&fit=crop',
    image: 'https://images.unsplash.com/photo-1774579892480-ca2a4ed30549?w=800&h=800&fit=crop',
    likes: 11234,
    caption: 'Nature meets architecture 🌳🏢',
    timeAgo: '1 DAY AGO',
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pt-[84px] max-w-[975px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_319px] gap-8">
          <div className="w-full max-w-[470px] mx-auto lg:mx-0">
            <div className="mb-6">
              <Stories />
            </div>

            <div>
              {posts.map((post, index) => (
                <Post key={index} {...post} />
              ))}
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