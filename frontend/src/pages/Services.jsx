import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const services = [
  {
    title: 'Tarot Reading',
    description: 'Unlock the wisdom of the cards and gain clarity on your path forward',
    features: ['3-Card Spread', 'Celtic Cross', 'Relationship Reading'],
    icon: '🔮',
    price: '$49',
  },
  {
    title: 'Kundli Analysis',
    description: 'Complete Vedic astrology chart with detailed interpretations',
    features: ['Birth Chart', 'Dasha Predictions', 'Remedial Measures'],
    icon: '📿',
    price: '$79',
  },
  {
    title: 'Vastu Consultation',
    description: 'Harmonize your living space with ancient architectural wisdom',
    features: ['Home Assessment', 'Office Layout', 'Remedial Solutions'],
    icon: '🏠',
    price: '$99',
  },
  {
    title: 'Numerology',
    description: 'Discover the hidden meanings in numbers and their influence on your life',
    features: ['Life Path Number', 'Destiny Analysis', 'Name Compatibility'],
    icon: '🔢',
    price: '$39',
  },
  {
    title: 'Personal Consultation',
    description: 'One-on-one session with experienced astrologers',
    features: ['60-min Session', 'Personalized Report', 'Follow-up Support'],
    icon: '👤',
    price: '$129',
  },
  {
    title: 'Compatibility Report',
    description: 'Understand relationship dynamics through astrological synastry',
    features: ['Love Compatibility', 'Business Partnerships', 'Family Dynamics'],
    icon: '💫',
    price: '$59',
  },
]

export default function Services() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">Our Services</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Professional astrological services tailored to guide your journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="neo-card p-8 group"
            >
              <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-black">{service.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
              
              <div className="space-y-3 mb-8">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm bg-gradient-to-r from-gray-50 to-white rounded-xl p-2 shadow-neo-sm">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mr-3 shadow-neo-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent">{service.price}</span>
                <button className="neo-button text-sm">
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 neo-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-purple-100/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">Not sure which service is right for you?</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Schedule a free 15-minute consultation to discuss your needs with our expert astrologers
            </p>
            <button className="neo-button text-base">
              Schedule Free Consultation →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
