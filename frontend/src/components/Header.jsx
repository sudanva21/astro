import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/horoscope', label: 'Horoscope' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/ai-astrology', label: 'AI Astrology' },
    { path: '/about', label: 'About' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-gradient-to-r from-gray-50 via-white to-gray-50 backdrop-blur-lg shadow-neo-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-white shadow-neo flex items-center justify-center border border-gray-200 transition-all duration-300 group-hover:shadow-neo-hover group-hover:scale-105 overflow-hidden">
              <img src="/icon.png" alt="Astro Care" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">Astro Care</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all hover:text-black ${
                  location.pathname === link.path ? 'text-black' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold shadow-neo hover:shadow-neo-hover transition-all overflow-hidden"
                >
                  {user.profile_photo ? (
                    <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    '👤'
                  )}
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-neo-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      👤 My Profile
                    </Link>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="neo-button text-sm">
                Login
              </Link>
            )}
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-neo flex items-center justify-center border border-gray-200 hover:shadow-neo-hover active:shadow-neo-button-active transition-all duration-300"
          >
            <div className="space-y-1.5">
              <span className="block w-5 h-0.5 bg-gradient-to-r from-black to-gray-700 rounded"></span>
              <span className="block w-5 h-0.5 bg-gradient-to-r from-black to-gray-700 rounded"></span>
              <span className="block w-5 h-0.5 bg-gradient-to-r from-black to-gray-700 rounded"></span>
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed top-0 right-0 bottom-0 w-72 bg-gradient-to-b from-gray-50 via-white to-gray-100 shadow-neo-xl lg:hidden border-l border-gray-300"
          >
            <div className="p-6">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-neo flex items-center justify-center border border-gray-200 hover:shadow-neo-hover active:shadow-neo-button-active transition-all duration-300"
              >
                <span className="text-2xl text-black font-light">×</span>
              </button>
              <nav className="mt-12 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-lg font-medium transition-all hover:text-black ${
                      location.pathname === link.path ? 'text-black' : 'text-gray-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block neo-button text-center mt-6"
                  >
                    My Profile
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block neo-button text-center mt-6"
                  >
                    Login
                  </Link>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
