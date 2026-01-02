import { useMemo } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'

interface BlockProps {
  position: [number, number, number]
  size?: number
  chamfer?: number
  height?: number
  color?: string
}

export function EixampleBlock({ 
  position, 
  size = 10, 
  chamfer = 2.5, 
  height = 4,
  color = '#1a1a1a' 
}: BlockProps) {
  
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    // Center the shape calculation around 0,0 for easier positioning
    const half = size / 2
    
    s.moveTo(-half, -half + chamfer)
    s.lineTo(-half + chamfer, -half)
    s.lineTo(half - chamfer, -half)
    s.lineTo(half, -half + chamfer)
    s.lineTo(half, half - chamfer)
    s.lineTo(half - chamfer, half)
    s.lineTo(-half + chamfer, half)
    s.lineTo(-half, half - chamfer)
    s.closePath()
    return s
  }, [size, chamfer])

  const extrudeSettings = useMemo(() => ({
    depth: height,
    bevelEnabled: false, 
  }), [height])

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={color} transparent={true} opacity={1} />
    </mesh>
  )
}
