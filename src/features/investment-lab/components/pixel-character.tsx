import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PixelCharacterProps {
  className?: string
  state?: 'idle' | 'walking' | 'reading' | 'thinking' | 'waving' | 'shocked' | 'happy' | 'sleeping'
  direction?: 'left' | 'right'
}

type PhysicalPose = 'standing' | 'squatting' | 'sitting';

export function PixelCharacter({ className, state = 'idle', direction = 'right' }: PixelCharacterProps) {
  const [frame, setFrame] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
  
  // --- LÓGICA DE TRANSICIÓN ---
  const targetPose: PhysicalPose = state === 'reading' ? 'sitting' : 'standing';
  const [currentPose, setCurrentPose] = useState<PhysicalPose>(targetPose);
  const prevTargetPoseRef = useRef(targetPose);

  useEffect(() => {
    if (prevTargetPoseRef.current === targetPose) return;
    if (prevTargetPoseRef.current === 'standing' && targetPose === 'sitting') {
        setCurrentPose('squatting'); 
        setTimeout(() => setCurrentPose('sitting'), 150);
    } else if (prevTargetPoseRef.current === 'sitting' && targetPose === 'standing') {
        setCurrentPose('squatting');
        setTimeout(() => setCurrentPose('standing'), 150);
    } else {
        setCurrentPose(targetPose);
    }
    prevTargetPoseRef.current = targetPose;
  }, [targetPose]);

  // --- VELOCIDADES ---
  const ANIMATION_SPEEDS = {
    idle: 800, walking: 120, reading: 1500, thinking: 600, 
    waving: 220, shocked: 80, happy: 250, sleeping: 1200
  }

  useEffect(() => {
    setFrame(0)
    const timer = setInterval(() => {
      setFrame((prev) => prev + 1)
    }, ANIMATION_SPEEDS[state] || 500)
    return () => clearInterval(timer)
  }, [state])

  // Parpadeo (Funciona globalmente, excepto dormido o asustado)
  useEffect(() => {
    if (['sleeping', 'shocked'].includes(state)) return;
    const blinkTrigger = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
      timeoutId = setTimeout(blinkTrigger, Math.random() * 4000 + 2000)
    }
    let timeoutId = setTimeout(blinkTrigger, 3000)
    return () => clearTimeout(timeoutId)
  }, [state])

  const localFrame = frame % 4 

  // --- FÍSICAS DE PIE ---
  const getStandingBodyOffsetY = () => {
    if (currentPose !== 'standing') return 0; 
    switch (state) {
        case 'walking': return (localFrame === 1 || localFrame === 3) ? 1 : 0
        case 'idle':
        case 'thinking': return (frame % 2 === 0) ? 0 : 1
        case 'happy': return (localFrame % 2 === 0) ? 0 : 2 
        case 'shocked': return (frame % 2 === 0) ? 0 : -1
        case 'sleeping': return (frame % 2 === 0) ? 1 : 2
        case 'waving': return (frame % 2 === 0) ? 0 : 1
        default: return 0
    }
  }

  const cartoonBorderStyle = {
    imageRendering: 'pixelated' as const,
    filter: `drop-shadow(1px 0 0 black) drop-shadow(-1px 0 0 black) drop-shadow(0 1px 0 black) drop-shadow(0 -1px 0 black)`
  }

  // Variable que determina si se deben dibujar ojos cerrados
  const showClosedEyes = isBlinking || state === 'sleeping';
  const SHOE_COLOR = "#006600"; // Verde Oscuro

  return (
    <div className={cn("relative w-16 h-16 rendering-pixelated", className)} style={cartoonBorderStyle}>
      <svg
        viewBox="0 0 16 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full transition-transform duration-150", direction === 'left' ? "scale-x-[-1]" : "")}
        shapeRendering="crispEdges"
      >
        
        {/* ========================================================
            POSTURA 1: SENTADO (SITTING) - ¡AHORA CON PARPADEO!
           ======================================================== */}
        {currentPose === 'sitting' && (
            <g transform={`translate(0, 4)`}> 
                {/* Cabeza y Torso base */}
                <rect x="3" y="4" width="1" height="1" fill="#E70000" /><rect x="4" y="2" width="8" height="3" fill="#E70000" /><rect x="3" y="3" width="10" height="2" fill="#E70000" /><rect x="10" y="4" width="4" height="1" fill="#0000AA" /><rect x="3" y="5" width="11" height="1" fill="#000000" opacity="0.3" /> <rect x="3" y="6" width="1" height="4" fill="#111111" /><rect x="12" y="6" width="1" height="4" fill="#111111" /><rect x="4" y="6" width="8" height="5" fill="#FFCCAA" /><rect x="5" y="11" width="6" height="1" fill="#FFCCAA" />
                
                {/* --- LÓGICA DE OJOS SENTADO --- */}
                {showClosedEyes ? (
                    // Ojos cerrados (Parpadeo)
                    <>
                        <rect x="5" y="8" width="3" height="1" fill="#330000" />
                        <rect x="8" y="8" width="3" height="1" fill="#330000" />
                    </>
                ) : (
                    // Ojos abiertos mirando al libro (Normal)
                    <>
                        <rect x="6" y="8" width="1" height="2" fill="#000000" />
                        <rect x="9" y="8" width="1" height="2" fill="#000000" />
                    </>
                )}

                {/* Resto del cuerpo sentado */}
                <rect x="4" y="12" width="8" height="4" fill="#FFD700" /><rect x="4" y="13" width="8" height="1" fill="#0000AA" />
                <g transform={`translate(0, ${frame % 2 === 0 ? 0 : -1})`}> 
                    <rect x="2" y="12" width="6" height="6" fill="#8B4513" /><rect x="8" y="12" width="6" height="6" fill="#8B4513" /><rect x="7" y="12" width="2" height="6" fill="#5A3A22" /><rect x="4" y="14" width="2" height="2" fill="#CC9900" opacity="0.6" /><rect x="10" y="14" width="2" height="2" fill="#CC9900" opacity="0.6" />
                    <rect x="1" y="13" width="2" height="2" fill="#FFCCAA" /><rect x="13" y="13" width="2" height="2" fill="#FFCCAA" />
                </g>
                <rect x="4" y="17" width="3" height="1" fill="#0000AA" /><rect x="9" y="17" width="3" height="1" fill="#0000AA" />
                <rect x="3" y="18" width="3" height="2" fill={SHOE_COLOR} /><rect x="10" y="18" width="3" height="2" fill={SHOE_COLOR} />
                <rect x="3" y="20" width="3" height="1" fill="#FFFFFF" /><rect x="10" y="20" width="3" height="1" fill="#FFFFFF" />
            </g>
        )}

        {/* ========================================================
            POSTURA 2: AGACHADO (TRANSICIÓN)
           ======================================================== */}
        {currentPose === 'squatting' && (
            <g transform={`translate(0, 4)`}>
                <rect x="3" y="4" width="1" height="1" fill="#E70000" /><rect x="4" y="2" width="8" height="3" fill="#E70000" /><rect x="3" y="3" width="10" height="2" fill="#E70000" /><rect x="10" y="4" width="4" height="1" fill="#0000AA" /><rect x="3" y="5" width="11" height="1" fill="#000000" opacity="0.3" /> <rect x="3" y="6" width="1" height="4" fill="#111111" /><rect x="12" y="6" width="1" height="4" fill="#111111" /><rect x="4" y="6" width="8" height="5" fill="#FFCCAA" /><rect x="5" y="11" width="6" height="1" fill="#FFCCAA" />
                <rect x="6" y="7" width="1" height="2" fill="#000000" /><rect x="9" y="7" width="1" height="2" fill="#000000" />
                <rect x="4" y="12" width="8" height="5" fill="#FFD700" /><rect x="4" y="13" width="8" height="1" fill="#0000AA" /><rect x="5" y="12" width="1" height="5" fill="#5A3A22" /><rect x="10" y="12" width="1" height="5" fill="#5A3A22" />
                <rect x="2" y="12" width="1" height="4" fill="#FFCCAA" /><rect x="13" y="12" width="1" height="4" fill="#FFCCAA" />
                <rect x="4" y="17" width="8" height="2" fill="#0000AA" />
                <rect x="3" y="19" width="2" height="1" fill="#FFFFFF" />
                <rect x="2" y="20" width="3" height="2" fill={SHOE_COLOR} />
                <rect x="11" y="19" width="2" height="1" fill="#FFFFFF" />
                <rect x="11" y="20" width="3" height="2" fill={SHOE_COLOR} />
            </g>
        )}

        {/* ========================================================
            POSTURA 3: DE PIE (STANDING)
           ======================================================== */}
        {currentPose === 'standing' && (
        <>
            <g transform={`translate(0, ${getStandingBodyOffsetY()})`}>
                <rect x="3" y="4" width="1" height="1" fill="#E70000" /><rect x="4" y="2" width="8" height="3" fill="#E70000" /><rect x="3" y="3" width="10" height="2" fill="#E70000" /><rect x="10" y="4" width="4" height="1" fill="#0000AA" /><rect x="3" y="5" width="11" height="1" fill="#000000" opacity="0.3" /> <rect x="3" y="6" width="1" height="4" fill="#111111" /><rect x="12" y="6" width="1" height="4" fill="#111111" /><rect x="4" y="6" width="8" height="5" fill="#FFCCAA" /><rect x="5" y="11" width="6" height="1" fill="#FFCCAA" />
                {showClosedEyes ? (<><rect x="5" y="8" width="3" height="1" fill="#330000" /><rect x="8" y="8" width="3" height="1" fill="#330000" /></>) : state === 'shocked' ? (<><rect x="6" y="7" width="1" height="3" fill="#000000" /><rect x="9" y="7" width="1" height="3" fill="#000000" /><rect x="7" y="10" width="2" height="1" fill="#AA4444" /></>) : state === 'thinking' ? (<><rect x="7" y="7" width="1" height="2" fill="#000000" /><rect x="10" y="7" width="1" height="2" fill="#000000" /></>) : (<><rect x="6" y="7" width="1" height="2" fill="#000000" /><rect x="9" y="7" width="1" height="2" fill="#000000" /></>)}
                {state !== 'shocked' && (<><rect x="4" y="9" width="1" height="1" fill="#FF9999" /><rect x="11" y="9" width="1" height="1" fill="#FF9999" /></>)}
                <rect x="4" y="12" width="8" height="5" fill="#FFD700" /><rect x="4" y="13" width="8" height="1" fill="#0000AA" /><rect x="4" y="15" width="8" height="1" fill="#0000AA" /><rect x="4" y="17" width="8" height="1" fill="#111111" /><rect x="5" y="12" width="1" height="6" fill="#5A3A22" /><rect x="10" y="12" width="1" height="6" fill="#5A3A22" />
                
                {/* Brazos y Animaciones (Waving Mejorado) */}
                {state === 'thinking' ? (<g><rect x="3" y="12" width="1" height="4" fill="#FFCCAA" /><rect x="13" y="11" width="1" height="3" fill="#FFCCAA" /><rect x="12" y="10" width="1" height="1" fill="#FFCCAA" /><rect x={frame % 2 === 0 ? 11 : 12} y="5" width="2" height="2" fill="#FFCCAA" /></g>) 
                : state === 'waving' ? (
                    <g>
                        <rect x="3" y="12" width="1" height="4" fill="#FFCCAA" /> 
                        <rect x="12" y="11" width="2" height="2" fill="#FFCCAA" /> 
                        {(localFrame === 0 || localFrame === 2) && (<g><rect x="13" y="8" width="1" height="3" fill="#FFCCAA" /><rect x="12" y="6" width="3" height="2" fill="#FFCCAA" /></g>)}
                        {localFrame === 1 && (<g><rect x="14" y="9" width="2" height="2" fill="#FFCCAA" /><rect x="15" y="7" width="3" height="2" fill="#FFCCAA" /></g>)}
                        {localFrame === 3 && (<g><rect x="11" y="9" width="2" height="2" fill="#FFCCAA" /><rect x="10" y="7" width="3" height="2" fill="#FFCCAA" /></g>)}
                    </g>
                ) 
                : state === 'happy' ? (<g><rect x="2" y="9" width="1" height="3" fill="#FFCCAA" /><rect x="3" y="11" width="1" height="1" fill="#FFCCAA" /><rect x="13" y="9" width="1" height="3" fill="#FFCCAA" /><rect x="12" y="11" width="1" height="1" fill="#FFCCAA" /></g>) : state === 'shocked' ? (<g><rect x="3" y="12" width="1" height="5" fill="#FFCCAA" /><rect x="12" y="12" width="1" height="5" fill="#FFCCAA" /></g>) : state === 'walking' ? (<g><rect x="3" y={localFrame === 1 ? 11 : 12} width="1" height="4" fill="#FFCCAA" /><rect x="12" y={localFrame === 3 ? 11 : 12} width="1" height="4" fill="#FFCCAA" /></g>) : (<g><rect x="3" y="12" width="1" height="4" fill="#FFCCAA" /><rect x="12" y="12" width="1" height="4" fill="#FFCCAA" /></g>)}
            </g>

            {/* Piernas de Pie */}
            <rect x="5" y="18" width="6" height="2" fill="#0000AA" />
            {state === 'walking' ? (<g>{(localFrame === 0 || localFrame === 2) && (<g><rect x="5" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="9" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="4" y="22" width="3" height="2" fill={SHOE_COLOR} /><rect x="9" y="22" width="3" height="2" fill={SHOE_COLOR} /></g>)}{localFrame === 1 && (<g><rect x="5" y="19" width="2" height="1" fill="#FFFFFF" /><rect x="4" y="20" width="3" height="2" fill={SHOE_COLOR} /><rect x="9" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="9" y="22" width="3" height="2" fill={SHOE_COLOR} /></g>)}{localFrame === 3 && (<g><rect x="5" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="4" y="22" width="3" height="2" fill={SHOE_COLOR} /><rect x="9" y="19" width="2" height="1" fill="#FFFFFF" /><rect x="9" y="20" width="3" height="2" fill={SHOE_COLOR} /></g>)}</g>) : (<g><rect x="5" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="9" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="4" y="22" width="3" height="2" fill={SHOE_COLOR} /><rect x="9" y="22" width="3" height="2" fill={SHOE_COLOR} /></g>)}
        </>
        )}
      </svg>
    </div>
  )
}