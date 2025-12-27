import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, PerspectiveCamera } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

function SaturnPlanet() {
  const planetRef = useRef()
  const ringsRef = useRef()
  const innerRingRef = useRef()

  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z += 0.001
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= 0.0008
    }
  })

  const ringGeometry = useMemo(() => {
    return new THREE.RingGeometry(2.2, 4.2, 128)
  }, [])

  const innerRingGeometry = useMemo(() => {
    return new THREE.RingGeometry(2.0, 2.15, 128)
  }, [])

  const ringMaterial = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, 512, 0)
    gradient.addColorStop(0, 'rgba(240, 220, 190, 0)')
    gradient.addColorStop(0.1, 'rgba(245, 225, 195, 0.4)')
    gradient.addColorStop(0.2, 'rgba(230, 210, 180, 0.7)')
    gradient.addColorStop(0.3, 'rgba(200, 180, 150, 0.3)')
    gradient.addColorStop(0.35, 'rgba(220, 200, 170, 0.8)')
    gradient.addColorStop(0.5, 'rgba(235, 215, 185, 0.85)')
    gradient.addColorStop(0.65, 'rgba(210, 190, 160, 0.75)')
    gradient.addColorStop(0.7, 'rgba(190, 170, 140, 0.4)')
    gradient.addColorStop(0.8, 'rgba(225, 205, 175, 0.8)')
    gradient.addColorStop(0.9, 'rgba(240, 220, 190, 0.5)')
    gradient.addColorStop(1, 'rgba(240, 220, 190, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 64)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.3,
    })
  }, [])

  const planetTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    for (let i = 0; i < 512; i++) {
      const noise = Math.random() * 0.03
      const bandPattern = Math.sin(i * 0.05) * 0.05
      const t = (i / 512) + noise + bandPattern
      
      let r, g, b
      if (t < 0.3) {
        r = 250 - t * 40
        g = 240 - t * 50
        b = 220 - t * 60
      } else if (t < 0.6) {
        r = 235 - (t - 0.3) * 60
        g = 215 - (t - 0.3) * 70
        b = 190 - (t - 0.3) * 80
      } else {
        r = 200 - (t - 0.6) * 100
        g = 180 - (t - 0.6) * 100
        b = 150 - (t - 0.6) * 80
      }

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(0, i, 1024, 1)
    }

    for (let i = 0; i < 8; i++) {
      const y = Math.random() * 512
      const width = 20 + Math.random() * 40
      const opacity = 0.1 + Math.random() * 0.15
      
      ctx.fillStyle = `rgba(180, 160, 140, ${opacity})`
      ctx.fillRect(0, y, 1024, width)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight position={[-5, 3, 5]} intensity={1.2} color="#fff5e6" />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffe4b3" />
      <pointLight position={[-3, -3, -3]} intensity={0.3} color="#ffd699" />

      <mesh ref={planetRef} castShadow receiveShadow>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial
          map={planetTexture}
          roughness={0.7}
          metalness={0.2}
          emissive="#3d2f1f"
          emissiveIntensity={0.05}
        />
      </mesh>

      <mesh
        ref={innerRingRef}
        rotation={[Math.PI / 2.3, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <primitive object={innerRingGeometry} />
        <meshStandardMaterial
          color="#d4c0a8"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      <mesh
        ref={ringsRef}
        rotation={[Math.PI / 2.3, 0, 0]}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={ringGeometry} />
        <primitive object={ringMaterial} attach="material" />
      </mesh>

      <Sphere args={[0.15, 16, 16]} position={[6, 1, 2]}>
        <meshStandardMaterial color="#e8d4bc" emissive="#c4b090" emissiveIntensity={0.3} />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[-5, -2, 3]}>
        <meshStandardMaterial color="#d4c0a8" emissive="#a89070" emissiveIntensity={0.2} />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[4, -3, -2]}>
        <meshStandardMaterial color="#f4e8d8" emissive="#d4c0a8" emissiveIntensity={0.25} />
      </Sphere>
    </group>
  )
}

function OrbitRings() {
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()

  useFrame(() => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += 0.001
    if (ring2Ref.current) ring2Ref.current.rotation.z -= 0.0007
    if (ring3Ref.current) ring3Ref.current.rotation.z += 0.0005
  })

  return (
    <group>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8, 8.05, 128]} />
        <meshBasicMaterial color="#cccccc" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10, 10.05, 128]} />
        <meshBasicMaterial color="#bbbbbb" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[12, 12.05, 128]} />
        <meshBasicMaterial color="#aaaaaa" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function Saturn3D() {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleContextLost = (event) => {
      event.preventDefault()
      setHasError(true)
      console.warn('WebGL context lost. Attempting to restore...')
    }

    const handleContextRestored = () => {
      console.log('WebGL context restored')
      setHasError(false)
    }

    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost)
      canvas.addEventListener('webglcontextrestored', handleContextRestored)

      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost)
        canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      }
    }
  }, [])

  if (hasError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-gray-500 text-sm">3D rendering temporarily unavailable</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative w-full h-full"
      >
        <div className="absolute -inset-40 bg-gradient-to-br from-amber-100/30 via-orange-50/20 to-yellow-100/30 rounded-full blur-3xl"></div>

        <motion.div
          className="absolute inset-0"
          animate={{
            boxShadow: [
              '0 0 80px rgba(230, 200, 170, 0.4)',
              '0 0 140px rgba(230, 200, 170, 0.6)',
              '0 0 80px rgba(230, 200, 170, 0.4)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <Canvas
          shadows
          className="w-full h-full"
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 3, 12]} fov={50} />
          
          <fog attach="fog" args={['#f5f5f5', 10, 30]} />
          
          <SaturnPlanet />
          <OrbitRings />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </motion.div>
    </div>
  )
}
