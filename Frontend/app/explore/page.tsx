import { Header } from '../components/Header';
import { MessagesFloating } from '../components/MessagesFloating';
import Image from 'next/image';

const EXPLORE_IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", // Arch
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", // Nature
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80", // Tech
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", // Fashion
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", // Food
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80", // Travel
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80", // Interior
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80", // Mobile
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80", // Model
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", // Product
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80", // Store
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80"  // Car
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background dark pb-20">
      <Header />
      <main className="pt-[90px] max-w-[975px] mx-auto px-5">
        <h2 className="text-white text-2xl font-bold mb-6">Explore</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
          {EXPLORE_IMAGES.map((src, i) => (
            <div key={i} className="aspect-square bg-secondary relative group cursor-pointer overflow-hidden">
              <Image 
                src={src} 
                alt={`Explore ${i}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                 <div className="flex items-center gap-2 text-white font-bold">
                   <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                   {Math.floor(Math.random() * 200) + 1}K
                 </div>
                 <div className="flex items-center gap-2 text-white font-bold">
                   <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-13.5 8.38 8.38 0 013.8.9L21 3.5v8z"/></svg>
                   {Math.floor(Math.random() * 50) + 1}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <MessagesFloating />
    </div>
  );
}
