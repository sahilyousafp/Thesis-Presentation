import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Cylinder, Box, Html } from '@react-three/drei'
import * as THREE from 'three'
import { MessageSquare } from 'lucide-react'

// Palettes for variety
const SHIRTS = ["#16a34a", "#2563eb", "#db2777"] // Green, Blue, Pink
const PANTS = ["#78350f", "#1e293b", "#4c1d95"] // Brown, Slate, Deep Purple
const SKINS = ["#fca5a5", "#fdba74", "#fcd34d"] // Light, Tan, Yellowish

const LoadingDots = () => {
    return (
        <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
    )
}

function LowPolyHuman({ position, rotation, scale = 1, colorShirt = "#16a34a", colorPants = "#78350f", colorSkin = "#fdba74", isSpeaking = false }: any) {
    const group = useRef<THREE.Group>(null)
    const timeOffset = Math.random() * 100

    useFrame((state) => {
        if (!group.current) return
        const t = state.clock.getElapsedTime() + timeOffset
        
        // Very subtle idle sway only (No bounce)
        group.current.rotation.y = rotation[1] + Math.sin(t * 1) * 0.05
    })

    const bodyMat = <meshStandardMaterial flatShading color={colorShirt} roughness={0.8} />
    const skinMat = <meshStandardMaterial flatShading color={colorSkin} roughness={0.5} />
    const pantsMat = <meshStandardMaterial flatShading color={colorPants} roughness={0.9} />

    return (
        <group ref={group} position={position} rotation={rotation} scale={scale}>
            {/* Head: Faceted Sphere */}
            <mesh position={[0, 1.65, 0]}>
                <dodecahedronGeometry args={[0.22, 0]} />
                {skinMat}
            </mesh>

            {/* Neck */}
            <mesh position={[0, 1.45, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.15, 6]} />
                {skinMat}
            </mesh>

            {/* Torso (Shirt) */}
            <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[0.25, 0.22, 0.6, 6]} />
                {bodyMat}
            </mesh>
            
            {/* Arms (Shoulders + Sleeves + Arms) */}
            {/* Left Arm */}
            <group position={[-0.28, 1.3, 0]} rotation={[0, 0, 0.2]}>
                {/* Sleeve */}
                <mesh position={[0, -0.1, 0]}>
                     <cylinderGeometry args={[0.08, 0.07, 0.25, 5]} />
                     {bodyMat}
                </mesh>
                {/* Forearm */}
                <mesh position={[0, -0.4, 0]}>
                     <cylinderGeometry args={[0.06, 0.05, 0.45, 5]} />
                     {skinMat}
                </mesh>
            </group>

            {/* Right Arm */}
            <group position={[0.28, 1.3, 0]} rotation={[0, 0, -0.2]}>
                 {/* Sleeve */}
                <mesh position={[0, -0.1, 0]}>
                     <cylinderGeometry args={[0.08, 0.07, 0.25, 5]} />
                     {bodyMat}
                </mesh>
                 {/* Forearm */}
                <mesh position={[0, -0.4, 0]}>
                     <cylinderGeometry args={[0.06, 0.05, 0.45, 5]} />
                     {skinMat}
                </mesh>
            </group>

            {/* Hips/Pants */}
            <mesh position={[0, 0.82, 0]}>
                <cylinderGeometry args={[0.23, 0.23, 0.15, 6]} />
                {pantsMat}
            </mesh>

            {/* Legs */}
            {/* Left Leg */}
            <mesh position={[-0.12, 0.4, 0]}>
                <cylinderGeometry args={[0.1, 0.08, 0.85, 5]} />
                {pantsMat}
            </mesh>
             {/* Right Leg */}
            <mesh position={[0.12, 0.4, 0]}>
                <cylinderGeometry args={[0.1, 0.08, 0.85, 5]} />
                {pantsMat}
            </mesh>

             {/* Feet */}
            <mesh position={[-0.12, 0.05, 0.05]}>
                <boxGeometry args={[0.12, 0.1, 0.25]} />
                {pantsMat} {/* Using pants color for shoes for simplicity or add shoe color */}
            </mesh>
            <mesh position={[0.12, 0.05, 0.05]}>
                <boxGeometry args={[0.12, 0.1, 0.25]} />
                {pantsMat} 
            </mesh>

            {/* Conversation Bubble */}
            {isSpeaking && (
                <Html position={[0.4, 2.1, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
                    <div className="bg-black/80 backdrop-blur-xl px-2 py-1.5 rounded-lg border border-white/10 shadow-2xl flex items-center gap-1.5 transform origin-bottom-left animate-in fade-in zoom-in-75 duration-300">
                         <LoadingDots />
                    </div>
                </Html>
            )}
        </group>
    )
}

export function HumanInteraction() {
    const [speakerIndex, setSpeakerIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setSpeakerIndex((prev) => (prev + 1) % 3)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <group position={[10, 0, 10]} scale={[0.5, 0.5, 0.5]}> 
             <LowPolyHuman 
                position={[-1.2, 0, 0.8]} 
                rotation={[0, -2, 0]} // Face IN
                colorShirt={SHIRTS[0]} 
                colorPants={PANTS[0]}
                colorSkin={SKINS[0]}
                isSpeaking={speakerIndex === 0}
             />
             <LowPolyHuman 
                position={[1.2, 0, 0.4]} 
                rotation={[0, -4.5, 0]} // Face IN
                colorShirt={SHIRTS[1]} 
                colorPants={PANTS[1]}
                colorSkin={SKINS[1]}
                isSpeaking={speakerIndex === 1}
             />
             <LowPolyHuman 
                position={[0, 0, -1.0]} 
                rotation={[0, 0, 0]} // Face Forward (Back to camera?) No, -1 is Back. So face 0 (Forward).
                colorShirt={SHIRTS[2]} 
                colorPants={PANTS[2]}
                colorSkin={SKINS[2]}
                isSpeaking={speakerIndex === 2}
             />
             
             {/* Centerpoint Marker (Optional, maybe hidden or subtle) */}
             <mesh position={[0, 0.1, 0]}>
                 <ringGeometry args={[1.5, 1.6, 32]} />
                 <meshBasicMaterial color="white" opacity={0.2} transparent />
             </mesh>
        </group>
    )
}
