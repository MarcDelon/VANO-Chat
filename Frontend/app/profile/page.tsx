import { Settings, Grid, Bookmark, UserSquare, Heart, MessageCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { MessagesFloating } from '../components/MessagesFloating';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background dark pb-20">
      <Header />
      
      <main className="pt-[90px] max-w-[975px] mx-auto px-5">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row mb-12 gap-8 md:gap-24 md:mx-16 items-center md:items-start text-white">
          <div className="shrink-0 border-2 border-transparent relative">
            <div className="absolute -inset-1 rounded-full border border-gray-600 hidden"></div>
            <img 
              src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=300&h=300&fit=crop" 
              alt="Profile Picture" 
              className="w-36 h-36 md:w-36 md:h-36 rounded-full object-cover border border-[#333]" 
            />
          </div>
          
          <div className="flex flex-col w-full md:mt-2">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-5">
              <h2 className="text-xl">i_am_marc.delon</h2>
              <div className="flex items-center gap-2">
                <button className="bg-[#363636] hover:bg-[#262626] border border-[#444] rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors">
                  Modifier le profil
                </button>
                <button className="bg-[#363636] hover:bg-[#262626] border border-[#444] rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors">
                  Voir l'archive
                </button>
                <button className="p-1 hover:text-gray-400">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-10 mb-5 text-[15px]">
              <span><strong>1</strong> publication</span>
              <span><strong>355</strong> followers</span>
              <span><strong>549</strong> suivi(e)s</span>
            </div>
            
            <div className="text-[14px] text-center md:text-left">
              <p className="font-semibold mb-0.5">Marc Delon</p>
              <p className="text-gray-300">@i_am_marc.delon</p>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex gap-8 mb-12 overflow-x-auto pb-4 px-2 md:mx-16 hide-scrollbar">
          {['À la une', 'À la une', 'À la une', 'À la une', 'Me', 'Music 🎵'].map((title, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
              <div className="w-[82px] h-[82px] rounded-full border border-gray-600 bg-secondary p-1 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                <img src={`https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=300&h=300&fit=crop`} className="w-full h-full rounded-full object-cover" />
              </div>
              <span className="text-[12px] text-white font-medium">{title}</span>
            </div>
          ))}
        </div>

        {/* Divider & Tabs */}
        <div className="border-t border-[#262626]">
          <div className="flex justify-center gap-14 list-none uppercase text-xs font-semibold text-gray-400 tracking-widest relative -top-[1px]">
            <div className="flex items-center gap-2 border-t border-white text-white py-4 cursor-pointer">
              <Grid className="w-3 h-3" />
              <span>Publications</span>
            </div>
            <div className="flex items-center gap-2 py-4 hover:text-white cursor-pointer transition-colors">
              <Bookmark className="w-3 h-3" />
              <span>Enregistrements</span>
            </div>
            <div className="flex items-center gap-2 py-4 hover:text-white cursor-pointer transition-colors">
              <UserSquare className="w-3 h-3" />
              <span>Identifié</span>
            </div>
          </div>
        </div>

        {/* Grid Posts */}
        <div className="grid grid-cols-3 gap-1 md:gap-4 mt-2">
          {/* Post item */}
          <div className="aspect-square bg-secondary relative group cursor-pointer overflow-hidden">
            <img src="https://images.unsplash.com/photo-1759200135367-278bd3d2a5f0?w=800&h=800&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-white font-bold"><Heart className="w-5 h-5 fill-white" /> 1K</div>
              <div className="flex items-center gap-2 text-white font-bold"><MessageCircle className="w-5 h-5 fill-white" /> 42</div>
            </div>
          </div>
        </div>

      </main>

      <MessagesFloating />
    </div>
  );
}
