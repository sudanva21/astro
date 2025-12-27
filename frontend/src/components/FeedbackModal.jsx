import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function FeedbackModal({ onClose }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const headers = {}
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`
      }

      await axios.post(
        `${API_BASE}/api/v1/feedback`,
        {
          rating,
          review_text: reviewText || null
        },
        { headers }
      )

      toast.success('Thank you for your feedback!')
      onClose()
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl shadow-neo-xl p-8 max-w-md w-full mx-4 border border-gray-200"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">
              Platform Feedback
            </h2>
            <p className="text-xs text-gray-500 mt-1">Share your thoughts about our service</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-neo flex items-center justify-center hover:shadow-neo-hover transition-all"
          >
            <span className="text-xl text-gray-600">×</span>
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate your overall experience
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const displayRating = hoveredRating || rating
              const isFilled = star <= displayRating
              
              return (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-all duration-200 hover:scale-110 focus:outline-none"
                >
                  <span
                    className={isFilled ? 'text-yellow-400' : 'text-gray-300'}
                    style={{ 
                      filter: isFilled ? 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.5))' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isFilled ? '⭐' : '☆'}
                  </span>
                </button>
              )
            })}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating} {rating === 1 ? 'star' : 'stars'} selected
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell us what you think (optional)
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us what you think..."
            maxLength={500}
            rows={4}
            className="w-full neo-input resize-none text-sm"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {reviewText.length}/500
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full neo-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </motion.div>
    </motion.div>
  )
}
