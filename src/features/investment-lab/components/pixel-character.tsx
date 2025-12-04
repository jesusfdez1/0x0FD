import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PixelCharacterProps {
  className?: string
  state?: 'idle' | 'walking' | 'reading' | 'thinking' | 'waving' | 'shocked' | 'happy' | 'sleeping'
  direction?: 'left' | 'right'
}

export function PixelCharacter({ className, state = 'idle', direction = 'right' }: PixelCharacterProps) {
  const [frame, setFrame] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)

  // --- CONFIGURACIÓN DE VELOCIDADES ---
  const ANIMATION_SPEEDS = {
    idle: 800, walking: 120, reading: 1000, thinking: 600,
    waving: 180, shocked: 80, happy: 250, sleeping: 1200
  }

  useEffect(() => {
    setFrame(0)
    const timer = setInterval(() => {
      setFrame((prev) => prev + 1)
    }, ANIMATION_SPEEDS[state] || 500)
    return () => clearInterval(timer)
  }, [state])

  useEffect(() => {
    if (state === 'sleeping' || state === 'shocked') return;
    const blinkTrigger = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
      timeoutId = setTimeout(blinkTrigger, Math.random() * 4000 + 2000)
    }
    let timeoutId = setTimeout(blinkTrigger, 3000)
    return () => clearTimeout(timeoutId)
  }, [state])

  const localFrame = frame % 4 

  // --- FÍSICAS (Rebote vertical) ---
  const getBodyOffsetY = () => {
    switch (state) {
        case 'walking': return (localFrame === 1 || localFrame === 3) ? 1 : 0
        case 'idle':
        case 'reading':
        case 'thinking': return (frame % 2 === 0) ? 0 : 1
        case 'happy': return (localFrame % 2 === 0) ? 0 : 2 
        case 'shocked': return (frame % 2 === 0) ? 0 : -1
        case 'sleeping': return (frame % 2 === 0) ? 1 : 2
        case 'waving': return (frame % 2 === 0) ? 0 : 1
        default: return 0
    }
  }
  const upperBodyTransform = `translate(0, ${getBodyOffsetY()})`

  // --- ESTILO CARTOON (Borde Negro) ---
  // Este es el truco: 4 sombras duras que crean un borde de 1px alrededor de todo.
  const cartoonBorderStyle = {
    imageRendering: 'pixelated' as const, // Asegura que los píxeles sean nítidos
    filter: `
        drop-shadow(1px 0 0 black) 
        drop-shadow(-1px 0 0 black) 
        drop-shadow(0 1px 0 black) 
        drop-shadow(0 -1px 0 black)
    `
  }

  const showClosedEyes = isBlinking || state === 'sleeping';
  const showWideEyes = state === 'shocked';

  return (
    // Aplicamos el estilo cartoon al contenedor principal
    <div className={cn("relative w-16 h-16 rendering-pixelated", className)} style={cartoonBorderStyle}>
      <svg
        viewBox="0 0 16 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        // Quitamos drop-shadow-md aquí porque ya tenemos el borde negro fuerte
        className={cn("w-full h-full transition-transform duration-150", direction === 'left' ? "scale-x-[-1]" : "")}
        shapeRendering="crispEdges" // Crucial para que el borde no se vea borroso
      >
        {/* === GRUPO SUPERIOR === */}
        <g transform={upperBodyTransform}>
            
            {/* Gorra (Añadí un separador negro en la visera) */}
            <rect x="3" y="4" width="1" height="1" fill="#E70000" />
            <rect x="4" y="2" width="8" height="3" fill="#E70000" />
            <rect x="3" y="3" width="10" height="2" fill="#E70000" />
            <rect x="10" y="4" width="4" height="1" fill="#0000AA" />
            {/* Separador negro entre gorra y pelo/cara */}
            <rect x="3" y="5" width="11" height="1" fill="#000000" opacity="0.3" /> 

            {/* Pelo y Cara */}
            <rect x="3" y="6" width="1" height="4" fill="#111111" />
            <rect x="12" y="6" width="1" height="4" fill="#111111" />
            <rect x="4" y="6" width="8" height="5" fill="#FFCCAA" />
            <rect x="5" y="11" width="6" height="1" fill="#FFCCAA" />

            {/* Ojos */}
            {showClosedEyes ? (
                <>
                    <rect x="5" y="8" width="3" height="1" fill="#330000" />
                    <rect x="8" y="8" width="3" height="1" fill="#330000" />
                </>
            ) : showWideEyes ? (
                 <>
                    <rect x="6" y="7" width="1" height="3" fill="#000000" />
                    <rect x="9" y="7" width="1" height="3" fill="#000000" />
                    <rect x="7" y="10" width="2" height="1" fill="#AA4444" />
                </>
            ) : state === 'thinking' ? (
                <>
                    <rect x="7" y="7" width="1" height="2" fill="#000000" />
                    <rect x="10" y="7" width="1" height="2" fill="#000000" />
                </>
            ) : (
                <>
                    <rect x="6" y="7" width="1" height="2" fill="#000000" />
                    <rect x="9" y="7" width="1" height="2" fill="#000000" />
                </>
            )}

            {/* Rubor (Más sutil con el borde negro) */}
            {state !== 'shocked' && (
                <>
                 <rect x="4" y="9" width="1" height="1" fill="#FF9999" />
                 <rect x="11" y="9" width="1" height="1" fill="#FF9999" />
                </>
            )}

            {/* --- TORSO (Con líneas internas negras) --- */}
            {/* Base amarilla */}
            <rect x="4" y="12" width="8" height="5" fill="#FFD700" />
            {/* Rayas azules */}
            <rect x="4" y="13" width="8" height="1" fill="#0000AA" />
            <rect x="4" y="15" width="8" height="1" fill="#0000AA" />
            {/* CINTURÓN NEGRO (Separador interno) */}
            <rect x="4" y="17" width="8" height="1" fill="#111111" />
            
            {/* Mochila */}
            <rect x="5" y="12" width="1" height="6" fill="#5A3A22" />
            <rect x="10" y="12" width="1" height="6" fill="#5A3A22" />

            {/* Brazos (Simplificados para el estilo cartoon) */}
            {state === 'reading' ? (
                <g>
                    <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" />
                    <rect x="11" y="13" width="3" height="1" fill="#FFCCAA" /> 
                    <rect x="10" y="12" width="1" height="1" fill="#FFCCAA" /> 
                    <g transform={`translate(0, ${frame % 2 === 0 ? 0 : 1})`}> 
                        <rect x="9" y="11" width="4" height="3" fill="#666666" />
                        <rect x="10" y="12" width="2" height="1" fill="#FFFFFF" />
                    </g>
                </g>
            ) : state === 'thinking' ? (
                <g>
                    <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" />
                    <rect x="13" y="11" width="1" height="3" fill="#FFCCAA" />
                    <rect x="12" y="10" width="1" height="1" fill="#FFCCAA" />
                    <rect x={frame % 2 === 0 ? 11 : 12} y="5" width="2" height="2" fill="#FFCCAA" />
                </g>
            ) : state === 'waving' ? (
                <g>
                    <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" />
                    <rect x="12" y="11" width="1" height="2" fill="#FFCCAA" />
                    <rect x="13" y="9" width="1" height="2" fill="#FFCCAA" />
                    <rect x={localFrame % 2 === 0 ? 11 : 13} y="6" width="2" height="3" fill="#FFCCAA" />
                </g>
            ) : state === 'happy' ? (
                <g>
                    <rect x="2" y="9" width="1" height="3" fill="#FFCCAA" />
                    <rect x="3" y="11" width="1" height="1" fill="#FFCCAA" />
                    <rect x="13" y="9" width="1" height="3" fill="#FFCCAA" />
                    <rect x="12" y="11" width="1" height="1" fill="#FFCCAA" />
                </g>
             ) : state === 'shocked' ? (
                <g>
                   <rect x="3" y="12" width="1" height="5" fill="#FFCCAA" />
                   <rect x="12" y="12" width="1" height="5" fill="#FFCCAA" />
                </g>
            ) : state === 'walking' ? (
                <g>
                    <rect x="3" y={localFrame === 1 ? 11 : 12} width="1" height="4" fill="#FFCCAA" />
                    <rect x="12" y={localFrame === 3 ? 11 : 12} width="1" height="4" fill="#FFCCAA" />
                </g>
            ) : (
                <g>
                   <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" />
                   <rect x="12" y="12" width="1" height="4" fill="#FFCCAA" />
                </g>
            )}
        </g>

        {/* --- PIERNAS --- */}
        <rect x="5" y="18" width="6" height="2" fill="#0000AA" />
        {state === 'walking' ? (
            <g>
                {(localFrame === 0 || localFrame === 2) && (
                    <g>
                        <rect x="5" y="20" width="2" height="2" fill="#FFFFFF" />
                        <rect x="9" y="20" width="2" height="2" fill="#FFFFFF" />
                        <rect x="4" y="22" width="3" height="2" fill="#990000" />
                        <rect x="9" y="22" width="3" height="2" fill="#990000" />
                    </g>
                )}
                {localFrame === 1 && (
                    <g>
                        <rect x="5" y="19" width="2" height="1" fill="#FFFFFF" />
                        <rect x="4" y="20" width="3" height="2" fill="#990000" />
                        <rect x="9" y="20" width="2" height="2" fill="#FFFFFF" />
                        <rect x="9" y="22" width="3" height="2" fill="#990000" />
                    </g>
                )}
                {localFrame === 3 && (
                    <g>
                        <rect x="5" y="20" width="2" height="2" fill="#FFFFFF" />
                        <rect x="4" y="22" width="3" height="2" fill="#990000" />
                        <rect x="9" y="19" width="2" height="1" fill="#FFFFFF" />
                        <rect x="9" y="20" width="3" height="2" fill="#990000" />
                    </g>
                )}
            </g>
        ) : (
            <g>
                <rect x="5" y="20" width="2" height="2" fill="#FFFFFF" />
                <rect x="9" y="20" width="2" height="2" fill="#FFFFFF" />
                <rect x="4" y="22" width="3" height="2" fill="#990000" />
                <rect x="9" y="22" width="3" height="2" fill="#990000" />
            </g>
        )}
      </svg>
    </div>
  )
}