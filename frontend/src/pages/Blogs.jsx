import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const blogPosts = [
  {
    id: 1,
    title: 'Understanding Mercury Retrograde',
    excerpt: 'Learn how to navigate this common astrological phenomenon and turn challenges into opportunities.',
    image: '🌙',
    date: 'Dec 8, 2025',
    category: 'Planetary Movements',
  },
  {
    id: 2,
    title: 'The Power of Your Rising Sign',
    excerpt: 'Discover how your Ascendant shapes your personality and first impressions.',
    image: '⭐',
    date: 'Dec 5, 2025',
    category: 'Birth Chart',
  },
  {
    id: 3,
    title: '2025 Astrological Forecast',
    excerpt: 'Major planetary transits and what they mean for each zodiac sign this year.',
    image: '🔮',
    date: 'Dec 1, 2025',
    category: 'Predictions',
  },
  {
    id: 4,
    title: 'Moon Phases and Manifestation',
    excerpt: 'Harness lunar energy to amplify your intentions and achieve your goals.',
    image: '🌕',
    date: 'Nov 28, 2025',
    category: 'Lunar Cycle',
  },
  {
    id: 5,
    title: 'Venus in Your Birth Chart',
    excerpt: 'Understanding love, beauty, and values through Venus placement.',
    image: '💝',
    date: 'Nov 25, 2025',
    category: 'Planets',
  },
  {
    id: 6,
    title: 'Saturn Return: A Guide',
    excerpt: 'Navigating one of life\'s most transformative astrological periods.',
    image: '🪐',
    date: 'Nov 22, 2025',
    category: 'Life Cycles',
  },
]

export default function Blogs() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Cosmic Insights</h1>
          <p className="text-gray-400 text-lg">
            Explore the depths of astrological wisdom
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/blogs/${post.id}`} className="block">
                <div className="neo-card overflow-hidden group">
                  <div className="aspect-video bg-cosmic-light flex items-center justify-center text-6xl">
                    {post.image}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-teal-400 font-medium">{post.category}</span>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-teal-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{post.excerpt}</p>
                    <div className="mt-4 flex items-center text-sm text-teal-400">
                      <span>Read more</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
