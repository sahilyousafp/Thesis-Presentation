import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { CityGrid } from './components/3d/CityGrid'
import { AgentSystem } from './components/3d/AgentSystem'
import { HumanInteraction } from './components/3d/HumanInteraction'
import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import clsx from 'clsx'

// --- 3D Scene Controller ---
function SceneLogic({ tabIndex }: { tabIndex: number }) {
    const { camera, scene } = useThree()
    const cityRef = useRef<THREE.Group>(null)
    const currentProgress = useRef(0)
    const lastOpacity = useRef(1)

    // Initialize camera once
    useEffect(() => {
        camera.up.set(0, 1, 0)
    }, [camera])

    useFrame((state, delta) => {
        // Interpolate `currentProgress` towards `tabIndex`
        currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, tabIndex, delta * 1.5)
        const p = currentProgress.current

        // --- Camera Positions ---
        const introPos = new THREE.Vector3(40, 30, 40)
        // Offset slightly to avoid gimbal lock while keeping up=(0,1,0)
        const litPos = new THREE.Vector3(0.01, 90, 0.01) 
        const nextPos = new THREE.Vector3(45, 1.5, 35) 
        const nextLookAt = new THREE.Vector3(60, 3, 26)
        
        let targetPos = new THREE.Vector3()
        let targetLookAt = new THREE.Vector3(0,0,0)

        // Segment Logic
        if (p < 1) {
            targetPos.lerpVectors(introPos, litPos, p)
            targetLookAt.set(0,0,0)
        } else if (p < 2) {
            targetPos.copy(litPos)
            targetLookAt.set(0,0,0)
        } else {
            const t = p - 2
            targetPos.lerpVectors(litPos, nextPos, t)
            targetLookAt.lerpVectors(new THREE.Vector3(0,0,0), nextLookAt, t)
        }

        // --- Visibility & Opacity Logic ---
        if (cityRef.current) {
            let opacity = 1
            if (p >= 1 && p < 2) {
                 opacity = 1 - (THREE.MathUtils.smoothstep(p, 1.2, 1.8) * 0.8) // Fades to 0.2
            } else if (p >= 2) {
                opacity = 0.2 + (THREE.MathUtils.smoothstep(p, 2.0, 2.4) * 0.1) // 0.2 to 0.3
            }
            
            cityRef.current.visible = true 
            
            if (Math.abs(opacity - lastOpacity.current) > 0.001) {
                cityRef.current.traverse((child: any) => {
                    if (child.isMesh && child.material) {
                        child.material.opacity = opacity
                        child.material.transparent = true 
                    }
                })
                lastOpacity.current = opacity
            }
        }

        // --- GLOBAL DARK MODE Background & Fog ---
        scene.background = new THREE.Color('#1a1a1a')
        if (p >= 2.5) {
            scene.fog = new THREE.Fog('#1a1a1a', 10, 60)
        } else {
            scene.fog = new THREE.Fog('#1a1a1a', 30, 150)
        }

        // Apply Final Camera Transform
        camera.position.copy(targetPos) 
        camera.lookAt(targetLookAt)
    })

    const agentMode = (tabIndex === 2) ? 'trails' : 'normal'
    const humansVisible = tabIndex === 3

    return (
        <group>
            <group ref={cityRef}>
                <CityGrid rows={12} cols={12} blockColor="#555555" />
                <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                     <planeGeometry args={[1000, 1000]} />
                     <meshStandardMaterial color="#222222" roughness={0.9} />
                </mesh>
            </group>

            {/* Persistent AgentSystem to keep history alive */}
            <AgentSystem 
                count={50} 
                mode={agentMode} 
                visible={tabIndex < 3} 
            />

            {humansVisible && (
                <group position={[32 , 0.5, 33]} rotation={[0, Math.PI / 4, 0]}>
                    <HumanInteraction />
                </group>
            )}
        </group>
    )
}

const SECTIONS = [
  { id: 'intro', label: 'Introduction' },
  { id: 'literature', label: 'Literature' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'nextsteps', label: 'Next Steps' }
]

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveTab((prev) => (prev + 1) % SECTIONS.length)
      } else if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => (prev - 1 + SECTIONS.length) % SECTIONS.length)
      } else if (e.key === 'ArrowUp') {
        scrollRef.current?.scrollBy({ top: -100, behavior: 'smooth' })
      } else if (e.key === 'ArrowDown') {
        scrollRef.current?.scrollBy({ top: 100, behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="w-full h-screen relative bg-[#1a1a1a] text-white font-sans overflow-hidden flex flex-col">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows className="w-full h-full">
           <SceneLogic tabIndex={activeTab} />
           <ambientLight intensity={0.4} />
           <directionalLight position={[20, 50, 20]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        </Canvas>
      </div>

      {/* Navigation - Fixed Top */}
      <header className="relative z-50 pt-8 px-8 flex justify-center">
        <nav className="bg-black/40 backdrop-blur-xl px-2 py-2 rounded-full border border-white/10 flex gap-2 shadow-2xl transition-all">
          {SECTIONS.map((item, index) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(index)}
              className={clsx(
                "px-6 py-2 rounded-full text-sm font-bold tracking-tight transition-all duration-300",
                activeTab === index 
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transform scale-105" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto mt-8 px-4 overflow-hidden">
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full h-full"
            >
                {/* Scrollable Container - Scrollbar Hidden */}
                <div 
                    ref={scrollRef}
                    className="w-full h-full overflow-y-auto pr-4 scrollbar-hide"
                >
                    
                    {activeTab === 0 && (
                        <div className="min-h-[120%] pb-20 pt-10">
                            <h1 className="text-8xl font-black mb-8 text-white tracking-tighter">Introduction</h1>
                            <p className="text-3xl text-gray-400 mb-12 max-w-2xl font-light leading-snug">
                               Understanding the <strong className="text-white">Urban Fabric</strong> through artificial agents.
                            </p>
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
                                     <h3 className="font-bold text-xl mb-4 text-white uppercase tracking-widest text-xs opacity-50">Relevance</h3>
                                     <p className="text-gray-300 text-lg">Simulating social interactions to predict urban vitality.</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
                                     <h3 className="font-bold text-xl mb-4 text-white uppercase tracking-widest text-xs opacity-50">Outcome</h3>
                                     <p className="text-gray-300 text-lg">A generative framework for architectural decision making.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 1 && (
                        <div className="min-h-[120%] pb-20 pt-10">
                            <h1 className="text-8xl font-black mb-12 text-white tracking-tighter">Literature</h1>
                            <div className="space-y-12">
                                <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl">
                                    <h3 className="text-4xl font-bold text-white mb-4">State of the Art</h3>
                                    <p className="text-xl text-gray-400 leading-relaxed">
                                        Traditional ABM focuses on physical collision. We focus on <span className="text-white font-bold underline decoration-thesis-secondary decoration-4 underline-offset-8">social collision</span>.
                                    </p>
                                </div>
                                <div className="h-96 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
                                    <span className="text-gray-600 font-bold text-xl uppercase tracking-widest opacity-30">Diagram Prototype</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 2 && (
                        <div className="min-h-[120%] pb-20 pt-10 text-white">
                            <h1 className="text-8xl font-black mb-12 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-600 tracking-tighter">Experiments</h1>
                            <div className="grid grid-cols-1 gap-12">
                                <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl">
                                    <h3 className="text-3xl font-bold mb-4">Agent Trails</h3>
                                    <p className="text-lg text-gray-400">Visualizing high-frequency paths through the Eixample grid.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 h-[500px] rounded-3xl overflow-hidden">
                                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-transparent to-black/40">
                                        <span className="text-gray-500 font-mono text-sm uppercase tracking-[0.5em]">Realtime Flow Data</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 3 && (
                        <div className="min-h-[120%] pb-20 pt-10 flex flex-col items-end">
                            <h1 className="text-8xl font-black mb-12 text-white tracking-tighter text-right w-full">Next Steps</h1>
                            <div className="bg-black/60 backdrop-blur-2xl p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 w-full max-w-xl">
                                <h3 className="text-3xl font-bold mb-6 text-white">Human Interaction</h3>
                                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                    Integrating nuanced non-verbal cues and multi-agent conversation logic.
                                </p>
                                <div className="flex gap-4">
                                    <div className="h-32 flex-1 bg-white/5 rounded-2xl border border-white/5"></div>
                                    <div className="h-32 flex-1 bg-white/5 rounded-2xl border border-white/5"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default App
