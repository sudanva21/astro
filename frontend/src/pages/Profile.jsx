import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [originalPhoto, setOriginalPhoto] = useState(null)
  const [fullName, setFullName] = useState(user?.name || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' })
  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState({ total_referrals: 0, total_earnings: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadUserProfile = async () => {
      const storedUser = localStorage.getItem('astro_user')
      if (!storedUser) return

      try {
        const userData = JSON.parse(storedUser)
        const token = userData.token

        const response = await fetch('http://localhost:8000/api/v1/auth/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const backendUser = await response.json()
          console.log('Loaded user from backend:', backendUser)
          
          const updatedUserData = {
            ...userData,
            name: backendUser.full_name || backendUser.username,
            full_name: backendUser.full_name,
            username: backendUser.username,
            profile_photo: backendUser.profile_photo,
            createdAt: backendUser.created_at
          }
          
          localStorage.setItem('astro_user', JSON.stringify(updatedUserData))
          
          if (backendUser.profile_photo) {
            setPreviewImage(backendUser.profile_photo)
            setOriginalPhoto(backendUser.profile_photo)
          }
          if (backendUser.full_name) {
            setFullName(backendUser.full_name)
          } else if (backendUser.username) {
            setFullName(backendUser.username)
          }
        } else {
          if (userData.profile_photo) {
            setPreviewImage(userData.profile_photo)
            setOriginalPhoto(userData.profile_photo)
          }
          if (userData.full_name) {
            setFullName(userData.full_name)
          } else if (userData.name) {
            setFullName(userData.name)
          }
        }
      } catch (e) {
        console.error('Error loading user data:', e)
        try {
          const userData = JSON.parse(storedUser)
          if (userData.profile_photo) {
            setPreviewImage(userData.profile_photo)
            setOriginalPhoto(userData.profile_photo)
          }
          if (userData.full_name) {
            setFullName(userData.full_name)
          } else if (userData.name) {
            setFullName(userData.name)
          }
        } catch {}
      }
    }

    const loadReferralData = async () => {
      const storedUser = localStorage.getItem('astro_user')
      if (!storedUser) return

      try {
        const userData = JSON.parse(storedUser)
        const token = userData.token

        const statsResponse = await fetch('http://localhost:8000/api/v1/referral/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (statsResponse.ok) {
          const stats = await statsResponse.json()
          setReferralCode(stats.referral_code)
          setReferralStats({
            total_referrals: stats.total_referrals,
            total_earnings: stats.total_earnings
          })
        }
      } catch (e) {
        console.error('Error loading referral data:', e)
      }
    }

    loadUserProfile()
    loadReferralData()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCopyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      setSaveMessage({ type: '', text: '' })

      const storedUser = localStorage.getItem('astro_user')
      if (!storedUser) {
        setSaveMessage({ type: 'error', text: 'User not authenticated' })
        return
      }

      const userData = JSON.parse(storedUser)
      const token = userData.token

      const profileData = {}
      if (fullName && fullName.trim()) {
        profileData.full_name = fullName.trim()
      }
      
      if (previewImage && previewImage !== originalPhoto) {
        profileData.profile_photo = previewImage
        console.log('Sending profile photo update, size:', previewImage.length)
      }

      if (Object.keys(profileData).length === 0) {
        setSaveMessage({ type: 'error', text: 'No changes to save' })
        setIsSaving(false)
        return
      }

      console.log('Updating profile with:', Object.keys(profileData))

      const response = await fetch('http://localhost:8000/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Profile update failed:', errorData)
        throw new Error(errorData.detail || 'Failed to update profile')
      }

      const updatedUser = await response.json()
      console.log('Profile updated successfully:', updatedUser)
      
      const updatedUserData = {
        ...userData,
        name: updatedUser.full_name || updatedUser.username,
        full_name: updatedUser.full_name,
        profile_photo: updatedUser.profile_photo
      }
      localStorage.setItem('astro_user', JSON.stringify(updatedUserData))

      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Profile update error:', error)
      setSaveMessage({ type: 'error', text: error.message || 'Failed to update profile. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const getMemberSinceYear = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).getFullYear()
    }
    const storedUser = localStorage.getItem('astro_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData.createdAt) {
          return new Date(userData.createdAt).getFullYear()
        }
      } catch {}
    }
    return new Date().getFullYear()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  const zodiacSigns = [
    { name: 'Aries', symbol: '♈', color: '#FF6B6B' },
    { name: 'Taurus', symbol: '♉', color: '#4ECDC4' },
    { name: 'Gemini', symbol: '♊', color: '#FFD93D' },
    { name: 'Cancer', symbol: '♋', color: '#95E1D3' },
    { name: 'Leo', symbol: '♌', color: '#F38181' },
    { name: 'Virgo', symbol: '♍', color: '#AA96DA' },
    { name: 'Libra', symbol: '♎', color: '#FCBAD3' },
    { name: 'Scorpio', symbol: '♏', color: '#A8D8EA' },
    { name: 'Sagittarius', symbol: '♐', color: '#FFB6B9' },
    { name: 'Capricorn', symbol: '♑', color: '#BBDED6' },
    { name: 'Aquarius', symbol: '♒', color: '#C7CEEA' },
    { name: 'Pisces', symbol: '♓', color: '#FEC8D8' },
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="neo-card p-8 mb-8 bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-4xl border-4 border-white/20 shadow-2xl overflow-hidden">
                    {previewImage ? (
                      <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : user?.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      '👤'
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-xs font-semibold">Change</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user?.name || 'Astro User'}</h1>
                  <p className="text-gray-300">{user?.email || 'user@example.com'}</p>
                  <div className="flex items-center mt-3">
                    <span className="text-sm text-gray-400">Member since {getMemberSinceYear()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/20"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="neo-card p-6 bg-white space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-black text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="neo-card p-8 bg-white">
                    <h2 className="text-2xl font-bold mb-6 text-black">Astrological Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-gray-50 rounded-2xl shadow-sm">
                        <div className="text-4xl mb-3">☀️</div>
                        <div className="text-sm text-gray-600 mb-1">Sun Sign</div>
                        <div className="text-xl font-bold text-black">Leo</div>
                      </div>
                      <div className="text-center p-6 bg-gray-50 rounded-2xl shadow-sm">
                        <div className="text-4xl mb-3">🌙</div>
                        <div className="text-sm text-gray-600 mb-1">Moon Sign</div>
                        <div className="text-xl font-bold text-black">Cancer</div>
                      </div>
                      <div className="text-center p-6 bg-gray-50 rounded-2xl shadow-sm">
                        <div className="text-4xl mb-3">⬆️</div>
                        <div className="text-sm text-gray-600 mb-1">Rising Sign</div>
                        <div className="text-xl font-bold text-black">Virgo</div>
                      </div>
                    </div>
                  </div>

                  <div className="neo-card p-8 bg-white">
                    <h2 className="text-2xl font-bold mb-6 text-black">Zodiac Wheel</h2>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {zodiacSigns.map((sign, index) => (
                        <motion.div
                          key={sign.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="text-center p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all cursor-pointer group"
                        >
                          <div 
                            className="text-3xl mb-2 transition-transform group-hover:scale-125"
                            style={{ color: sign.color }}
                          >
                            {sign.symbol}
                          </div>
                          <div className="text-xs font-semibold text-gray-700">{sign.name}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="neo-card p-8 bg-white">
                    <h2 className="text-2xl font-bold mb-6 text-black">Referral Program</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold mb-3 text-gray-900">Your Referral Code</label>
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={referralCode}
                              readOnly
                              className="neo-input w-full bg-gray-50 font-mono text-lg font-bold tracking-wider text-center cursor-default"
                            />
                          </div>
                          <button
                            onClick={handleCopyReferralCode}
                            className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                          >
                            {copied ? '✓ Copied!' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Share this code with friends. When they sign up using your code, you earn ₹100
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                          <div className="text-sm text-gray-600 mb-1">Total Referrals</div>
                          <div className="text-3xl font-bold text-green-600">{referralStats.total_referrals}</div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                          <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
                          <div className="text-3xl font-bold text-blue-600">₹{referralStats.total_earnings.toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="neo-card p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <h3 className="text-xl font-bold mb-4">Daily Insight</h3>
                    <div className="mb-4">
                      <div className="text-3xl mb-2">✨</div>
                      <p className="text-white/90 leading-relaxed">
                        Today's planetary alignment suggests a perfect time for creative pursuits. 
                        Your intuition is heightened, trust your inner wisdom.
                      </p>
                    </div>
                    <div className="text-sm text-white/80">
                      Lucky Number: <span className="font-bold">7</span> • Lucky Color: <span className="font-bold">Purple</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="neo-card p-8 bg-white"
                >
                  <h2 className="text-2xl font-bold mb-6 text-black">Account Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="neo-input w-full"
                        placeholder="Enter your full name"
                      />
                      <p className="text-xs text-gray-500 mt-1">This will be used as your display name</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="neo-input w-full bg-gray-100 cursor-not-allowed opacity-60"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    {saveMessage.text && (
                      <div className={`p-4 rounded-xl ${
                        saveMessage.type === 'success' 
                          ? 'bg-green-50 border border-green-200 text-green-700' 
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                        <p className="text-sm font-medium">{saveMessage.text}</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="neo-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
