import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import Phone3D from './Phone3D'
import { features, screen } from '../data/content'

// One phone that spins and swaps its screen as the active feature changes.
function Spinner({ index }) {
  const g = useRef()
  const spin = useRef({ cur: 0, target: 0, last: 0 })
  const textures = useTexture(features.map((f) => screen(f.img)))
  useEffect(() => {
    if (spin.current.last !== index) { spin.current.target += Math.PI * 2; spin.current.last = index }
  }, [index])
  useFrame(({ pointer, clock }, dt) => {
    const s = spin.current
    s.cur = THREE.MathUtils.damp(s.cur, s.target, 3.2, dt)
    g.current.rotation.y = s.cur - 0.28 + pointer.x * 0.3
    g.current.rotation.x = -pointer.y * 0.12
    g.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.08
  })
  return (
    <group ref={g}>
      <Phone3D texture={textures[index]} scale={1.3} />
    </group>
  )
}
export default function ShowcaseScene({ index }) {
  return (
    <div className="h-[460px] md:h-[600px]" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6.6], fov: 40 }} dpr={[1, 1.8]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffd48a" />
        <pointLight position={[-4, -1, 3]} intensity={12} color="#d58a1f" />
        <Suspense fallback={null}>
          <Spinner index={index} />
          <Sparkles count={30} scale={[6, 6, 3]} size={3} speed={0.35} color="#f4c04a" />
        </Suspense>
      </Canvas>
    </div>
  )
}
