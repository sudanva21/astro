import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'

export default function BlogPost() {
  const { id } = useParams()

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Link to="/blogs" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blogs
          </Link>

          <div className="neo-card p-8 md:p-12">
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-xs text-teal-400 font-medium">PLANETARY MOVEMENTS</span>
              <span className="text-xs text-gray-500">Dec 8, 2025</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Understanding Mercury Retrograde
            </h1>

            <div className="aspect-video bg-cosmic-light rounded-xl flex items-center justify-center text-8xl mb-8">
              🌙
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed mb-6">
                Mercury retrograde has become one of the most talked-about astrological phenomena in modern times. 
                But what does it really mean, and how can we navigate these periods with grace and wisdom?
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">What is Mercury Retrograde?</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Mercury retrograde occurs when the planet Mercury appears to move backward in the sky from our 
                perspective on Earth. This optical illusion happens three to four times per year and lasts about 
                three weeks each time.
              </p>

              <div className="neo-card p-6 my-8">
                <h3 className="text-xl font-bold mb-4">Key Dates for 2025</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• March 15 - April 7</li>
                  <li>• July 18 - August 11</li>
                  <li>• November 9 - November 29</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mb-4 mt-8">Common Effects</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                During Mercury retrograde, communication, technology, and travel can become more challenging. 
                You might experience:
              </p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Miscommunications and misunderstandings</li>
                <li>• Technology glitches and delays</li>
                <li>• Travel disruptions</li>
                <li>• Old friends or situations resurfacing</li>
                <li>• Need to review and revise plans</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">How to Navigate It</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Rather than fearing Mercury retrograde, we can use this time productively:
              </p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Review and reflect on current projects</li>
                <li>• Back up important data and documents</li>
                <li>• Double-check travel plans and appointments</li>
                <li>• Practice patience in communications</li>
                <li>• Reconnect with old friends and finish incomplete projects</li>
              </ul>

              <div className="bg-cosmic-teal/20 border border-cosmic-teal/30 rounded-xl p-6 my-8">
                <p className="text-teal-400 font-medium mb-2">Pro Tip</p>
                <p className="text-gray-300">
                  The shadow periods before and after Mercury retrograde are equally important. Be mindful 
                  of decisions made during these times.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-4 mt-8">Conclusion</h2>
              <p className="text-gray-300 leading-relaxed">
                Mercury retrograde is not something to fear but rather an opportunity for reflection, revision, 
                and reconnection. By understanding its energies and working with them consciously, we can make 
                the most of these cyclical periods and emerge with greater clarity and purpose.
              </p>
            </div>
          </div>

          <div className="mt-12 neo-card p-8">
            <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/blogs/2" className="flex items-center space-x-4 group">
                <span className="text-4xl">⭐</span>
                <div>
                  <h4 className="font-semibold group-hover:text-teal-400 transition-colors">
                    The Power of Your Rising Sign
                  </h4>
                  <p className="text-sm text-gray-400">5 min read</p>
                </div>
              </Link>
              <Link to="/blogs/3" className="flex items-center space-x-4 group">
                <span className="text-4xl">🔮</span>
                <div>
                  <h4 className="font-semibold group-hover:text-teal-400 transition-colors">
                    2025 Astrological Forecast
                  </h4>
                  <p className="text-sm text-gray-400">8 min read</p>
                </div>
              </Link>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  )
}
