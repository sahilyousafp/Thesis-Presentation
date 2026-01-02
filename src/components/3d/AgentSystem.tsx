import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sphere, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { MessageCircle } from 'lucide-react'

// ... (Constants same as before)
const BLOCK_SIZE = 10
const STREET_WIDTH = 4
const CELL_SIZE = BLOCK_SIZE + STREET_WIDTH
const ROWS = 12
const COLS = 12
const GRID_OFFSET_X = (COLS * CELL_SIZE) / 2
const GRID_OFFSET_Z = (ROWS * CELL_SIZE) / 2

// Define graph nodes (intersections)
const NODES: THREE.Vector3[] = []
const CONNECTIONS: Map<number, number[]> = new Map()

let nodeIdx = 0
for (let r = -1; r < ROWS; r++) {
  for (let c = -1; c < COLS; c++) {
      const x = (c * CELL_SIZE) + CELL_SIZE/2 - GRID_OFFSET_X
      const z = (r * CELL_SIZE) + CELL_SIZE/2 - GRID_OFFSET_Z
      NODES.push(new THREE.Vector3(x, 0.5, z))
      // ... connections logic same
      const current = nodeIdx
      CONNECTIONS.set(current, [])
      if (c > -1) {
          const left = current - 1
          CONNECTIONS.get(current)?.push(left)
          CONNECTIONS.get(left)?.push(current)
      }
      if (r > -1) {
          const top = current - (COLS + 1)
          CONNECTIONS.get(current)?.push(top)
          CONNECTIONS.get(top)?.push(current)
      }
      nodeIdx++
  }
}

interface AgentProps {
    startNode: number
    color?: string
    mode?: 'normal' | 'trails'
    visible?: boolean
}

function Agent({ startNode, color = '#e9c46a', mode = 'normal', visible = true }: AgentProps) {
    const ref = useRef<THREE.Group>(null)
    const [currentNode, setCurrentNode] = useState(startNode)
    const [targetNode, setTargetNode] = useState<number | null>(null)
    const [interacting, setInteracting] = useState(false)
    const speed = (2 + Math.random() * 2) * (mode === 'trails' ? 1.5 : 1) 

    const startPos = NODES[startNode]
    const pos = useRef(startPos.clone())

    useFrame((state, delta) => {
        if (!ref.current) return

        if (targetNode === null) {
            const neighbors = CONNECTIONS.get(currentNode) || []
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)]
                setTargetNode(next)
            }
        } else {
            const targetPos = NODES[targetNode]
            const dir = new THREE.Vector3().subVectors(targetPos, pos.current)
            const dist = dir.length()
            
            if (dist < 0.1) {
                setCurrentNode(targetNode)
                setTargetNode(null)
                pos.current.copy(targetPos)
            } else {
                dir.normalize().multiplyScalar(speed * delta)
                pos.current.add(dir)
                ref.current.lookAt(targetPos)
            }
        }
        
        ref.current.position.copy(pos.current)

        if (mode === 'normal' && Math.random() < 0.0005 && !interacting) {
             setInteracting(true)
             setTimeout(() => setInteracting(false), 2000)
        }
    })

    const isTrails = mode === 'trails'

    return (
        <group ref={ref} visible={visible}>
            <Trail
                width={(isTrails && visible) ? 12 : 0.001} 
                length={15}
                color={color}
                attenuation={(t) => t * t}
            >
                <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
                    <sphereGeometry args={[isTrails ? 0.3 : 0.4, 16, 16]} />
                    <meshStandardMaterial 
                        color={color} 
                        emissive={color} 
                        emissiveIntensity={(isTrails && visible) ? 2 : 0} 
                        roughness={0.5} 
                    />
                </mesh>
            </Trail>
            
            {!isTrails && visible && (
                <Html 
                    position={[0, 1.2, 0]} 
                    center 
                    zIndexRange={[100, 0]} 
                    style={{ 
                        opacity: interacting ? 1 : 0, 
                        transition: 'opacity 0.4s ease-in-out', 
                        pointerEvents: 'none' 
                    }}
                >
                    <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/30 shadow-2xl scale-110">
                        <MessageCircle size={24} className="text-white opacity-90" />
                    </div>
                </Html>
            )}
        </group>
    )
}

export function AgentSystem({ count = 15, mode = 'normal', visible = true }: { count?: number, mode?: 'normal' | 'trails', visible?: boolean }) {
    const agents = useMemo(() => {
        const a = []
        for(let i=0; i<count; i++) {
            const start = Math.floor(Math.random() * NODES.length)
            const colors = ['#e9c46a', '#f4a261', '#2a9d8f'] 
            const color = colors[Math.floor(Math.random() * colors.length)]
            a.push({ id: i, start, color })
        }
        return a
    }, [count]) 

    return (
        <group>
            {agents.map(agent => (
                <Agent key={agent.id} startNode={agent.start} color={agent.color} mode={mode} visible={visible} />
            ))}
        </group>
    )
}
