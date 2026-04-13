import { Header } from '../components/Header';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <Header />
      <main className="pt-[60px] flex-1 max-w-[975px] mx-auto w-full flex">
        {/* Sidebar */}
        <div className="w-[350px] border-r border-[#262626] flex flex-col">
          <div className="h-[60px] flex items-center justify-between px-5 border-b border-[#262626]">
            <h2 className="text-xl font-bold text-white">i_am_marc.delon</h2>
          </div>
          <div className="overflow-y-auto flex-1 py-2">
            {['alexia.kdm', 'rick_knd', 'celeste_vic', 'tiacorah'].map((user, i) => (
              <div key={user} className="flex items-center gap-3 px-5 py-2 hover:bg-[#262626] cursor-pointer cursor-pointer transition-colors">
                <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden shrink-0">
                  <img src={`https://images.unsplash.com/photo-${1534500000000 + i}?w=100&h=100&fit=crop`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{user}</p>
                  <p className="text-gray-400 text-xs text-ellipsis w-40 overflow-hidden line-clamp-1">Actif(ve) il y a {i} h</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 border-2 border-white rounded-full flex items-center justify-center mb-4">
             <span className="text-white text-5xl rotate-[-20deg]">💬</span>
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">Vos messages</h2>
          <p className="text-gray-400 mb-6 font-medium">Envoyez des photos et des messages privés à vos amis ou à des groupes.</p>
          <button className="bg-primary text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 transition-colors">
            Envoyer un message
          </button>
        </div>
      </main>
    </div>
  );
}
