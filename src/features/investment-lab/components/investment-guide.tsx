import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, ChevronLeft, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PixelCharacter } from './pixel-character'

export function InvestmentGuide() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(true)
  const [step, setStep] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties | null>(null)
  const [characterPos, setCharacterPos] = useState<{ top: number, left: number } | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const prevPosRef = useRef<{ top: number, left: number } | null>(null)
  const [minimizedState, setMinimizedState] = useState<'idle' | 'thinking' | 'waving' | 'sleeping' | 'happy'>('idle')

  const steps = [
    {
      key: 'welcome',
      target: null, // General welcome
    },
    {
      key: 'sentiment',
      target: 'market-sentiment',
    },
    {
      key: 'insights',
      target: 'ai-insights',
    },
    {
      key: 'screener',
      target: 'opportunity-screener',
    },
    {
      key: 'help',
      target: null, // Final help message
    },
  ]

  // Random state for minimized character
  useEffect(() => {
    if (!isMinimized) return;
    const states: ('idle' | 'thinking' | 'waving' | 'sleeping' | 'happy')[] = ['idle', 'thinking', 'waving', 'sleeping', 'happy'];
    const interval = setInterval(() => {
        const randomState = states[Math.floor(Math.random() * states.length)];
        setMinimizedState(randomState);
    }, 4000);
    return () => clearInterval(interval);
  }, [isMinimized]);

  // Helper to calculate position
  const calculatePosition = (targetId: string | null) => {
      if (!targetId) return null

      const element = document.getElementById(targetId)
      if (!element) return null

      const rect = element.getBoundingClientRect()
      
      // Highlight style
      const highlight = {
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
      }

      // Character position
      const spaceRight = window.innerWidth - rect.right
      const spaceLeft = rect.left
      
      let charLeft = 0
      let charTop = rect.top + rect.height / 2 - 50 // Center vertically relative to element

      if (spaceRight > 350) {
          charLeft = rect.right + 20
      } else if (spaceLeft > 350) {
          charLeft = rect.left - 320
      } else {
          // If no space on sides, place below or above
          charLeft = window.innerWidth / 2 - 150
          
          // Check if enough space below
          if (window.innerHeight - rect.bottom > 350) {
             charTop = rect.bottom + 20
          } else {
             // Place above
             charTop = rect.top - 320
          }
      }
      
      // Ensure it stays within viewport with safe margins
      // Increased bottom margin to 300px to avoid cutting off the character/bubble
      charTop = Math.max(20, Math.min(window.innerHeight - 300, charTop))
      charLeft = Math.max(20, Math.min(window.innerWidth - 320, charLeft))

      return { highlight, charPos: { top: charTop, left: charLeft } }
  }

  useEffect(() => {
    if (!isOpen || isMinimized) {
        setHighlightStyle(null)
        setCharacterPos(null)
        return
    }

    const targetId = steps[step].target
    if (targetId) {
        const element = document.getElementById(targetId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            
            // Initial calculation after scroll (small delay to allow scroll to start/finish)
            setTimeout(() => {
                const result = calculatePosition(targetId)
                if (result) {
                    setHighlightStyle(result.highlight)
                    
                    const newPos = result.charPos
                    // Determine direction and set moving state
                    if (prevPosRef.current) {
                        if (newPos.left < prevPosRef.current.left) {
                            setDirection('left')
                        } else {
                            setDirection('right')
                        }
                        setIsMoving(true)
                        setTimeout(() => setIsMoving(false), 1000)
                    }
                    
                    prevPosRef.current = newPos
                    setCharacterPos(newPos)
                }
            }, 500)

        } else {
            setHighlightStyle(null)
            setCharacterPos(null)
        }
    } else {
        if (step === 0 || steps[step].key === 'help') {
            // Center for welcome step AND help step
            const charLeft = (window.innerWidth - 300) / 2
            const charTop = (window.innerHeight - 400) / 2
            setCharacterPos({ top: charTop, left: charLeft })
            setHighlightStyle(null)
        } else {
            setHighlightStyle(null)
            setCharacterPos(null)
        }
    }
  }, [step, isOpen, isMinimized])

  // Handle window resize AND scroll to update highlight position
  useEffect(() => {
      const handleUpdate = () => {
          if (isOpen && !isMinimized) {
              if (steps[step].target) {
                  const result = calculatePosition(steps[step].target)
                  if (result) {
                      setHighlightStyle(result.highlight)
                      // We update character pos too to keep it anchored to the element
                      setCharacterPos(result.charPos) 
                  }
              } else if (step === 0 || steps[step].key === 'help') {
                  // Update center position on resize
                  const charLeft = (window.innerWidth - 300) / 2
                  const charTop = (window.innerHeight - 400) / 2 
                  setCharacterPos({ top: charTop, left: charLeft })
              }
          }
      }
      
      window.addEventListener('resize', handleUpdate)
      window.addEventListener('scroll', handleUpdate, true) // Capture phase for all scrolls
      
      return () => {
          window.removeEventListener('resize', handleUpdate)
          window.removeEventListener('scroll', handleUpdate, true)
      }
  }, [step, isOpen, isMinimized])

  // Lock user scroll interaction when guide is open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const preventDefault = (e: Event) => {
          e.preventDefault()
      }
      
      const preventKeys = (e: KeyboardEvent) => {
          if (['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
              e.preventDefault()
          }
      }

      // Block scroll events
      window.addEventListener('wheel', preventDefault, { passive: false })
      window.addEventListener('touchmove', preventDefault, { passive: false })
      window.addEventListener('keydown', preventKeys)
      
      // Hide scrollbar to prevent dragging
      const style = document.createElement('style')
      style.id = 'guide-scroll-lock'
      style.innerHTML = `
        body::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `
      document.head.appendChild(style)

      return () => {
          window.removeEventListener('wheel', preventDefault)
          window.removeEventListener('touchmove', preventDefault)
          window.removeEventListener('keydown', preventKeys)
          
          const el = document.getElementById('guide-scroll-lock')
          if (el) el.remove()
      }
    }
  }, [isOpen, isMinimized])


  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setIsOpen(false)
    }
  }

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    setIsOpen(false)
  }

  const handleRestart = () => {
    setStep(0)
    setIsOpen(true)
    setIsMinimized(false)
  }

  // Default position (bottom right) if no target
  const defaultPos = { bottom: '2rem', right: '2rem' }
  
  // Dynamic style for the container
  const containerStyle: React.CSSProperties = characterPos 
    ? { 
        top: characterPos.top, 
        left: characterPos.left, 
        position: 'fixed',
        transition: 'all 1s ease-in-out' // Smooth walking transition
      } 
    : { 
        ...defaultPos, 
        position: 'fixed',
        transition: 'all 1s ease-in-out'
      }

  return (
    <>
        {/* Highlight Overlay */}
        {highlightStyle && (
            <div 
                className="fixed z-40 border-2 border-primary rounded-xl pointer-events-none transition-all duration-300 ease-in-out shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                style={highlightStyle}
            />
        )}

        {/* Welcome Backdrop (Shadow Method for consistency) */}
        {isOpen && !isMinimized && (step === 0 || steps[step].key === 'help') && (
             <div className="fixed top-1/2 left-1/2 w-0 h-0 z-40 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
        )}

        {(isMinimized || !isOpen) && (
            <div 
                className="fixed bottom-4 right-4 z-50 cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                    if (!isOpen) {
                        handleRestart()
                    } else {
                        setIsMinimized(false)
                    }
                }}
            >
                <div className="w-24 h-24 bg-card border-2 border-black dark:border-white rounded-xl shadow-lg overflow-hidden flex items-center justify-center relative">
                    {/* Window Header */}
                    <div className="absolute top-0 left-0 w-full h-5 bg-accent border-b border-black dark:border-white flex items-center px-2 gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-black/20"></div>
                    </div>
                    <PixelCharacter className="w-16 h-16 mt-3" state={minimizedState} />
                </div>
            </div>
        )}

        {isOpen && !isMinimized && (
            <div 
                className="z-[70] flex flex-col items-center w-[300px]"
                style={containerStyle}
            >
                {/* Speech Bubble */}
                <div className="relative bg-card border-2 border-black dark:border-white text-card-foreground p-4 rounded-xl shadow-lg mb-2 w-full animate-in fade-in zoom-in duration-300">
                    
                    <div className="mb-4">
                        <p className="text-sm leading-relaxed font-medium">
                            {t(`investmentLab.guide.${steps[step].key}`)}
                        </p>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <span className="text-xs text-muted-foreground flex items-center">
                                {step + 1} / {steps.length}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {step > 0 && (
                                <Button variant="ghost" size="sm" onClick={handlePrev} className="h-8 px-2 hover:bg-accent/50">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleNext} className="h-8 px-2 hover:bg-accent/50">
                                {step === steps.length - 1 ? t('investmentLab.guide.close') : t('investmentLab.guide.next')}
                                {step < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                            </Button>
                        </div>
                    </div>

                    {/* Triangle/Tail pointing down to character */}
                    <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-card border-b-2 border-r-2 border-black dark:border-white transform rotate-45 -translate-x-1/2"></div>
                </div>

                {/* Pixel Character */}
                <div className="relative w-24 h-24">
                    <PixelCharacter 
                        className="w-full h-full drop-shadow-2xl" 
                        state={isMoving ? 'walking' : (steps[step].key === 'help' ? 'victory' : (steps[step].target ? 'reading' : 'waving'))}
                        direction={direction}
                    />
                </div>

            </div>
        )}
    </>
  )
}
