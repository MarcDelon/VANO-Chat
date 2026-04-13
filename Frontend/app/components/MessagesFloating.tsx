import { Send, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export function MessagesFloating() {
  return (
    <Link href="/messages" className="fixed bottom-6 right-6 z-50 flex items-center bg-[#262626] rounded-full py-2.5 px-5 shadow-2xl border border-[#333] cursor-pointer hover:bg-[#333] transition-colors gap-3">
      
      {/* Icon with notification badge */}
      <div className="relative flex items-center shrink-0">
        <Send className="w-6 h-6 text-white -rotate-45 mb-1" />
        <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#262626]">
          4
        </div>
      </div>
      
      {/* Text */}
      <span className="font-bold text-white text-[16px] tracking-wide ml-1">Messages</span>
      
      {/* Avatars */}
      <div className="flex -space-x-2 ml-2">
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" 
          className="w-8 h-8 rounded-full border-[2px] border-[#262626] object-cover relative z-30" 
          alt="Avatar 1" 
        />
        <img 
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" 
          className="w-8 h-8 rounded-full border-[2px] border-[#262626] object-cover relative z-20" 
          alt="Avatar 2" 
        />
        <img 
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
          className="w-8 h-8 rounded-full border-[2px] border-[#262626] object-cover relative z-10" 
          alt="Avatar 3" 
        />
      </div>

      {/* Options Icon */}
      <div className="ml-1 shrink-0">
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>

    </Link>
  );
}
