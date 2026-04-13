import { motion } from 'motion/react';

interface Story {
  id: string;
  username: string;
  avatar: string;
  viewed: boolean;
}

const stories: Story[] = [
  { id: '1', username: 'Your Story', avatar: 'https://images.unsplash.com/photo-1652549752120-d9beb4c86bd4?w=150&h=150&fit=crop', viewed: false },
  { id: '2', username: 'john_doe', avatar: 'https://images.unsplash.com/photo-1669206053726-bfafe8d4537f?w=150&h=150&fit=crop', viewed: false },
  { id: '3', username: 'jane_smith', avatar: 'https://images.unsplash.com/photo-1648415041078-d5b259c683be?w=150&h=150&fit=crop', viewed: false },
  { id: '4', username: 'alex_photo', avatar: 'https://images.unsplash.com/photo-1675908910500-2dcef146f9cf?w=150&h=150&fit=crop', viewed: true },
  { id: '5', username: 'sarah_art', avatar: 'https://images.unsplash.com/photo-1668834894230-d2ba3e55baa9?w=150&h=150&fit=crop', viewed: false },
  { id: '6', username: 'mike_travel', avatar: 'https://images.unsplash.com/photo-1694618221680-c294a88d86e5?w=150&h=150&fit=crop', viewed: true },
  { id: '7', username: 'emma_life', avatar: 'https://images.unsplash.com/photo-1720463671506-7da8ab4a7040?w=150&h=150&fit=crop', viewed: false },
  { id: '8', username: 'david_fit', avatar: 'https://images.unsplash.com/photo-1720467438431-c1b5659a933e?w=150&h=150&fit=crop', viewed: true },
];

export function Stories() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {stories.map((story, index) => (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 flex flex-col items-center gap-1 group"
          >
            <div className={`p-[2px] rounded-full ${story.viewed ? 'bg-secondary' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}>
              <div className="p-[3px] bg-card rounded-full">
                <img
                  src={story.avatar}
                  alt={story.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[12px] text-white max-w-[64px] truncate">
              {story.username}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
