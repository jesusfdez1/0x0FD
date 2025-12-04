import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PixelCharacterProps {
  className?: string
  state?: 'idle' | 'walking' | 'reading' | 'thinking' | 'waving'
  direction?: 'left' | 'right'
}

export function PixelCharacter({ className, state = 'idle', direction = 'right' }: PixelCharacterProps) {
  const [frame, setFrame] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [waveFrame, setWaveFrame] = useState(0)

  // Walking animation loop (4 frames for smoothness)
  useEffect(() => {
    if (state !== 'walking') {
      setFrame(0)
      return
    }

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4)
    }, 150)

    return () => clearInterval(interval)
  }, [state])

  // Waving animation loop (faster, smoother)
  useEffect(() => {
    if (state !== 'waving') {
      setWaveFrame(0)
      return
    }
    const interval = setInterval(() => {
      setWaveFrame((prev) => (prev + 1) % 4)
    }, 150)
    return () => clearInterval(interval)
  }, [state])

  // Blinking loop (random intervals)
  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
      
      const nextBlink = Math.random() * 3000 + 2000 // 2-5 seconds
      timeoutId = setTimeout(blinkLoop, nextBlink)
    }

    let timeoutId = setTimeout(blinkLoop, 3000)
    return () => clearTimeout(timeoutId)
  }, [])

  // Breathing animation (CSS-in-JS for simplicity)
  const breatheStyle = {
    animation: ['idle', 'reading', 'thinking', 'waving'].includes(state) ? 'breathe 2s infinite ease-in-out' : 'none',
  }

  return (
    <div className={cn("relative w-16 h-16", className)}>
      <style>
        {`
          @keyframes breathe {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(1px); }
          }
        `}
      </style>
      <svg
        viewBox="0 0 16 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full drop-shadow-md transition-transform duration-300", direction === 'left' ? "scale-x-[-1]" : "")}
        shapeRendering="crispEdges"
        style={breatheStyle}
      >
        {/* --- HAT (Original Ness-like Style) --- */}
        {/* Red Cap Dome */}
        <rect x="4" y="2" width="8" height="3" fill="#E70000" />
        <rect x="3" y="3" width="10" height="2" fill="#E70000" />
        
        {/* Blue Brim (Side/Front) */}
        <rect x="10" y="4" width="4" height="1" fill="#0000AA" />
        <rect x="3" y="4" width="1" height="1" fill="#E70000" /> 

        {/* --- HEAD --- */}
        {/* Hair (Black) */}
        <rect x="3" y="5" width="1" height="4" fill="#111111" />
        <rect x="12" y="5" width="1" height="4" fill="#111111" />
        <rect x="4" y="5" width="8" height="1" fill="#111111" /> {/* Bangs */}

        {/* Face (Skin) */}
        <rect x="4" y="6" width="8" height="5" fill="#FFCCAA" />
        <rect x="5" y="11" width="6" height="1" fill="#FFCCAA" /> {/* Chin */}

        {/* Eyes (Animated) */}
        {!isBlinking ? (
            <>
                {/* Normal Eyes */}
                <rect x="6" y={state === 'reading' || state === 'thinking' ? 8 : 7} width="1" height="2" fill="#000000" />
                <rect x="9" y={state === 'reading' || state === 'thinking' ? 8 : 7} width="1" height="2" fill="#000000" />
            </>
        ) : (
            <>
                {/* Closed Eyes (Blink) */}
                <rect x="5" y={state === 'reading' || state === 'thinking' ? 9 : 8} width="3" height="1" fill="#000000" opacity="0.5" />
                <rect x="8" y={state === 'reading' || state === 'thinking' ? 9 : 8} width="3" height="1" fill="#000000" opacity="0.5" />
            </>
        )}
        
        {/* Blush */}
        <rect x="4" y="9" width="1" height="1" fill="#FF9999" opacity="0.6" />
        <rect x="11" y="9" width="1" height="1" fill="#FF9999" opacity="0.6" />

        {/* --- BODY --- */}
        {/* Shirt (Yellow/Blue Stripes) */}
        <rect x="4" y="12" width="8" height="6" fill="#FFD700" /> {/* Yellow Base */}
        <rect x="4" y="13" width="8" height="1" fill="#0000AA" /> {/* Stripe 1 */}
        <rect x="4" y="15" width="8" height="1" fill="#0000AA" /> {/* Stripe 2 */}
        <rect x="4" y="17" width="8" height="1" fill="#0000AA" /> {/* Stripe 3 */}

        {/* Backpack Straps */}
        <rect x="5" y="12" width="1" height="6" fill="#8B4513" />
        <rect x="10" y="12" width="1" height="6" fill="#8B4513" />

        {/* Arms (Animated) */}
        {state === 'reading' ? (
            // Reading Pose: Hand on chin/holding something
            <g>
                <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" /> {/* Left Arm down */}
                {/* Right Arm up holding chin */}
                <rect x="12" y="12" width="1" height="2" fill="#FFCCAA" /> 
                <rect x="10" y="13" width="2" height="1" fill="#FFCCAA" />
                <rect x="9" y="12" width="1" height="1" fill="#FFCCAA" /> {/* Hand near mouth */}
            </g>
        ) : state === 'thinking' ? (
            // Thinking Pose: Hand scratching head
            <g>
                <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" /> {/* Left Arm down */}
                {/* Right Arm up to head */}
                <rect x="13" y="11" width="1" height="3" fill="#FFCCAA" /> 
                <rect x="12" y="5" width="2" height="2" fill="#FFCCAA" /> {/* Hand on head */}
            </g>
        ) : state === 'waving' ? (
            // Waving Pose (Improved 4-frame animation)
            <g>
                <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" /> {/* Left Arm down */}
                
                {/* Right Arm Base (Shoulder) */}
                <rect x="12" y="12" width="1" height="2" fill="#FFCCAA" />

                {/* Forearm/Hand Animation */}
                {waveFrame === 0 && (
                    <g>
                        <rect x="13" y="9" width="1" height="3" fill="#FFCCAA" /> {/* Vertical */}
                        <rect x="12" y="7" width="3" height="2" fill="#FFCCAA" /> {/* Hand Open */}
                    </g>
                )}
                {waveFrame === 1 && (
                    <g>
                        <rect x="13" y="9" width="1" height="3" fill="#FFCCAA" />
                        <rect x="13" y="7" width="3" height="2" fill="#FFCCAA" /> {/* Hand Right */}
                    </g>
                )}
                {waveFrame === 2 && (
                    <g>
                        <rect x="13" y="9" width="1" height="3" fill="#FFCCAA" />
                        <rect x="12" y="7" width="3" height="2" fill="#FFCCAA" /> {/* Hand Center */}
                    </g>
                )}
                {waveFrame === 3 && (
                    <g>
                        <rect x="12" y="9" width="1" height="3" fill="#FFCCAA" /> {/* Tilted In */}
                        <rect x="11" y="7" width="3" height="2" fill="#FFCCAA" /> {/* Hand Left */}
                    </g>
                )}
            </g>
        ) : (
            // Normal Arms
            <g>
                <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" />
                <rect x="12" y="12" width="1" height="4" fill="#FFCCAA" />
            </g>
        )}

        {/* --- LEGS (4-Frame Animation) --- */}
        {state === 'walking' ? (
            <g>
                {/* Shorts */}
                <rect x="5" y="18" width="6" height="2" fill="#0000AA" />
                
                {/* Frame 0 & 2: Standing */}
                {(frame === 0 || frame === 2) && (
                    <g>
                        <rect x="5" y="20" width="2" height="2" fill="#FFFFFF" />
                        <rect x="9" y="20" width="2" height="2" fill="#FFFFFF" />
                        <rect x="4" y="22" width="3" height="2" fill="#E70000" />
                        <rect x="9" y="22" width="3" height="2" fill="#E70000" />
                    </g>
                )}
                
                {/* Frame 1: Left Leg Up */}
                {frame === 1 && (
                    <g>
                        <rect x="5" y="19" width="2" height="2" fill="#FFFFFF" /> {/* Left Up */}
                        <rect x="4" y="21" width="3" height="2" fill="#E70000" />
                        
                        <rect x="9" y="20" width="2" height="2" fill="#FFFFFF" /> {/* Right Down */}
                        <rect x="9" y="22" width="3" height="2" fill="#E70000" />
                    </g>
                )}

                {/* Frame 3: Right Leg Up */}
                {frame === 3 && (
                    <g>
                        <rect x="5" y="20" width="2" height="2" fill="#FFFFFF" /> {/* Left Down */}
                        <rect x="4" y="22" width="3" height="2" fill="#E70000" />

                        <rect x="9" y="19" width="2" height="2" fill="#FFFFFF" /> {/* Right Up */}
                        <rect x="9" y="21" width="3" height="2" fill="#E70000" />
                    </g>
                )}
            </g>
        ) : (
            // Idle / Reading Legs (Standing)
            <g>
                <rect x="5" y="18" width="6" height="2" fill="#0000AA" />
                <rect x="5" y="20" width="2" height="2" fill="#FFFFFF" />
                <rect x="9" y="20" width="2" height="2" fill="#FFFFFF" />
                <rect x="4" y="22" width="3" height="2" fill="#E70000" />
                <rect x="9" y="22" width="3" height="2" fill="#E70000" />
            </g>
        )}
      </svg>
    </div>
  )
}
