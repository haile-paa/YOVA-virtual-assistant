import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, RoundedBox, Sparkles } from '@react-three/drei'

const C = { amber: '#f6c453', cream: '#efe6d8', clay: '#6b3d38', bark: '#3a2e25', ink: '#241c16' }

function Line({ x = 0, y = 0, w = 1, color, h = 0.07 }) {
  return (
    <RoundedBox args={[w, h, 0.02]} radius={0.03} position={[x, y, 0.06]}>
      <meshStandardMaterial color={color} roughness={0.6} />
    </RoundedBox>
  )
}

/** Small UI-card stand-ins for the things YOVA keeps: schedule, notes, an idea, tasks. */
function CardFace({ kind }) {
  if (kind === 'schedule')
    return (
      <>
        <Line x={-0.28} y={0.3} w={0.8} h={0.1} color={C.ink} />
        <Line x={0} y={0.08} w={1.2} color="#cdbda3" />
        <Line x={0} y={-0.1} w={1.2} color="#cdbda3" />
        <RoundedBox args={[0.9, 0.2, 0.02]} radius={0.06} position={[0, -0.33, 0.06]}>
          <meshStandardMaterial color={C.ink} />
        </RoundedBox>
      </>
    )
  if (kind === 'notes')
    return (
      <>
        <Line x={-0.2} y={0.28} w={0.8} h={0.1} color={C.amber} />
        <Line x={0} y={0.05} w={1.2} color="#b07a73" />
        <Line x={-0.1} y={-0.13} w={1.0} color="#b07a73" />
        <Line x={-0.25} y={-0.31} w={0.7} color="#b07a73" />
      </>
    )
  if (kind === 'idea')
    return (
      <>
        <mesh position={[-0.5, 0.28, 0.08]}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
        <Line x={0.05} y={0.28} w={0.9} h={0.09} color={C.ink} />
        <RoundedBox args={[0.5, 0.12, 0.02]} radius={0.05} position={[-0.4, 0.05, 0.06]}>
          <meshStandardMaterial color="#8fd1b8" />
        </RoundedBox>
        <Line x={0} y={-0.14} w={1.2} color="#a67c1f" />
        <Line x={-0.15} y={-0.32} w={0.9} color="#a67c1f" />
      </>
    )
  return (
    <>
      <Line x={-0.4} y={0.32} w={0.5} h={0.1} color={C.ink} />
      {[0.1, -0.1, -0.3].map((y, i) => (
        <group key={y}>
          <RoundedBox args={[0.15, 0.15, 0.02]} radius={0.03} position={[-0.52, y, 0.06]}>
            <meshStandardMaterial color={i === 0 ? C.amber : '#cdbda3'} />
          </RoundedBox>
          <Line x={0.12} y={y} w={0.9} color="#cdbda3" />
        </group>
      ))}
    </>
  )
}

const CARDS = [
  { kind: 'schedule', color: C.cream, a: 0.0 },
  { kind: 'notes', color: C.clay, a: Math.PI * 0.5 },
  { kind: 'idea', color: C.amber, a: Math.PI },
  { kind: 'tasks', color: C.cream, a: Math.PI * 1.5 },
]

function Card({ kind, color, a, calm }) {
  const g = useRef()
  useFrame((state) => {
    const t = calm ? 0 : state.clock.elapsedTime * 0.35
    const ang = a + t
    const x = Math.cos(ang) * 3.5
    const z = Math.sin(ang) * 2.2
    g.current.position.set(x, Math.sin(ang * 2 + a) * 0.45, z)
    g.current.lookAt(state.camera.position)
    g.current.scale.setScalar(0.85 + (z + 2.2) * 0.07)
  })
  return (
    <group ref={g}>
      <RoundedBox args={[1.6, 1.05, 0.09]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </RoundedBox>
      <CardFace kind={kind} />
    </group>
  )
}

function World({ calm, narrow }) {
  const root = useRef()
  const orb = useRef()
  const ring = useRef()
  useFrame((state, delta) => {
    root.current.rotation.y += (state.pointer.x * 0.35 - root.current.rotation.y) * 0.05
    root.current.rotation.x += (-state.pointer.y * 0.2 - root.current.rotation.x) * 0.05
    if (!calm) {
      orb.current.rotation.y += delta * 0.25
      ring.current.rotation.z += delta * 0.18
    }
  })
  const pos = useMemo(() => (narrow ? [0, 0.2, 0] : [2.7, 0, 0]), [narrow])

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} />
      <pointLight position={[-4, -2, 3]} intensity={30} color={C.amber} />
      <pointLight position={[3, 3, -3]} intensity={25} color="#c46a5e" />
      <group position={pos} scale={narrow ? 0.62 : 1}>
        <group ref={root}>
          <mesh ref={orb}>
            <icosahedronGeometry args={[1.25, 24]} />
            <MeshDistortMaterial color={C.amber} emissive="#b8801a" emissiveIntensity={0.55} roughness={0.25} metalness={0.15} distort={calm ? 0 : 0.34} speed={1.6} />
          </mesh>
          <mesh ref={ring} rotation={[1.25, 0.2, 0]}>
            <torusGeometry args={[1.9, 0.014, 8, 140]} />
            <meshBasicMaterial color={C.amber} />
          </mesh>
          {CARDS.map((c) => <Card key={c.kind} {...c} calm={calm} />)}
          <Sparkles count={60} scale={[9, 5, 5]} size={3} speed={calm ? 0 : 0.4} color={C.amber} />
        </group>
      </group>
    </>
  )
}

export default function OrbScene({ calm = false, narrow = false, active = true }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9.5], fov: 38 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      eventSource={document.getElementById('root')}
      eventPrefix="client"
    >
      <World calm={calm} narrow={narrow} />
    </Canvas>
  )
}
