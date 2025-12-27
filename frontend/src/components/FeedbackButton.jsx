import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FeedbackModal from './FeedbackModal'

export default function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 via-black to-gray-900 text-white shadow-neo-lg hover:shadow-neo-xl transition-all duration-300 flex items-center justify-center group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        title="Share your feedback about our platform"
        style={{ pointerEvents: 'auto' }}
      >
        <span className="text-xl group-hover:scale-110 transition-transform">⭐</span>
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <FeedbackModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
