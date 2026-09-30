import { RoundedBox } from '@react-three/drei'
// A 3D phone: rounded metal body + screenshot on the front face.
export default function Phone3D({ texture, ...props }) {
  return (
    <group {...props}>
      <RoundedBox args={[1.5, 3.06, 0.13]} radius={0.17} smoothness={5}>
        <meshStandardMaterial color="#120c07" metalness={0.75} roughness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0, 0.066]}>
        <planeGeometry args={[1.38, 2.83]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.36, 0.068]}>
        <circleGeometry args={[0.035, 20]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  )
}
