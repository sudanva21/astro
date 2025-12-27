import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function RotatingPlanet({ position, color, size, speed }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.01;
      meshRef.current.rotation.y += speed * 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[size, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function ZodiacRing() {
  const ringRef = useRef();
  const particlesRef = useRef();

  const particles = useMemo(() => {
    const temp = [];
    const count = 200;
    const radius = 5;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.5;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.001;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <>
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5, 0.05, 16, 100]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#a78bfa"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </>
  );
}

function AstroScene() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <group ref={groupRef}>
        <RotatingPlanet position={[-3, 0, -2]} color="#ec4899" size={0.3} speed={0.5} />
        <RotatingPlanet position={[3, 1, -1]} color="#8b5cf6" size={0.4} speed={0.3} />
        <RotatingPlanet position={[0, -1, -3]} color="#06b6d4" size={0.25} speed={0.7} />
        <RotatingPlanet position={[-2, 2, 0]} color="#f59e0b" size={0.35} speed={0.4} />
        <RotatingPlanet position={[2, -2, -2]} color="#10b981" size={0.3} speed={0.6} />
      </group>

      <ZodiacRing />

      <mesh position={[0, 0, -5]}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color="#1e1b4b"
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.3}
          metalness={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}

export default function AstroBackground() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleContextLost = (event) => {
      event.preventDefault();
      setHasError(true);
      console.warn('WebGL context lost in AstroBackground');
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored in AstroBackground');
      setHasError(false);
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);

      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }
  }, []);

  if (hasError) {
    return (
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81)' }} />
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #312e81)' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
        }}
      >
        <AstroScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
