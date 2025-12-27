import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Starfield from './Starfield'
import FeedbackButton from './FeedbackButton'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white relative">
      <Starfield />
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
      <FeedbackButton />
    </div>
  )
}
