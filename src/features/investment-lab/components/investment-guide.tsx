import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, ChevronLeft, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PixelCharacter } from './pixel-character'

interface InvestmentGuideProps {
  activeTab?: string
}

export function InvestmentGuide({ activeTab = 'overview' }: InvestmentGuideProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(false)
  const [step, setStep] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties | null>(null)
  const [characterPos, setCharacterPos] = useState<{ top: number, left: number } | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const prevPosRef = useRef<{ top: number, left: number } | null>(null)
  const [minimizedState, setMinimizedState] = useState<'idle' | 'thinking' | 'waving' | 'sleeping' | 'happy' | 'reading' | 'confused' | 'victory'>('idle')

  const allSteps: Record<string, { key?: string; title?: string; content?: string; target: string | null }[]> = {
    overview: [
      { key: 'welcome', target: null },
      { key: 'sentiment', target: 'market-sentiment' },
      { key: 'insights', target: 'ai-insights' },
      { key: 'screener', target: 'opportunity-screener' },
      { key: 'help', target: null },
    ],
    'market-health': [
        { key: 'marketHealth.intro', target: null },
        { key: 'marketHealth.valuation', target: 'market-valuation' },
        { key: 'marketHealth.sentiment', target: 'market-sentiment-card' },
        { key: 'marketHealth.credit', target: 'market-credit' },
        { key: 'marketHealth.conclusion', target: null }
    ],
    macro: [
        { key: 'macro.intro', target: null },
        { key: 'macro.usa', target: 'macro-usa' },
        { key: 'macro.eurozone', target: 'macro-eurozone' },
        { key: 'macro.china', target: 'macro-china' },
        { key: 'macro.conclusion', target: null }
    ],
    fundamental: [
        { key: 'fundamental.intro', target: null },
        { key: 'fundamental.profitability', target: 'fundamental-profitability' },
        { key: 'fundamental.liquidity', target: 'fundamental-liquidity' },
        { key: 'fundamental.operating', target: 'fundamental-operating' },
        { key: 'fundamental.conclusion', target: null }
    ],
    technical: [
        { key: 'technical.intro', target: null },
        { key: 'technical.trend', target: 'technical-trend' },
        { key: 'technical.momentum', target: 'technical-momentum' },
        { key: 'technical.volatility', target: 'technical-volatility' },
        { key: 'technical.conclusion', target: null }
    ],
    gold: [
        { key: 'gold.intro', target: null },
        { key: 'gold.metals', target: 'gold-metals' },
        { key: 'gold.energy', target: 'gold-energy' },
        { key: 'gold.drivers', target: 'gold-drivers' },
        { key: 'gold.conclusion', target: null }
    ],
    'ml-models': [
        { key: 'mlModels.intro', target: null },
        { key: 'mlModels.classification', target: 'ml-classification' },
        { key: 'mlModels.timeseries', target: 'ml-timeseries' },
        { key: 'mlModels.conclusion', target: null }
    ]
  }

  const steps = allSteps[activeTab] || allSteps['overview']

  // Safety check to prevent crash when switching tabs with different step counts
  const safeStep = Math.min(step, steps.length - 1)
  const currentStep = steps[safeStep] || steps[0]

  useEffect(() => {
    const seen = localStorage.getItem(`hasSeenInvestmentGuide_${activeTab}`)
    setHasSeenGuide(!!seen)
    setStep(0)
    setIsOpen(false)
  }, [activeTab])

  // Talk when step changes
  useEffect(() => {
    if (isOpen && !isMinimized && currentStep) {
        // Solo hablar en el saludo (step 0), cuando hay un objetivo (leyendo) o en la ayuda final (victoria)
        const shouldTalk = safeStep === 0 || !!currentStep.target || currentStep.key === 'help';

        if (shouldTalk) {
            setIsTalking(true)
            // Calculate duration based on text length roughly, or fixed time
            const timer = setTimeout(() => setIsTalking(false), 4000) 
            return () => clearTimeout(timer)
        } else {
            setIsTalking(false)
        }
    }
  }, [safeStep, isOpen, isMinimized, currentStep])

  // Random state for minimized character
  useEffect(() => {
    if (!isMinimized && isOpen) return;
    
    // Less "crazy" behavior: mostly idle, occasionally does something else
    const states: ('idle' | 'thinking' | 'waving' | 'sleeping' | 'happy' | 'reading' | 'confused' | 'victory')[] = 
        ['idle', 'idle', 'idle', 'idle', 'waving', 'sleeping', 'happy'];
        
    const interval = setInterval(() => {
        const randomState = states[Math.floor(Math.random() * states.length)];
        setMinimizedState(randomState);
    }, 5000); // Slower interval (5s instead of 3s)
    
    return () => clearInterval(interval);
  }, [isMinimized, isOpen]);

  // Helper to calculate position
  const calculatePosition = (targetId: string | null) => {
      // If no target, return center position instead of null (which sends it to bottom-right)
      if (!targetId) {
          const charLeft = (window.innerWidth - 300) / 2
          const charTop = (window.innerHeight - 400) / 2
          return { highlight: null, charPos: { top: charTop, left: charLeft } }
      }

      const element = document.getElementById(targetId)
      if (!element) {
          // Fallback to center if element not found
          const charLeft = (window.innerWidth - 300) / 2
          const charTop = (window.innerHeight - 400) / 2
          return { highlight: null, charPos: { top: charTop, left: charLeft } }
      }

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

  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isOpen || isMinimized) {
        setHighlightStyle(null)
        return
    }

    // Clear previous timeouts
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

    const targetId = currentStep.target
    
    const updatePosition = () => {
        if (targetId) {
            const element = document.getElementById(targetId)
            if (element) {
                const result = calculatePosition(targetId)
                if (result) {
                    setHighlightStyle(result.highlight)
                    const newPos = result.charPos
                    
                    if (prevPosRef.current) {
                        // Only animate move if distance is significant (> 50px)
                        const dist = Math.sqrt(Math.pow(newPos.left - prevPosRef.current.left, 2) + Math.pow(newPos.top - prevPosRef.current.top, 2))
                        
                        if (dist > 50) {
                            if (newPos.left < prevPosRef.current.left) {
                                setDirection('left')
                            } else {
                                setDirection('right')
                            }
                            setIsMoving(true)
                            moveTimeoutRef.current = setTimeout(() => setIsMoving(false), 1000)
                        }
                    }
                    prevPosRef.current = newPos
                    setCharacterPos(newPos)
                }
            } else {
                 // Fallback center
                 const result = calculatePosition(null)
                 setHighlightStyle(null)
                 if (result) setCharacterPos(result.charPos)
            }
        } else {
            // Center
            const result = calculatePosition(null)
            setHighlightStyle(null)
            if (result) setCharacterPos(result.charPos)
        }
    }

    if (targetId) {
        const element = document.getElementById(targetId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Wait for scroll
            scrollTimeoutRef.current = setTimeout(updatePosition, 600)
        } else {
            updatePosition()
        }
    } else {
        updatePosition()
    }

    return () => {
        if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [safeStep, isOpen, isMinimized, currentStep])

  // Handle window resize AND scroll to update highlight position
  useEffect(() => {
      const handleUpdate = () => {
          if (isOpen && !isMinimized) {
              if (currentStep.target) {
                  const result = calculatePosition(currentStep.target)
                  if (result) {
                      setHighlightStyle(result.highlight)
                      // We update character pos too to keep it anchored to the element
                      setCharacterPos(result.charPos) 
                  }
              } else if (safeStep === 0 || currentStep.key === 'help') {
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
  }, [safeStep, isOpen, isMinimized, currentStep])

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
          
          const styleEl = document.getElementById('guide-scroll-lock')
          if (styleEl) styleEl.remove()
      }
    }
  }, [isOpen, isMinimized])

  const handleNext = () => {
    if (safeStep < steps.length - 1) {
      setStep(safeStep + 1)
    } else {
      setIsOpen(false)
      setHasSeenGuide(true)
      localStorage.setItem(`hasSeenInvestmentGuide_${activeTab}`, 'true')
    }
  }

  const handlePrev = () => {
    if (safeStep > 0) {
      setStep(safeStep - 1)
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

  const stepTitle = currentStep.key ? t(`investmentLab.guide.${currentStep.key}.title`) : currentStep.title
  const stepContent = currentStep.key ? t(`investmentLab.guide.${currentStep.key}.content`) : currentStep.content

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
        {isOpen && !isMinimized && (safeStep === 0 || currentStep.key === 'help') && (
             <div className="fixed top-1/2 left-1/2 w-0 h-0 z-40 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
        )}

        {(isMinimized || !isOpen) && (
            <div 
                className="fixed bottom-6 right-6 z-50 cursor-pointer group"
                onClick={handleRestart}
            >
                <div className="relative w-20 h-20 bg-gradient-to-b from-card to-muted/30 border-2 border-muted rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-primary">
                    <PixelCharacter className="w-12 h-12" state={minimizedState} />
                    
                    {/* Status indicator */}
                    {!hasSeenGuide && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                    )}
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
                        {stepTitle && <h4 className="font-bold mb-1">{stepTitle}</h4>}
                        <p className="text-sm leading-relaxed font-medium">
                            {stepContent}
                        </p>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <span className="text-xs text-muted-foreground flex items-center">
                                {safeStep + 1} / {steps.length}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {safeStep > 0 && (
                                <Button variant="ghost" size="sm" onClick={handlePrev} className="h-8 px-2 hover:bg-accent/50">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleNext} className="h-8 px-2 hover:bg-accent/50">
                                {safeStep === steps.length - 1 ? t('investmentLab.guide.close') : t('investmentLab.guide.next')}
                                {safeStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
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
                        state={isMoving ? 'walking' : (currentStep.key === 'help' ? 'victory' : (currentStep.target ? 'reading' : 'waving'))}
                        direction={direction}
                        isTalking={isTalking && !isMoving}
                    />
                </div>

            </div>
        )}
    </>
  )
}
