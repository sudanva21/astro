import { useState } from 'react'
import { motion } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Saturn3D from '../components/Saturn3D'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'
const authApi = axios.create({ baseURL: API_BASE })

export default function Auth() {
  const [isSignup, setIsSignup] = useState(true)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: '',
    rememberMe: false,
  })

  const handleToggleMode = (mode) => {
    setIsSignup(mode)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isSignup && formData.referralCode && formData.referralCode.trim()) {
      const isValid = await validateReferralCode(formData.referralCode.trim())
      if (!isValid) {
        toast.error('Invalid referral code')
        return
      }
    }

    try {
      if (isSignup) {
        const registerData = {
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          username: formData.email.split('@')[0]
        }
        
        if (formData.referralCode && formData.referralCode.trim()) {
          registerData.referral_code = formData.referralCode.trim()
        }
        
        await authApi.post('/api/v1/auth/register', registerData)
        toast.success('Account created successfully!')
      }
      
      const response = await authApi.post('/api/v1/auth/login', {
        email: formData.email,
        password: formData.password
      })
      
      const { access_token } = response.data
      
      const userResponse = await authApi.get('/api/v1/auth/users/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
      
      const userData = userResponse.data
      
      login({
        name: userData.full_name || userData.username || formData.email.split('@')[0],
        email: userData.email,
        token: access_token,
        full_name: userData.full_name,
        username: userData.username,
        profile_photo: userData.profile_photo,
        createdAt: userData.created_at
      })
      
      toast.success(isSignup ? 'Logged in successfully!' : 'Welcome back!')
      navigate('/')
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error(error.response?.data?.detail || 'Authentication failed')
    }
  }

  const validateReferralCode = async (code) => {
    if (!code || code.length < 6) return false
    
    try {
      const response = await authApi.post('/api/v1/referral/validate', { code })
      return response.data.valid
    } catch {
      return false
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authApi.post('/api/v1/auth/google/login', {
        google_token: credentialResponse.credential
      })
      
      const { access_token } = response.data
      
      const userResponse = await authApi.get('/api/v1/auth/users/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
      
      const userData = userResponse.data
      
      login({
        name: userData.full_name || userData.username,
        email: userData.email,
        token: access_token,
        full_name: userData.full_name,
        username: userData.username,
        profile_photo: userData.profile_photo,
        createdAt: userData.created_at
      })
      
      toast.success('Successfully signed in with Google!')
      navigate('/')
    } catch (error) {
      console.error('Google authentication error:', error)
      toast.error(error.response?.data?.detail || 'Google sign-in failed')
    }
  }

  const handleGoogleError = () => {
    toast.error('Google sign-in failed')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-20">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center isolate">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative h-[600px] neo-card bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl overflow-hidden hidden lg:flex items-center justify-center"
          >
            <div className="absolute inset-0 opacity-50 pointer-events-none">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] scale-150">
                <Saturn3D />
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-teal-400/20 to-green-500/20 blur-2xl"></div>
              <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-teal-500/20 to-green-600/20 blur-3xl"></div>
              <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-green-400/10 to-teal-400/10 blur-2xl"></div>
            </div>
            
            <div className="relative z-10 px-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center justify-center mb-6"
              >
                <div className="w-40 h-40 rounded-full overflow-hidden bg-white shadow-neo-xl border-4 border-gray-200 flex items-center justify-center">
                  <img src="/icon.png" alt="Astro Care" className="w-24 h-24 object-contain" />
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-6 text-black"
              >
                {isSignup ? 'Begin Your Journey' : 'Welcome Back'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-700 text-lg leading-relaxed"
              >
                {isSignup
                  ? 'Create your account and unlock the secrets of the cosmos. Join thousands exploring their celestial path.'
                  : 'Continue your cosmic exploration. Sign in to access your personalized astrological insights.'}
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="neo-card p-8 bg-white h-[600px] flex flex-col relative z-20"
          >
            <div className="flex space-x-4 mb-6">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleToggleMode(true)
                }}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                  isSignup ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleToggleMode(false)
                }}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                  !isSignup ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
              <div className="flex-1 space-y-4">
                {isSignup && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-black">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="neo-input w-full"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="neo-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    required
                    className="neo-input w-full"
                  />
                </div>

                {isSignup && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-black">
                      Referral Code <span className="text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleChange}
                      placeholder="Enter referral code"
                      className="neo-input w-full"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-600">Remember me</label>
                </div>
              </div>

              <button type="submit" className="neo-button w-full text-center">
                {isSignup ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text={isSignup ? 'signup_with' : 'signin_with'}
              />
            </div>

            {!isSignup && (
              <div className="text-center">
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Forgot your password?
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
