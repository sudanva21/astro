import { motion } from 'framer-motion'

export default function About() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Us</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Where ancient wisdom meets modern science
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neo-card p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="1" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Astro Care was born from a simple yet profound vision: to bridge the gap between 
                ancient astrological wisdom and contemporary scientific understanding. We believe that 
                the cosmos holds timeless truths that can guide us through modern life's complexities.
              </p>
              <p>
                Founded in 2020 by a team of experienced astrologers, data scientists, and spiritual 
                seekers, we've created a platform that honors traditional astrological practices while 
                embracing technological innovation.
              </p>
              <p>
                Our approach is unique—we combine rigorous astronomical calculations with intuitive 
                interpretation, backed by artificial intelligence trained on thousands of years of 
                astrological knowledge. The result is personalized, accurate, and deeply meaningful 
                cosmic guidance.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="neo-card p-8 md:p-12"
          >
            <h2 className="text-3xl font-bold mb-6">Our Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="neo-card p-6">
                <h3 className="text-xl font-bold mb-3">Scientific Approach</h3>
                <p className="text-gray-300">
                  We base our readings on precise astronomical calculations and planetary positions, 
                  ensuring accuracy in every interpretation.
                </p>
              </div>
              <div className="neo-card p-6">
                <h3 className="text-xl font-bold mb-3">Intuitive Wisdom</h3>
                <p className="text-gray-300">
                  Beyond data, we honor the intuitive and spiritual dimensions of astrology that 
                  have guided humanity for millennia.
                </p>
              </div>
              <div className="neo-card p-6">
                <h3 className="text-xl font-bold mb-3">Personal Empowerment</h3>
                <p className="text-gray-300">
                  Our goal is to empower you with self-knowledge and cosmic awareness, helping you 
                  make informed decisions aligned with your true nature.
                </p>
              </div>
              <div className="neo-card p-6">
                <h3 className="text-xl font-bold mb-3">Continuous Growth</h3>
                <p className="text-gray-300">
                  We're constantly evolving our methods, integrating new insights from both ancient 
                  texts and cutting-edge research.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="neo-card p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Join Our Cosmic Community</h2>
            <p className="text-gray-300 mb-8">
              Become part of a growing community of seekers exploring their celestial blueprint
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="neo-button">Get Started</button>
              <button className="neo-button">Contact Us</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
