import { useEffect, useRef } from 'react'

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      opacity: Math.random(),
      speed: Math.random() * 0.5,
    }))

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      stars.forEach((star) => {
        star.opacity += star.speed * 0.01
        if (star.opacity > 1 || star.opacity < 0) {
          star.speed *= -1
        }
        
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 0, 0, ${star.opacity * 0.2})`
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  )
}
