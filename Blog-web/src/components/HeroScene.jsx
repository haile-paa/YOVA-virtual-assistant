import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Phone3D from './Phone3D'
import { screen } from '../data/content'

function Rig() {
  const group = useRef(), ring = useRef()
  const [home, dash, chat] = useTexture([screen('home'), screen('dash'), screen('chat')])
  useFrame(({ pointer, clock }, dt) => {
    const g = group.current
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.45, 3, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.18, 3, dt)
    ring.current.rotation.z = clock.elapsedTime * 0.12
  })
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffd48a" />
      <pointLight position={[-4, -1, 3]} intensity={12} color="#d58a1f" />
      <group ref={group}>
        <mesh ref={ring} position={[0, 0, -1.2]} rotation={[0.5, 0.3, 0]}>
          <torusGeometry args={[2.9, 0.012, 8, 120]} />
          <meshBasicMaterial color="#f4b942" transparent opacity={0.45} />
        </mesh>
        <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.7}>
          <Phone3D texture={home} position={[0, 0, 0.4]} scale={1.05} />
        </Float>
        <Float speed={1.3} floatIntensity={0.6}>
          <Phone3D texture={dash} position={[-1.85, -0.3, -0.5]} rotation={[0, 0.5, 0.08]} scale={0.85} />
        </Float>
        <Float speed={1.9} floatIntensity={0.6}>
          <Phone3D texture={chat} position={[1.85, -0.3, -0.5]} rotation={[0, -0.5, -0.08]} scale={0.85} />
        </Float>
      </group>
      <Sparkles count={40} scale={[8, 5, 4]} size={3} speed={0.4} color="#f4c04a" />
    </>
  )
}
export default function HeroScene({ className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7.2], fov: 40 }} dpr={[1, 1.8]} gl={{ alpha: true, antialias: true }}>
        <Suspense fallback={null}><Rig /></Suspense>
      </Canvas>
    </div>
  )
}
