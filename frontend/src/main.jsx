import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import './index.css'
import './horoscope-styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
