import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative z-10 bg-gradient-to-b from-gray-50 via-white to-gray-100 border-t-2 border-gray-200 mt-20 shadow-neo">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-neo flex items-center justify-center border border-gray-200 overflow-hidden">
                <img src="/icon.png" alt="Astro Care" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">Astro Care</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Explore your cosmic journey through scientific astrology and ancient wisdom.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-6 text-black text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/horoscope" className="block text-sm text-gray-600 hover:text-black transition-colors">
                Horoscope
              </Link>
              <Link to="/services" className="block text-sm text-gray-600 hover:text-black transition-colors">
                Services
              </Link>
              <Link to="/ai-astrology" className="block text-sm text-gray-600 hover:text-black transition-colors">
                AI Astrology
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-6 text-black text-lg">Resources</h3>
            <div className="space-y-2">
              <Link to="/blogs" className="block text-sm text-gray-600 hover:text-black transition-colors">
                Blog
              </Link>
              <Link to="/about" className="block text-sm text-gray-600 hover:text-black transition-colors">
                About Us
              </Link>
              <a href="#" className="block text-sm text-gray-600 hover:text-black transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-black transition-colors">
                Terms of Service
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-6 text-black text-lg">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-neo flex items-center justify-center hover:shadow-neo-hover active:shadow-neo-button-active transition-all duration-300 border border-gray-200 group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="black" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-neo flex items-center justify-center hover:shadow-neo-hover active:shadow-neo-button-active transition-all duration-300 border border-gray-200 group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="black" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-neo flex items-center justify-center hover:shadow-neo-hover active:shadow-neo-button-active transition-all duration-300 border border-gray-200 group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="black" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Astro Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
