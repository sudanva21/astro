import { motion } from 'framer-motion'

export default function OrbitingPlanet({ size = 100, duration = 20 }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute w-64 h-64 border border-gray-300 rounded-full"></div>
      <div className="absolute w-96 h-96 border border-gray-200 rounded-full"></div>
      
      <motion.div
        className="absolute"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="rounded-full bg-gradient-to-br from-white to-gray-400 shadow-neo"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transform: `translateX(150px)`,
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-transparent to-black/20"></div>
        </div>
      </motion.div>
    </div>
  )
}
