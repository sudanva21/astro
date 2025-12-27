import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Saturn3D from '../components/Saturn3D'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-100 px-4 md:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full max-w-7xl h-[650px] md:h-[550px] bg-gradient-to-br from-gray-900 via-black to-gray-950 rounded-[40px] overflow-hidden shadow-2xl"
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] scale-150 md:scale-125">
            <Saturn3D />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="relative z-10 h-full flex flex-col items-start justify-center text-left px-8 md:px-16 lg:px-20 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/20">
                ✨ AI-Powered Astrology
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              style={{
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              Discover Your
              <br />
              Cosmic Truth
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed"
            >
              Astro Care's AI-powered platform offers honest and insightful
              astrological guidance. Uncover your path with clarity and confidence.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                to="/ai-astrology" 
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-black text-lg font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
              >
                Start Chatting
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                to="/horoscope" 
                className="inline-flex items-center justify-center px-10 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                View Horoscope
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-gray-100 text-gray-900 text-sm font-semibold rounded-full mb-4 border border-gray-200"
          >
            Today's Insights
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Daily Horoscope
          </h2>
          <p className="text-gray-600 text-lg">Your cosmic forecast for today</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="neo-card p-8 max-w-3xl mx-auto bg-white border border-gray-200"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-black">
              Today's Planetary Influence
            </h3>
            <Link to="/horoscope" className="text-sm text-gray-600 hover:text-black transition-colors font-semibold flex items-center gap-1">
              View All 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="space-y-5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">♀️</span>
                <span className="font-semibold text-gray-700">Venus in Retrograde</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">Focus on relationships</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">☿</span>
                <span className="font-semibold text-gray-700">Mercury Direct</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">Communication flows</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">♂️</span>
                <span className="font-semibold text-gray-700">Mars in Leo</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">Bold actions favored</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-24 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-gray-100 text-gray-900 text-sm font-semibold rounded-full mb-4 border border-gray-200"
          >
            Featured Service
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
            Experience AI-Powered Astrology
          </h2>
          <p className="text-gray-600 text-lg">Get instant cosmic insights with cutting-edge technology</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Link to="/ai-astrology" className="block">
            <div className="relative neo-card p-12 md:p-16 text-center group hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-purple-100/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <motion.div 
                  className="text-8xl md:text-9xl mb-8 inline-block transform group-hover:scale-110 transition-transform duration-500"
                  whileInView={{ rotate: [0, 10, -10, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  🤖
                </motion.div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-black">
                  AI Astrology
                </h3>
                
                <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                  Harness the power of artificial intelligence for personalized astrological guidance. 
                  Get instant, accurate readings combining ancient wisdom with modern technology.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <div className="neo-card p-4 bg-white/50 backdrop-blur-sm">
                    <div className="text-2xl mb-2">⚡</div>
                    <p className="text-sm font-semibold text-gray-700">Instant Responses</p>
                  </div>
                  <div className="neo-card p-4 bg-white/50 backdrop-blur-sm">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-sm font-semibold text-gray-700">Personalized Insights</p>
                  </div>
                  <div className="neo-card p-4 bg-white/50 backdrop-blur-sm">
                    <div className="text-2xl mb-2">🌟</div>
                    <p className="text-sm font-semibold text-gray-700">24/7 Available</p>
                  </div>
                </div>

                <div className="inline-flex items-center px-10 py-4 bg-black text-white text-lg font-bold rounded-full group-hover:bg-gray-900 transition-all duration-300 shadow-lg group-hover:shadow-2xl transform group-hover:scale-105">
                  Start Your AI Journey
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {!user && (
        <section className="container mx-auto px-4 py-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative neo-card p-16 text-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-950"
          >
            <div className="relative z-10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-6 text-white"
              >
                Ready to Begin Your Journey?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
              >
                Join thousands discovering their cosmic path with personalized insights
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link 
                  to="/auth" 
                  className="inline-flex items-center px-12 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-105"
                >
                  Sign Up Now
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-10 flex justify-center items-center gap-8 text-gray-400 text-sm"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Free trial available</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
