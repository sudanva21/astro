import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Services from './pages/Services'
import Blogs from './pages/Blogs'
import BlogPost from './pages/BlogPost'
import AIAstrology from './pages/AIAstrology'
import About from './pages/About'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Horoscope from './pages/Horoscope'

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#000000',
            border: '1px solid #E5E5E5',
            boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.15), -8px -8px 16px rgba(255, 255, 255, 1)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="horoscope" element={<Horoscope />} />
          <Route path="services" element={<Services />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:id" element={<BlogPost />} />
          <Route path="ai-astrology" element={<AIAstrology />} />
          <Route path="about" element={<About />} />
          <Route path="auth" element={<Auth />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
