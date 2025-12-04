import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import { PixelCharacter } from './pixel-character'
import { cn } from '@/lib/utils'
import { 
    X, ArrowRight, Target, Shield, TrendingUp, Wallet, PiggyBank, LineChart, 
    Clock, Briefcase, GraduationCap, DollarSign, PieChart, CheckCircle2,
    User, Globe, Zap, Leaf, Building, Bitcoin, Settings, Bell, Filter
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

type WizardStep = 'intro' | 'age' | 'experience' | 'horizon' | 'goal' | 'risk' | 'amount' | 'sector' | 'result'

export function InvestmentWizard() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<WizardStep>('intro')
  const [answers, setAnswers] = useState({
      age: '',
      experience: '',
      horizon: '',
      goal: '',
      risk: '',
      amount: '',
      sector: ''
  })
  const [isTalking, setIsTalking] = useState(false)
  const [charState, setCharState] = useState<'idle' | 'happy' | 'thinking' | 'victory' | 'reading'>('idle')
  
  // Configuration state for result screen
  const [config, setConfig] = useState({
      screener: true,
      news: true,
      alerts: true,
      interface: true
  })

  // Auto-open logic
  useEffect(() => {
    const hasSeenWizard = localStorage.getItem('hasSeenInvestmentWizard_v3')
    if (!hasSeenWizard) {
        const timer = setTimeout(() => setIsOpen(true), 1000)
        return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('hasSeenInvestmentWizard_v3', 'true')
  }

  const nextStep = (current: WizardStep, next: WizardStep) => {
      setIsTalking(true)
      setCharState('thinking')
      
      setTimeout(() => {
          setIsTalking(false)
          setStep(next)
          setCharState('reading')
          if (next === 'result') setCharState('victory')
      }, 150)
  }

  const handleOption = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
    
    // Flow logic
    switch (step) {
        case 'intro': nextStep('intro', 'age'); break;
        case 'age': nextStep('age', 'experience'); break;
        case 'experience': nextStep('experience', 'horizon'); break;
        case 'horizon': nextStep('horizon', 'goal'); break;
        case 'goal': nextStep('goal', 'risk'); break;
        case 'risk': nextStep('risk', 'amount'); break;
        case 'amount': nextStep('amount', 'sector'); break;
        case 'sector': nextStep('sector', 'result'); break;
    }
  }

  // Talk when step changes
  useEffect(() => {
      if (isOpen) {
          setIsTalking(true)
          const timer = setTimeout(() => setIsTalking(false), 3000)
          return () => clearTimeout(timer)
      }
  }, [step, isOpen])

  if (!isOpen) return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 rounded-full w-14 h-14 p-0 shadow-2xl bg-gradient-to-r from-primary to-blue-600 hover:scale-110 transition-transform duration-300 border-4 border-background"
      >
        <span className="text-2xl">🧙‍♂️</span>
      </Button>
  )

  const getProgressValue = () => {
      const steps: WizardStep[] = ['intro', 'age', 'experience', 'horizon', 'goal', 'risk', 'amount', 'sector', 'result']
      const idx = steps.indexOf(step)
      return ((idx) / (steps.length - 1)) * 100
  }

  const renderOption = (icon: React.ReactNode, title: string, desc: string, onClick: () => void) => (
      <button 
        onClick={onClick}
        className="flex items-center p-4 border border-border/50 rounded-lg hover:bg-accent/50 hover:border-primary/50 transition-all text-left group bg-card/50"
      >
          <div className="p-2 rounded-md mr-4 text-muted-foreground group-hover:text-primary transition-colors">
              {icon}
          </div>
          <div>
              <h3 className="font-medium text-base mb-0.5 text-foreground group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
      </button>
  )

  const renderContent = () => {
      switch (step) {
          case 'intro':
              return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Asistente financiero</h2>
                        <p className="text-lg text-muted-foreground mt-2">
                            Diseñemos una estrategia de inversión adaptada a tu perfil, horizonte temporal y tolerancia al riesgo.
                        </p>
                      </div>
                      
                      <div className="grid gap-3">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground border border-border/50 p-3 rounded-lg bg-card/50">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <span>Análisis de perfil de riesgo</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground border border-border/50 p-3 rounded-lg bg-card/50">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <span>Recomendación de asignación de activos</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground border border-border/50 p-3 rounded-lg bg-card/50">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <span>Estrategia personalizada</span>
                          </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <Button size="lg" onClick={() => handleOption('intro', 'start')} className="w-full text-base h-12">
                              Comenzar análisis <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                      </div>
                  </div>
              )
          case 'age':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold">Edad y etapa vital</h2>
                      <p className="text-muted-foreground">Para ajustar el horizonte temporal y la exposición al riesgo.</p>
                      <div className="grid grid-cols-1 gap-3">
                          {renderOption(<User className="w-5 h-5" />, "Menos de 25 años", "Estudiante o primeros empleos. Máximo potencial de crecimiento.", () => handleOption('age', 'under25'))}
                          {renderOption(<User className="w-5 h-5" />, "25 - 40 años", "Construyendo patrimonio. Equilibrio entre crecimiento y estabilidad.", () => handleOption('age', '25-40'))}
                          {renderOption(<User className="w-5 h-5" />, "40 - 55 años", "Consolidación. Preparación para la jubilación.", () => handleOption('age', '40-55'))}
                          {renderOption(<User className="w-5 h-5" />, "Más de 55 años", "Preservación y rentas. Prioridad a la seguridad.", () => handleOption('age', 'over55'))}
                      </div>
                  </div>
              )
          case 'experience':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold">Nivel de experiencia</h2>
                      <p className="text-muted-foreground">Para adaptar el lenguaje y la complejidad de las recomendaciones.</p>
                      <div className="grid grid-cols-1 gap-3">
                          {renderOption(<GraduationCap className="w-6 h-6" />, "Principiante", "Estoy empezando, necesito conceptos claros y seguridad.", () => handleOption('experience', 'beginner'))}
                          {renderOption(<Briefcase className="w-6 h-6" />, "Intermedio", "Conozco los básicos, he invertido en fondos o acciones.", () => handleOption('experience', 'intermediate'))}
                          {renderOption(<LineChart className="w-6 h-6" />, "Avanzado", "Gestiono mi propia cartera, entiendo derivados y análisis técnico.", () => handleOption('experience', 'advanced'))}
                      </div>
                  </div>
              )
          case 'horizon':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold">Horizonte temporal</h2>
                      <p className="text-muted-foreground">¿Cuándo planeas necesitar el capital invertido?</p>
                      <div className="grid grid-cols-1 gap-3">
                          {renderOption(<Clock className="w-6 h-6" />, "Corto plazo (< 2 años)", "Ahorro para un objetivo próximo (coche, viaje, entrada casa).", () => handleOption('horizon', 'short'))}
                          {renderOption(<Clock className="w-6 h-6" />, "Medio plazo (2 - 5 años)", "Crecimiento sostenido sin bloquear el dinero décadas.", () => handleOption('horizon', 'medium'))}
                          {renderOption(<Clock className="w-6 h-6" />, "Largo plazo (> 10 años)", "Jubilación o libertad financiera. El interés compuesto es mi amigo.", () => handleOption('horizon', 'long'))}
                      </div>
                  </div>
              )
          case 'goal':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold">Objetivo principal</h2>
                      <p className="text-muted-foreground">¿Qué buscas conseguir con tu cartera?</p>
                      <div className="grid grid-cols-1 gap-3">
                          {renderOption(<PiggyBank className="w-6 h-6" />, "Preservación de capital", "Lo más importante es no perder dinero. Rentabilidad modesta pero segura.", () => handleOption('goal', 'safety'))}
                          {renderOption(<TrendingUp className="w-6 h-6" />, "Crecimiento equilibrado", "Busco batir a la inflación y crecer, asumiendo riesgos controlados.", () => handleOption('goal', 'balanced'))}
                          {renderOption(<Wallet className="w-6 h-6" />, "Ingresos pasivos", "Quiero generar rentas periódicas (dividendos, cupones).", () => handleOption('goal', 'income'))}
                          {renderOption(<Target className="w-6 h-6" />, "Crecimiento agresivo", "Maximizar retorno a largo plazo, tolerando alta volatilidad.", () => handleOption('goal', 'growth'))}
                      </div>
                  </div>
              )
          case 'risk':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold">Tolerancia al riesgo</h2>
                      <p className="text-muted-foreground">Si tu cartera cae un 20% en un mes debido a una crisis, ¿qué harías?</p>
                      <div className="grid grid-cols-1 gap-3">
                          {renderOption(<Shield className="w-6 h-6" />, "Vender todo", "No puedo dormir tranquilo con esas pérdidas. Prefiero liquidez.", () => handleOption('risk', 'low'))}
                          {renderOption(<Target className="w-6 h-6" />, "Esperar / No hacer nada", "Entiendo que el mercado fluctúa. Mantengo mi estrategia.", () => handleOption('risk', 'medium'))}
                          {renderOption(<LineChart className="w-6 h-6" />, "Comprar más", "¡Es tiempo de rebajas! Aprovecho para promediar a la baja.", () => handleOption('risk', 'high'))}
                      </div>
                  </div>
              )
          case 'amount':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold">Capacidad de aportación</h2>
                      <p className="text-muted-foreground">¿Cuánto estimas poder invertir mensualmente?</p>
                      <div className="grid grid-cols-1 gap-3">
                          {renderOption(<DollarSign className="w-5 h-5" />, "Menos de 200€", "Empezando poco a poco.", () => handleOption('amount', 'low'))}
                          {renderOption(<DollarSign className="w-5 h-5" />, "200€ - 1.000€", "Aportación regular sólida.", () => handleOption('amount', 'medium'))}
                          {renderOption(<DollarSign className="w-5 h-5" />, "Más de 1.000€", "Capacidad de ahorro alta.", () => handleOption('amount', 'high'))}
                      </div>
                  </div>
              )
          case 'sector':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-2xl font-bold">Interés sectorial</h2>
                      <p className="text-muted-foreground">¿Qué sectores te interesan más para personalizar tu feed?</p>
                      <div className="grid grid-cols-1 gap-3">
                          {renderOption(<Zap className="w-5 h-5" />, "Tecnología e Innovación", "IA, Robótica, Cloud Computing.", () => handleOption('sector', 'tech'))}
                          {renderOption(<Leaf className="w-5 h-5" />, "Sostenibilidad y Energía", "Renovables, Vehículo eléctrico, ESG.", () => handleOption('sector', 'green'))}
                          {renderOption(<Building className="w-5 h-5" />, "Real Estate y Tradicional", "Inmobiliario, Banca, Industria.", () => handleOption('sector', 'traditional'))}
                          {renderOption(<Bitcoin className="w-5 h-5" />, "Criptoactivos y Web3", "Blockchain, DeFi, Altcoins.", () => handleOption('sector', 'crypto'))}
                      </div>
                  </div>
              )
          case 'result':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto pr-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Estrategia generada</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column: Strategy Summary */}
                          <div className="space-y-4">
                              <div className="bg-card border border-border/50 rounded-lg p-5 shadow-sm">
                                  <h3 className="text-base font-medium mb-4 flex items-center gap-2 text-foreground">
                                      <PieChart className="w-4 h-4 text-primary" /> Asignación de activos
                                  </h3>
                                  <div className="space-y-3 text-sm">
                                      {answers.risk === 'high' ? (
                                          <>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Renta variable</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-[70%]"/></div> <span className="font-medium">70%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Cripto / Alt</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[15%]"/></div> <span className="font-medium">15%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Renta fija</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[10%]"/></div> <span className="font-medium">10%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Liquidez</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-slate-500 w-[5%]"/></div> <span className="font-medium">5%</span></div>
                                          </>
                                      ) : answers.risk === 'medium' ? (
                                          <>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Renta variable</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-[50%]"/></div> <span className="font-medium">50%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Renta fija</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[30%]"/></div> <span className="font-medium">30%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Inmobiliario</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[15%]"/></div> <span className="font-medium">15%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Liquidez</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-slate-500 w-[5%]"/></div> <span className="font-medium">5%</span></div>
                                          </>
                                      ) : (
                                          <>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Renta fija</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[60%]"/></div> <span className="font-medium">60%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Dividendos</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-[20%]"/></div> <span className="font-medium">20%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Materias primas</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[10%]"/></div> <span className="font-medium">10%</span></div>
                                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Liquidez</span> <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-slate-500 w-[10%]"/></div> <span className="font-medium">10%</span></div>
                                          </>
                                      )}
                                  </div>
                              </div>
                              
                              <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                      <Target className="w-4 h-4 text-muted-foreground" /> Perfil inversor
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                      Perfil <strong>{answers.risk === 'high' ? 'Agresivo' : answers.risk === 'medium' ? 'Moderado' : 'Conservador'}</strong> con horizonte a <strong>{answers.horizon === 'long' ? 'Largo plazo' : 'Corto/Medio plazo'}</strong>.
                                      Enfoque en <strong>{answers.sector === 'tech' ? 'Tecnología' : answers.sector === 'green' ? 'Sostenibilidad' : answers.sector === 'crypto' ? 'Criptoactivos' : 'Mercado General'}</strong>.
                                  </p>
                              </div>
                          </div>

                          {/* Right Column: Workspace Configuration */}
                          <div className="space-y-4">
                              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Configuración del espacio de trabajo</h3>
                              
                              <div className="space-y-3">
                                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/50">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-primary/10 rounded-md text-primary"><Filter className="w-4 h-4" /></div>
                                          <div>
                                              <p className="text-sm font-medium">Screener predefinido</p>
                                              <p className="text-xs text-muted-foreground">Filtros para {answers.goal === 'income' ? 'Dividendos' : 'Crecimiento'}</p>
                                          </div>
                                      </div>
                                      <Switch checked={config.screener} onCheckedChange={(c) => setConfig(prev => ({...prev, screener: c}))} />
                                  </div>

                                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/50">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-primary/10 rounded-md text-primary"><Globe className="w-4 h-4" /></div>
                                          <div>
                                              <p className="text-sm font-medium">Feed de noticias</p>
                                              <p className="text-xs text-muted-foreground">Personalizado: {answers.sector === 'tech' ? 'Tech' : answers.sector === 'crypto' ? 'Cripto' : 'Global'}</p>
                                          </div>
                                      </div>
                                      <Switch checked={config.news} onCheckedChange={(c) => setConfig(prev => ({...prev, news: c}))} />
                                  </div>

                                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/50">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-primary/10 rounded-md text-primary"><Bell className="w-4 h-4" /></div>
                                          <div>
                                              <p className="text-sm font-medium">Alertas inteligentes</p>
                                              <p className="text-xs text-muted-foreground">Avisos de volatilidad y oportunidades</p>
                                          </div>
                                      </div>
                                      <Switch checked={config.alerts} onCheckedChange={(c) => setConfig(prev => ({...prev, alerts: c}))} />
                                  </div>

                                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/50">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-primary/10 rounded-md text-primary"><Settings className="w-4 h-4" /></div>
                                          <div>
                                              <p className="text-sm font-medium">Interfaz Pro</p>
                                              <p className="text-xs text-muted-foreground">Diseño optimizado para análisis</p>
                                          </div>
                                      </div>
                                      <Switch checked={config.interface} onCheckedChange={(c) => setConfig(prev => ({...prev, interface: c}))} />
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="pt-4">
                          <Button size="lg" onClick={handleClose} className="w-full text-base h-12 shadow-lg shadow-primary/10">
                              Aplicar configuración y acceder
                          </Button>
                      </div>
                  </div>
              )
      }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="relative w-full max-w-5xl h-[600px] bg-background border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Close Button */}
            <button 
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Progress Bar (Top) */}
            {step !== 'intro' && step !== 'result' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-muted z-10">
                    <div 
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${getProgressValue()}%` }}
                    />
                </div>
            )}

            {/* Left Side: Character Area */}
            <div className="hidden md:flex w-[320px] bg-muted/10 flex-col items-center justify-center p-8 relative border-r border-border">
                <div className="relative z-10 transform scale-[2.5]">
                    <PixelCharacter 
                        state={charState} 
                        isTalking={isTalking}
                        className="opacity-90 grayscale-[0.2]"
                    />
                </div>
            </div>

            {/* Right Side: Content Area */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-background relative">
                {/* Step Indicator */}
                {step !== 'intro' && step !== 'result' && step !== 'processing' && (
                    <div className="absolute top-8 left-8 md:left-16 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Paso {['intro', 'experience', 'horizon', 'goal', 'risk', 'amount', 'processing', 'result'].indexOf(step)} de 6
                    </div>
                )}
                
                <div className="max-w-2xl w-full mx-auto">
                    {renderContent()}
                </div>
            </div>

        </div>
    </div>
  )
}
