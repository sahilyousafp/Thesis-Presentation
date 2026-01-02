import { EixampleBlock } from './EixampleBlock'

interface CityGridProps {
  rows?: number
  cols?: number
  blockSize?: number
  streetWidth?: number
  blockColor?: string
}

export function CityGrid({ 
  rows = 6, 
  cols = 6, 
  blockSize = 10, 
  streetWidth = 4,
  blockColor
}: CityGridProps) {
  const blocks = []
  const offsetX = (cols * (blockSize + streetWidth)) / 2
  const offsetZ = (rows * (blockSize + streetWidth)) / 2

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = j * (blockSize + streetWidth) - offsetX
      const z = i * (blockSize + streetWidth) - offsetZ
      blocks.push(
        <EixampleBlock 
          key={`${i}-${j}`} 
          position={[x, 0, z]} 
          size={blockSize}
          color={blockColor}
        />
      )
    }
  }

  return <group>{blocks}</group>
}
