interface SuggestionUser {
  username: string;
  avatar: string;
  subtitle: string;
}

const suggestions: SuggestionUser[] = [
  { username: 'alex_photo', avatar: 'https://images.unsplash.com/photo-1652549752120-d9beb4c86bd4?w=150&h=150&fit=crop', subtitle: 'Followed by jane + 3 more' },
  { username: 'sarah_art', avatar: 'https://images.unsplash.com/photo-1669206053726-bfafe8d4537f?w=150&h=150&fit=crop', subtitle: 'Followed by john_doe + 2 more' },
  { username: 'mike_travel', avatar: 'https://images.unsplash.com/photo-1648415041078-d5b259c683be?w=150&h=150&fit=crop', subtitle: 'New to VANO chat' },
  { username: 'emma_life', avatar: 'https://images.unsplash.com/photo-1675908910500-2dcef146f9cf?w=150&h=150&fit=crop', subtitle: 'Followed by david_fit' },
  { username: 'chris_fit', avatar: 'https://images.unsplash.com/photo-1668834894230-d2ba3e55baa9?w=150&h=150&fit=crop', subtitle: 'Followed by sarah + 5 more' },
];

export function Suggestions() {
  return (
    <div className="sticky top-[84px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-purple-600 p-[2px]">
            <img
              src="https://images.unsplash.com/photo-1720463671506-7da8ab4a7040?w=150&h=150&fit=crop"
              alt="Your profile"
              className="w-full h-full rounded-full object-cover border-2 border-card"
            />
          </div>
          <div>
            <div className="text-[14px] text-white">your_username</div>
            <div className="text-[12px] text-gray-400">Your Name</div>
          </div>
        </div>
        <button className="text-[12px] text-accent hover:opacity-60 transition-opacity">
          Switch
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] text-gray-400">Suggestions For You</span>
          <button className="text-[12px] text-white hover:opacity-60 transition-opacity">
            See All
          </button>
        </div>

        <div className="space-y-3">
          {suggestions.map((user) => (
            <div key={user.username} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="text-[14px] text-white">{user.username}</div>
                  <div className="text-[12px] text-gray-400">{user.subtitle}</div>
                </div>
              </div>
              <button className="text-[12px] text-accent hover:opacity-60 transition-opacity">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-[12px] text-gray-500 space-y-2">
        <div className="flex flex-wrap gap-2">
          <a href="#" className="hover:underline">About</a>
          <span>·</span>
          <a href="#" className="hover:underline">Help</a>
          <span>·</span>
          <a href="#" className="hover:underline">Press</a>
          <span>·</span>
          <a href="#" className="hover:underline">API</a>
          <span>·</span>
          <a href="#" className="hover:underline">Jobs</a>
          <span>·</span>
          <a href="#" className="hover:underline">Privacy</a>
          <span>·</span>
          <a href="#" className="hover:underline">Terms</a>
        </div>
        <div>© 2026 VANO CHAT</div>
      </footer>
    </div>
  );
}
