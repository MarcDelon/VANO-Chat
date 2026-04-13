import { Header } from '../components/Header';
import { MessagesFloating } from '../components/MessagesFloating';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background dark pb-20">
      <Header />
      <main className="pt-[90px] max-w-[975px] mx-auto px-5">
        <h2 className="text-white text-2xl font-bold mb-6">Explore</h2>
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-secondary relative group cursor-pointer overflow-hidden">
              <img src={`https://images.unsplash.com/photo-${1515000000000 + i}?w=800&h=800&fit=crop`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                 <span className="text-white font-bold">1.{i}K Likes</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <MessagesFloating />
    </div>
  );
}
