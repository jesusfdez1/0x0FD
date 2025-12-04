import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PixelCharacterProps {
  className?: string
  state?: 'idle' | 'walking' | 'reading' | 'thinking' | 'waving' | 'shocked' | 'happy' | 'sleeping' | 'angry' | 'confused' | 'victory'
  direction?: 'left' | 'right'
  // NUEVO: Propiedad independiente para controlar si habla
  isTalking?: boolean 
}

type PhysicalPose = 'standing' | 'squatting' | 'sitting';

export function PixelCharacter({ 
  className, 
  state = 'idle', 
  direction = 'right',
  isTalking = false 
}: PixelCharacterProps) {
  const [frame, setFrame] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)
    
  // --- LÓGICA DE TRANSICIÓN DE POSTURA ---
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

  // --- VELOCIDADES DE ANIMACIÓN ---
  const ANIMATION_SPEEDS = {
    idle: 800, walking: 120, reading: 1500, thinking: 600, waving: 220, sleeping: 1200, 
    angry: 100, shocked: 60, confused: 1000, happy: 250, victory: 500,
  }

  useEffect(() => {
    setFrame(0)
    // Si está hablando (isTalking), forzamos una velocidad rápida (150ms)
    // para que la boca se mueva bien, independientemente de la acción del cuerpo.
    // Aumentado a 300ms para que sea más lento al hablar
    const speed = isTalking ? 300 : (ANIMATION_SPEEDS[state] || 500)
    
    const timer = setInterval(() => {
      setFrame((prev) => prev + 1)
    }, speed)
    return () => clearInterval(timer)
  }, [state, isTalking])

  // --- PARPADEO ---
  useEffect(() => {
    if (['sleeping', 'shocked', 'angry'].includes(state)) return;
    const blinkTrigger = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
      timeoutId = setTimeout(blinkTrigger, Math.random() * 4000 + 2000)
    }
    let timeoutId = setTimeout(blinkTrigger, 3000)
    return () => clearTimeout(timeoutId)
  }, [state])

  const localFrame = frame % 4 

  // --- FÍSICAS DE PIE (OFFSETS) ---
  const getStandingBodyOffsetY = () => {
    if (currentPose !== 'standing') return 0; 
    switch (state) {
        case 'walking': return (localFrame === 1 || localFrame === 3) ? 1 : 0
        case 'idle': case 'thinking': case 'confused': return (frame % 2 === 0) ? 0 : 1
        case 'victory': return (localFrame % 2 === 0) ? 0 : 4 
        case 'happy': return (localFrame % 2 === 0) ? 0 : 2
        case 'shocked': return (frame % 2 === 0) ? 0 : -1
        case 'angry': return (frame % 2 === 0) ? 0 : 1
        case 'sleeping': return (frame % 2 === 0) ? 1 : 2
        case 'waving': return (frame % 2 === 0) ? 0 : 1
        default: return isTalking ? ((frame % 2 === 0) ? 0 : 1) : 0 // Si habla, rebota un poco
    }
  }

  const getShakeOffsetX = () => {
      if (state === 'angry' || state === 'shocked') return frame % 2 === 0 ? -1 : 1;
      return 0;
  }

  const cartoonBorderStyle = {
    imageRendering: 'pixelated' as const,
    filter: `drop-shadow(1px 0 0 black) drop-shadow(-1px 0 0 black) drop-shadow(0 1px 0 black) drop-shadow(0 -1px 0 black)`
  }

  const showClosedEyes = isBlinking || state === 'sleeping';
  const SHOE_COLOR = "#006600"; 
  let faceColor = "#FFCCAA"; 
  if (state === 'angry') faceColor = "#FF9999";
  if (state === 'shocked') faceColor = "#FFFFAA";

  const C_GOLD = "#FFD700";
  const C_RED = "#FF0000";
  const C_CYAN = "#00FFFF";

  // --- GESTIÓN DE LA BOCA ---
  const getMouth = () => {
    const MOUTH_SOFT    = "#D47070"; 
    const MOUTH_VIBRANT = "#FF5555"; 
    const MOUTH_DEEP    = "#992222"; 
    
    // --- REGLA #1: SI ESTÁ HABLANDO, ESTO TIENE PRIORIDAD ---
    // Esto permite "saludar y hablar", "caminar y hablar", etc.
    if (isTalking) {
        return frame % 2 === 0 
            ? <rect x="7" y="10" width="2" height="2" fill={MOUTH_DEEP} />  // Abierta (A)
            : <rect x="7" y="11" width="2" height="1" fill={MOUTH_SOFT} />  // Cerrada (m)
    }

    // --- REGLA #2: SI NO HABLA, MUESTRA LA EXPRESIÓN DE LA EMOCIÓN ---
    
    // 1. Sorprendido
    if (state === 'shocked') {
        return <rect x="7" y="10" width="2" height="2" fill={MOUTH_DEEP} />
    }

    // 2. Enfadado
    if (state === 'angry') {
        return <rect x="7" y="11" width="2" height="1" fill={MOUTH_DEEP} />
    }

    // 3. Confundido
    if (state === 'confused') {
        return (
            <g fill={MOUTH_SOFT}>
                <rect x="7" y="11" width="1" height="1" />
                <rect x="8" y="10" width="1" height="1" />
            </g>
        )
    }

    // 4. Feliz / Victoria / Saludando (Si NO está hablando)
    if (state === 'happy' || state === 'victory' || state === 'waving') {
        return (
             <g>
                <rect x="7" y="11" width="2" height="1" fill={MOUTH_VIBRANT} />
             </g>
        )
    }

    // 5. Durmiendo
    if (state === 'sleeping') {
        return frame % 2 === 0 
            ? <rect x="7" y="11" width="2" height="1" fill={MOUTH_SOFT} opacity="0.7" />
            : null
    }

    // 6. DEFAULT
    return <rect x="7" y="11" width="2" height="1" fill={MOUTH_SOFT} />
  }

  return (
    <div className={cn("relative w-20 h-20 rendering-pixelated", className)} style={cartoonBorderStyle}>
      <svg
        viewBox="-2 -4 20 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full transition-transform duration-150", direction === 'left' ? "scale-x-[-1]" : "")}
        shapeRendering="crispEdges"
      >
        {/* CAPA DE FONDO: CONFETI/RESPLANDOR */}
        {state === 'victory' && (
           <g opacity={frame % 2 === 0 ? "1" : "0.6"}> 
             <rect x="7" y="-3" width="2" height="2" fill={C_GOLD} />
             <rect x="3" y="-1" width="2" height="2" fill={C_GOLD} /> <rect x="11" y="-1" width="2" height="2" fill={C_GOLD} />
             <rect x="-1" y="5" width="2" height="2" fill={C_GOLD} /> <rect x="15" y="5" width="2" height="2" fill={C_GOLD} />
             <rect x="-1" y="12" width="2" height="2" fill={C_GOLD} /> <rect x="15" y="12" width="2" height="2" fill={C_GOLD} />
           </g>
        )}

        {/* --- PERSONAJE SENTADO --- */}
        {currentPose === 'sitting' && (
            <g transform={`translate(0, 4)`}> 
                <rect x="3" y="4" width="1" height="1" fill="#E70000" /><rect x="4" y="2" width="8" height="3" fill="#E70000" /><rect x="3" y="3" width="10" height="2" fill="#E70000" /><rect x="10" y="4" width="4" height="1" fill="#0000AA" /><rect x="3" y="5" width="11" height="1" fill="#000000" opacity="0.3" /> <rect x="3" y="6" width="1" height="4" fill="#111111" /><rect x="12" y="6" width="1" height="4" fill="#111111" /><rect x="4" y="6" width="8" height="5" fill={faceColor} /><rect x="5" y="11" width="6" height="1" fill={faceColor} />
                {showClosedEyes ? (<><rect x="5" y="8" width="3" height="1" fill="#330000" /><rect x="8" y="8" width="3" height="1" fill="#330000" /></>) : (<><rect x="6" y="8" width="1" height="2" fill="#000000" /><rect x="9" y="8" width="1" height="2" fill="#000000" /></>)}
                
                {getMouth()}

                <rect x="4" y="12" width="8" height="4" fill="#FFD700" /><rect x="4" y="13" width="8" height="1" fill="#0000AA" />
                <g transform={`translate(0, ${frame % 2 === 0 ? 0 : -1})`}> <rect x="2" y="12" width="6" height="6" fill="#8B4513" /><rect x="8" y="12" width="6" height="6" fill="#8B4513" /><rect x="7" y="12" width="2" height="6" fill="#5A3A22" /><rect x="4" y="14" width="2" height="2" fill="#CC9900" opacity="0.6" /><rect x="10" y="14" width="2" height="2" fill="#CC9900" opacity="0.6" /><rect x="1" y="13" width="2" height="2" fill={faceColor} /><rect x="13" y="13" width="2" height="2" fill={faceColor} /></g>
                <rect x="4" y="17" width="3" height="1" fill="#0000AA" /><rect x="9" y="17" width="3" height="1" fill="#0000AA" /><rect x="3" y="18" width="3" height="2" fill={SHOE_COLOR} /><rect x="10" y="18" width="3" height="2" fill={SHOE_COLOR} /><rect x="3" y="20" width="3" height="1" fill="#FFFFFF" /><rect x="10" y="20" width="3" height="1" fill="#FFFFFF" />
            </g>
        )}

        {/* --- PERSONAJE AGACHADO --- */}
        {currentPose === 'squatting' && (
            <g transform={`translate(0, 4)`}>
                <rect x="3" y="4" width="1" height="1" fill="#E70000" /><rect x="4" y="2" width="8" height="3" fill="#E70000" /><rect x="3" y="3" width="10" height="2" fill="#E70000" /><rect x="10" y="4" width="4" height="1" fill="#0000AA" /><rect x="3" y="5" width="11" height="1" fill="#000000" opacity="0.3" /> <rect x="3" y="6" width="1" height="4" fill="#111111" /><rect x="12" y="6" width="1" height="4" fill="#111111" /><rect x="4" y="6" width="8" height="5" fill={faceColor} /><rect x="5" y="11" width="6" height="1" fill={faceColor} />
                <rect x="6" y="7" width="1" height="2" fill="#000000" /><rect x="9" y="7" width="1" height="2" fill="#000000" />
                
                {getMouth()}

                <rect x="4" y="12" width="8" height="5" fill="#FFD700" /><rect x="4" y="13" width="8" height="1" fill="#0000AA" /><rect x="5" y="12" width="1" height="5" fill="#5A3A22" /><rect x="10" y="12" width="1" height="5" fill="#5A3A22" />
                <rect x="2" y="12" width="1" height="4" fill={faceColor} /><rect x="13" y="12" width="1" height="4" fill={faceColor} />
                <rect x="4" y="17" width="8" height="2" fill="#0000AA" /><rect x="3" y="19" width="2" height="1" fill="#FFFFFF" /><rect x="2" y="20" width="3" height="2" fill={SHOE_COLOR} /><rect x="11" y="19" width="2" height="1" fill="#FFFFFF" /><rect x="11" y="20" width="3" height="2" fill={SHOE_COLOR} />
            </g>
        )}

        {/* --- PERSONAJE DE PIE --- */}
        {currentPose === 'standing' && (
        <>
            <g transform={`translate(${getShakeOffsetX()}, ${getStandingBodyOffsetY()})`}>
                <rect x="3" y="4" width="1" height="1" fill="#E70000" /><rect x="4" y="2" width="8" height="3" fill="#E70000" /><rect x="3" y="3" width="10" height="2" fill="#E70000" /><rect x="10" y="4" width="4" height="1" fill="#0000AA" /><rect x="3" y="5" width="11" height="1" fill="#000000" opacity="0.3" /> <rect x="3" y="6" width="1" height="4" fill="#111111" /><rect x="12" y="6" width="1" height="4" fill="#111111" />
                <rect x="4" y="6" width="8" height="5" fill={faceColor} /><rect x="5" y="11" width="6" height="1" fill={faceColor} />
                {showClosedEyes ? (<><rect x="5" y="8" width="3" height="1" fill="#330000" /><rect x="8" y="8" width="3" height="1" fill="#330000" /></>) : state === 'angry' ? (<g fill="#000000"><rect x="5" y="8" width="1" height="1" /><rect x="6" y="9" width="1" height="1" /><rect x="10" y="8" width="1" height="1" /><rect x="9" y="9" width="1" height="1" /></g>) : state === 'shocked' ? (<><rect x="6" y="7" width="1" height="3" fill="#000000" /><rect x="9" y="7" width="1" height="3" fill="#000000" /><rect x="7" y="10" width="2" height="1" fill="#333333" /></>) : state === 'confused' ? (<><rect x="6" y="7" width="1" height="2" fill="#000000" /><rect x="9" y="6" width="1" height="2" fill="#000000" /></>) : state === 'thinking' ? (<><rect x="7" y="7" width="1" height="2" fill="#000000" /><rect x="10" y="7" width="1" height="2" fill="#000000" /></>) : (state === 'victory' || state === 'happy') ? (<><rect x="5" y="8" width="1" height="1" fill="#000000" /><rect x="6" y="7" width="1" height="1" fill="#000000" /><rect x="7" y="8" width="1" height="1" fill="#000000" /> <rect x="8" y="8" width="1" height="1" fill="#000000" /><rect x="9" y="7" width="1" height="1" fill="#000000" /><rect x="10" y="8" width="1" height="1" fill="#000000" /></>) : (<><rect x="6" y="7" width="1" height="2" fill="#000000" /><rect x="9" y="7" width="1" height="2" fill="#000000" /></>)}
                {state !== 'shocked' && state !== 'angry' && (<><rect x="4" y="9" width="1" height="1" fill="#FF9999" /><rect x="11" y="9" width="1" height="1" fill="#FF9999" /></>)}
                
                {/* --- BOCA RENDERIZADA --- */}
                {getMouth()}

                <rect x="4" y="12" width="8" height="5" fill="#FFD700" /><rect x="4" y="13" width="8" height="1" fill="#0000AA" /><rect x="4" y="15" width="8" height="1" fill="#0000AA" /><rect x="4" y="17" width="8" height="1" fill="#111111" /><rect x="5" y="12" width="1" height="6" fill="#5A3A22" /><rect x="10" y="12" width="1" height="6" fill="#5A3A22" />
                
                {/* --- BRAZOS (SALUDANDO TIENE PRIORIDAD VISUAL AQUÍ) --- */}
                {state === 'thinking' ? (<g><rect x="3" y="12" width="1" height="4" fill={faceColor} /><rect x="13" y="11" width="1" height="3" fill={faceColor} /><rect x="12" y="10" width="1" height="1" fill={faceColor} /><rect x={frame % 2 === 0 ? 11 : 12} y="5" width="2" height="2" fill={faceColor} /></g>) : state === 'waving' ? (<g><rect x="3" y="12" width="1" height="4" fill={faceColor} /> <rect x="12" y="11" width="2" height="2" fill={faceColor} /> {(localFrame === 0 || localFrame === 2) && (<g><rect x="13" y="8" width="1" height="3" fill={faceColor} /><rect x="12" y="6" width="3" height="2" fill={faceColor} /></g>)}{localFrame === 1 && (<g><rect x="14" y="9" width="2" height="2" fill={faceColor} /><rect x="15" y="7" width="3" height="2" fill={faceColor} /></g>)}{localFrame === 3 && (<g><rect x="11" y="9" width="2" height="2" fill={faceColor} /><rect x="10" y="7" width="3" height="2" fill={faceColor} /></g>)}</g>) : state === 'angry' ? (<g><rect x="3" y="12" width="1" height="3" fill={faceColor} /> <rect x="12" y="12" width="1" height="3" fill={faceColor} /><rect x="4" y="13" width="8" height="2" fill={faceColor} /></g>) : state === 'confused' ? (<g><rect x="2" y="13" width="1" height="3" fill={faceColor} /><rect x="3" y="14" width="2" height="1" fill={faceColor} /> <rect x="13" y="13" width="1" height="3" fill={faceColor} /><rect x="11" y="14" width="2" height="1" fill={faceColor} /></g>) : (state === 'victory' || state === 'happy') ? (
                    <g><rect x="2" y="8" width="1" height="4" fill={faceColor} /><rect x="3" y="11" width="1" height="1" fill={faceColor} /><rect x="13" y="8" width="1" height="4" fill={faceColor} /><rect x="12" y="11" width="1" height="1" fill={faceColor} /></g>
                ) : state === 'shocked' ? (<g><rect x="4" y="8" width="2" height="3" fill={faceColor} /><rect x="10" y="8" width="2" height="3" fill={faceColor} /></g>) : state === 'walking' ? (<g><rect x="3" y={localFrame === 1 ? 11 : 12} width="1" height="4" fill={faceColor} /><rect x="12" y={localFrame === 3 ? 11 : 12} width="1" height="4" fill={faceColor} /></g>) : (<g><rect x="3" y="12" width="1" height="4" fill={faceColor} /><rect x="12" y="12" width="1" height="4" fill={faceColor} /></g>)}
            </g>
            <rect x="5" y="18" width="6" height="2" fill="#0000AA" />
            {state === 'walking' ? (<g>{(localFrame === 0 || localFrame === 2) && (<g><rect x="5" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="9" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="4" y="22" width="3" height="2" fill={SHOE_COLOR} /><rect x="9" y="22" width="3" height="2" fill={SHOE_COLOR} /></g>)}{localFrame === 1 && (<g><rect x="5" y="19" width="2" height="1" fill="#FFFFFF" /><rect x="4" y="20" width="3" height="2" fill={SHOE_COLOR} /><rect x="9" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="9" y="22" width="3" height="2" fill={SHOE_COLOR} /></g>)}{localFrame === 3 && (<g><rect x="5" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="4" y="22" width="3" height="2" fill={SHOE_COLOR} /><rect x="9" y="19" width="2" height="1" fill="#FFFFFF" /><rect x="9" y="20" width="3" height="2" fill={SHOE_COLOR} /></g>)}</g>) : (<g><rect x="5" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="9" y="20" width="2" height="2" fill="#FFFFFF" /><rect x="4" y="22" width="3" height="2" fill={SHOE_COLOR} /><rect x="9" y="22" width="3" height="2" fill={SHOE_COLOR} /></g>)}
        </>
        )}

        {/* CAPA FRONTAL: CONFETI */}
        {state === 'victory' && (
           <g>
             <rect x="0" y={localFrame * 2} width="1" height="1" fill={C_GOLD} />
             <rect x="14" y={1 + localFrame * 3} width="1" height="1" fill={C_GOLD} />
             <rect x="6" y={-2 + localFrame * 4} width="1" height="1" fill={C_GOLD} />
             <rect x="2" y={5 + localFrame} width="1" height="1" fill={C_RED} />
             <rect x="16" y={localFrame * 2} width="1" height="1" fill={C_RED} />
             <rect x="9" y={-4 + localFrame * 5} width="1" height="1" fill={C_RED} />
             <rect x="-1" y={8 + localFrame} width="1" height="1" fill={C_CYAN} />
             <rect x="12" y={4 + localFrame * 2} width="1" height="1" fill={C_CYAN} />
             <rect x="4" y={-1 + localFrame * 3} width="1" height="1" fill={C_CYAN} />
           </g>
        )}

      </svg>
    </div>
  )
}