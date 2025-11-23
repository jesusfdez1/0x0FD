/**
 * Componente de configuración de display y personalización de tema
 * Permite personalizar el tema, colores y configuración visual de la aplicación
 */

import { type SVGProps, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Moon, Sun, Laptop, RotateCcw } from 'lucide-react'
import { IconDir } from '@/assets/custom/icon-dir'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDirection } from '@/context/direction-provider'
import { type Collapsible, useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'

export function DisplayForm() {
  const { theme, setTheme, resetTheme } = useTheme()
  const { t } = useLanguage()
  const { setOpen } = useSidebar()
  const { resetDir } = useDirection()
  const { resetLayout } = useLayout()
  
  // Estado para el color primario personalizado
  const [primaryColor, setPrimaryColor] = useState({ hue: 240, saturation: 100, lightness: 50 })
  
  /**
   * Presets de colores predefinidos para personalización rápida
   */
  const colorPresets = [
    { name: t('settings.blue') || "Azul", hue: 240, saturation: 100, lightness: 50 },
    { name: t('settings.sky') || "Cielo", hue: 199, saturation: 100, lightness: 70 },
    { name: t('settings.purple') || "Púrpura", hue: 253, saturation: 91, lightness: 58 },
    { name: t('settings.green') || "Verde", hue: 141, saturation: 60, lightness: 50 },
    { name: t('settings.lime') || "Lima", hue: 90, saturation: 90, lightness: 40 },
    { name: t('settings.red') || "Rojo", hue: 0, saturation: 100, lightness: 60 },
    { name: t('settings.orange') || "Naranja", hue: 16, saturation: 100, lightness: 65 },
    { name: t('settings.amber') || "Ámbar", hue: 39, saturation: 100, lightness: 50 },
    { name: t('settings.gold') || "Oro", hue: 45, saturation: 90, lightness: 55 },
    { name: t('settings.gray') || "Gris", hue: 210, saturation: 2, lightness: 58 },
  ]

  /**
   * Valor CSS del color primario seleccionado
   */
  const selectedColorCSS = useMemo(() => {
    return `hsl(${primaryColor.hue}, ${primaryColor.saturation}%, ${primaryColor.lightness}%)`
  }, [primaryColor])

  /**
   * Inicializa el color primario desde CSS
   */
  useEffect(() => {
    // Cargar color primario actual desde CSS o localStorage
    try {
      const savedColor = localStorage.getItem('theme-primary-color')
      if (savedColor) {
        const color = JSON.parse(savedColor)
        setPrimaryColor(color)
        applyThemeColor(color)
      } else {
        const root = document.documentElement
        const cssVarValue = getComputedStyle(root).getPropertyValue('--primary').trim()
        const hslMatch = cssVarValue.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
        if (hslMatch) {
          setPrimaryColor({
            hue: parseInt(hslMatch[1], 10),
            saturation: parseInt(hslMatch[2], 10),
            lightness: parseInt(hslMatch[3], 10)
          })
        }
      }
    } catch (error) {
      console.error('Error al cargar el color del tema:', error)
    }
  }, [])

  /**
   * Aplica el color del tema a las variables CSS
   */
  const applyThemeColor = (color: { hue: number, saturation: number, lightness: number }) => {
    const { hue, saturation, lightness } = color
    const hslValue = `${hue} ${saturation}% ${lightness}%`

    document.documentElement.style.setProperty('--primary', hslValue)
    document.documentElement.style.setProperty('--ring', hslValue)
    document.documentElement.style.setProperty('--primary-foreground', `${hue} ${saturation}% 98%`)

    localStorage.setItem('theme-primary-color', JSON.stringify(color))

    // Actualizar también los valores para los gráficos si los hay
    document.documentElement.style.setProperty('--chart-1', hslValue)
    document.documentElement.style.setProperty('--chart-2', `${(hue + 30) % 360} ${saturation}% ${lightness}%`)
    document.documentElement.style.setProperty('--chart-3', `${(hue + 60) % 360} ${saturation}% ${lightness}%`)
    document.documentElement.style.setProperty('--chart-4', `${(hue + 90) % 360} ${saturation}% ${lightness}%`)
    document.documentElement.style.setProperty('--chart-5', `${(hue + 120) % 360} ${saturation}% ${lightness}%`)

    window.dispatchEvent(new CustomEvent('theme-color-changed', { detail: color }))
  }

  /**
   * Maneja el cambio de preset de color
   */
  const handleColorPresetChange = (preset: typeof colorPresets[0]) => {
    setPrimaryColor(preset)
    applyThemeColor(preset)
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.themePreference') || 'Preferencia de tema'}</CardTitle>
          <CardDescription>{t('settings.themePreferenceDescription') || 'Selecciona el modo de visualización de la aplicación'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            {[
              { value: 'light', label: t('settings.light'), icon: Sun, image: '/images/ui-light.png' },
              { value: 'dark', label: t('settings.dark'), icon: Moon, image: '/images/ui-dark.png' },
              { value: 'system', label: t('settings.system'), icon: Laptop, image: '/images/ui-system.png' },
            ].map((option) => (
              <div key={option.value} className='flex flex-col items-center gap-2'>
                <button
                  onClick={() => {
                    setTheme(option.value as 'light' | 'dark' | 'system')
                    localStorage.setItem('user-theme-preference', option.value)
                  }}
                  className={cn(
                    'w-full p-1 rounded-xl border-2 transition-all',
                    theme === option.value
                      ? 'border-primary bg-accent/50'
                      : 'border-border hover:border-primary/50 hover:bg-accent/20'
                  )}
                  aria-label={`${t('settings.selectTheme')} ${option.label}`}
                >
                  <div className='aspect-video w-full overflow-hidden rounded-lg bg-background'>
                    <img
                      src={option.image}
                      alt={`${t('settings.preview')} ${option.label}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </button>
                <div className='flex items-center gap-2'>
                  <option.icon className='h-4 w-4' />
                  <span className='text-sm font-medium'>{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.themeCustomization') || 'Personalización del tema'}</CardTitle>
          <CardDescription>{t('settings.themeCustomizationDescription') || 'Ajusta el color principal de la interfaz'}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            <h3 className='text-sm font-medium mb-3'>{t('settings.customColor') || 'Color personalizado'}</h3>
            <div className='space-y-6'>
              <ColorSelector
                hue={primaryColor.hue}
                saturation={primaryColor.saturation}
                lightness={primaryColor.lightness}
                onChange={(newColor) => {
                  setPrimaryColor(newColor)
                  applyThemeColor(newColor)
                }}
              />

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <Label htmlFor='hue'>{t('settings.hue') || 'Tono'} ({primaryColor.hue}°)</Label>
                </div>

                <HueSlider
                  hue={primaryColor.hue}
                  onChange={(newHue) => {
                    const newColor = { ...primaryColor, hue: newHue }
                    setPrimaryColor(newColor)
                    applyThemeColor(newColor)
                  }}
                />
              </div>

              <div className='grid grid-cols-4 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='hue-input' className='text-xs'>{t('settings.hueShort') || 'Tono'} (H)</Label>
                  <div className='flex items-center'>
                    <Input
                      id='hue-input'
                      type='number'
                      min='0'
                      max='360'
                      value={primaryColor.hue}
                      onChange={(e) => {
                        const hue = Math.max(0, Math.min(360, parseInt(e.target.value) || 0))
                        const newColor = { ...primaryColor, hue }
                        setPrimaryColor(newColor)
                        applyThemeColor(newColor)
                      }}
                      className='text-sm'
                    />
                    <span className='ml-1 text-sm text-muted-foreground'>°</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='saturation-input' className='text-xs'>{t('settings.saturation') || 'Saturación'} (S)</Label>
                  <div className='flex items-center'>
                    <Input
                      id='saturation-input'
                      type='number'
                      min='0'
                      max='100'
                      value={primaryColor.saturation}
                      onChange={(e) => {
                        const saturation = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                        const newColor = { ...primaryColor, saturation }
                        setPrimaryColor(newColor)
                        applyThemeColor(newColor)
                      }}
                      className='text-sm'
                    />
                    <span className='ml-1 text-sm text-muted-foreground'>%</span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lightness-input' className='text-xs'>{t('settings.lightness') || 'Luminosidad'} (L)</Label>
                  <div className='flex items-center'>
                    <Input
                      id='lightness-input'
                      type='number'
                      min='0'
                      max='100'
                      value={primaryColor.lightness}
                      onChange={(e) => {
                        const lightness = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                        const newColor = { ...primaryColor, lightness }
                        setPrimaryColor(newColor)
                        applyThemeColor(newColor)
                      }}
                      className='text-sm'
                    />
                    <span className='ml-1 text-sm text-muted-foreground'>%</span>
                  </div>
                </div>
                
                <div className='flex flex-col justify-center items-center'>
                  <Label htmlFor='color-preview' className='text-xs mb-3'>{t('settings.preview') || 'Vista previa'}</Label>
                  <div 
                    className='w-12 h-12 rounded-lg border border-border shadow-sm' 
                    style={{ backgroundColor: selectedColorCSS }}
                    aria-label={t('settings.colorPreview') || 'Vista previa del color seleccionado'}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className='text-sm font-medium mb-3'>{t('settings.predefinedColors') || 'Colores predefinidos'}</h3>
            <div className='grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-3'>
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  className={cn(
                    'flex flex-col items-center space-y-1 p-2 rounded-lg transition-all',
                    primaryColor.hue === preset.hue &&
                    primaryColor.saturation === preset.saturation &&
                    primaryColor.lightness === preset.lightness
                      ? 'ring-2 ring-primary bg-accent'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => handleColorPresetChange(preset)}
                  aria-label={`${t('settings.selectColor')} ${preset.name}`}
                >
                  <div
                    className='w-10 h-10 rounded-full border-2 border-border shadow-sm'
                    style={{ backgroundColor: `hsl(${preset.hue}, ${preset.saturation}%, ${preset.lightness}%)` }}
                  />
                  <span className='text-xs truncate w-full text-center'>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <SidebarConfig />
      <LayoutConfig />
      <DirConfig />
      
      <div className='flex gap-4 pt-4'>
        <Button
          type='button'
          variant='destructive'
          onClick={() => {
            setOpen(true)
            resetDir()
            resetTheme()
            resetLayout()
            // Resetear color a default
            const defaultColor = { hue: 240, saturation: 100, lightness: 50 }
            setPrimaryColor(defaultColor)
            applyThemeColor(defaultColor)
          }}
          aria-label={t('settings.resetAllSettings') || 'Restablecer todas las configuraciones'}
        >
          <RotateCcw className='mr-2 h-4 w-4' />
          {t('settings.resetAll') || 'Restablecer todo'}
        </Button>
      </div>
    </div>
  )
}

/**
 * Componente de configuración de Sidebar
 */
function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  const { t } = useLanguage()
  return (
    <Card className='max-md:hidden'>
      <CardHeader>
        <CardTitle>{t('settings.sidebar') || 'Barra lateral'}</CardTitle>
        <CardDescription>{t('settings.sidebarDescription') || 'Elige entre estilo integrado, flotante o barra lateral estándar.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-sm text-muted-foreground'>
            {t('settings.sidebar') || 'Barra lateral'}
          </span>
          {defaultVariant !== variant && (
            <Button
              type='button'
              size='icon'
              variant='secondary'
              className='size-5 rounded-full'
              onClick={() => setVariant(defaultVariant)}
            >
              <RotateCcw className='size-3' />
            </Button>
          )}
        </div>
        <Radio
          value={variant}
          onValueChange={setVariant}
          className='grid w-full max-w-md grid-cols-3 gap-4'
          aria-label='Select sidebar style'
        >
          {[
            {
              value: 'inset',
              label: t('settings.inset') || 'Integrado',
              icon: IconSidebarInset,
            },
            {
              value: 'floating',
              label: t('settings.floating') || 'Flotante',
              icon: IconSidebarFloating,
            },
            {
              value: 'sidebar',
              label: t('settings.sidebarStyle') || 'Barra lateral',
              icon: IconSidebarSidebar,
            },
          ].map((item) => (
            <RadioGroupItem key={item.value} item={item} />
          ))}
        </Radio>
      </CardContent>
    </Card>
  )
}

/**
 * Componente de configuración de Layout
 */
function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()
  const { t } = useLanguage()

  const radioState = open ? 'default' : collapsible

  return (
    <Card className='max-md:hidden'>
      <CardHeader>
        <CardTitle>{t('settings.layout') || 'Diseño'}</CardTitle>
        <CardDescription>{t('settings.layoutDescription') || 'Elige entre modo expandido por defecto, compacto solo iconos o diseño completo.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-sm text-muted-foreground'>
            {t('settings.layout') || 'Diseño'}
          </span>
          {radioState !== 'default' && (
            <Button
              type='button'
              size='icon'
              variant='secondary'
              className='size-5 rounded-full'
              onClick={() => {
                setOpen(true)
                setCollapsible(defaultCollapsible)
              }}
            >
              <RotateCcw className='size-3' />
            </Button>
          )}
        </div>
        <Radio
          value={radioState}
          onValueChange={(v) => {
            if (v === 'default') {
              setOpen(true)
              return
            }
            setOpen(false)
            setCollapsible(v as Collapsible)
          }}
          className='grid w-full max-w-md grid-cols-3 gap-4'
          aria-label='Select layout style'
        >
          {[
            {
              value: 'default',
              label: t('settings.default') || 'Por defecto',
              icon: IconLayoutDefault,
            },
            {
              value: 'icon',
              label: t('settings.compact') || 'Compacto',
              icon: IconLayoutCompact,
            },
            {
              value: 'offcanvas',
              label: t('settings.fullLayout') || 'Diseño completo',
              icon: IconLayoutFull,
            },
          ].map((item) => (
            <RadioGroupItem key={item.value} item={item} />
          ))}
        </Radio>
      </CardContent>
    </Card>
  )
}

/**
 * Componente de configuración de Direction
 */
function DirConfig() {
  const { defaultDir, dir, setDir } = useDirection()
  const { t } = useLanguage()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.direction') || 'Dirección'}</CardTitle>
        <CardDescription>{t('settings.directionDescription') || 'Elige entre dirección de sitio de izquierda a derecha o de derecha a izquierda.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-sm text-muted-foreground'>
            {t('settings.direction') || 'Dirección'}
          </span>
          {defaultDir !== dir && (
            <Button
              type='button'
              size='icon'
              variant='secondary'
              className='size-5 rounded-full'
              onClick={() => setDir(defaultDir)}
            >
              <RotateCcw className='size-3' />
            </Button>
          )}
        </div>
        <Radio
          value={dir}
          onValueChange={setDir}
          className='grid w-full max-w-md grid-cols-2 gap-4'
          aria-label='Select site direction'
        >
          {[
            {
              value: 'ltr',
              label: t('settings.ltr') || 'Izquierda a derecha',
              icon: (props: SVGProps<SVGSVGElement>) => (
                <IconDir dir='ltr' {...props} />
              ),
            },
            {
              value: 'rtl',
              label: t('settings.rtl') || 'Derecha a izquierda',
              icon: (props: SVGProps<SVGSVGElement>) => (
                <IconDir dir='rtl' {...props} />
              ),
            },
          ].map((item) => (
            <RadioGroupItem key={item.value} item={item} />
          ))}
        </Radio>
      </CardContent>
    </Card>
  )
}

/**
 * Componente RadioGroupItem para los selectores
 */
function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
    >
      <div
        className={cn(
          'ring-border relative rounded-[6px] ring-[1px]',
          'group-data-[state=checked]:ring-primary group-data-[state=checked]:shadow-2xl',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'fill-primary size-6 stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-xs text-center'
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

/**
 * Componente ColorSelector personalizado
 * Selector de color interactivo con canvas
 */
const ColorSelector: React.FC<{
  hue: number
  saturation: number
  lightness: number
  onChange: (newColor: { hue: number; saturation: number; lightness: number }) => void
}> = ({ hue, saturation, lightness, onChange }) => {
  const fieldRef = useRef<HTMLCanvasElement>(null)
  const isDraggingRef = useRef(false)
  
  const drawColorField = useCallback(() => {
    const canvas = fieldRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Gradiente horizontal de saturación
    const gradientX = ctx.createLinearGradient(0, 0, width, 0)
    gradientX.addColorStop(0, `hsl(${hue}, 0%, 50%)`)
    gradientX.addColorStop(1, `hsl(${hue}, 100%, 50%)`)
    ctx.fillStyle = gradientX
    ctx.fillRect(0, 0, width, height)
    
    // Gradiente vertical de luminosidad
    const gradientY = ctx.createLinearGradient(0, 0, 0, height)
    gradientY.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradientY.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradientY.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
    gradientY.addColorStop(1, 'rgba(0, 0, 0, 1)')
    ctx.fillStyle = gradientY
    ctx.fillRect(0, 0, width, height)
    
    // Dibujar el indicador de posición
    const x = (saturation / 100) * width
    const y = (1 - lightness / 100) * height
    
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.stroke()
    
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [hue, saturation, lightness])
  
  useEffect(() => {
    const canvas = fieldRef.current
    if (!canvas) return
    
    const parent = canvas.parentElement
    if (!parent) return
    
    const { width, height } = parent.getBoundingClientRect()
    canvas.width = width
    canvas.height = height
    
    drawColorField()
  }, [drawColorField])
  
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    isDraggingRef.current = true
    
    const canvas = fieldRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    
    const newSaturation = Math.round(x * 100)
    const newLightness = Math.round((1 - y) * 100)
    
    onChange({
      hue,
      saturation: newSaturation,
      lightness: newLightness
    })
  }, [hue, onChange])
  
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return
    
    const canvas = fieldRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    
    const newSaturation = Math.round(x * 100)
    const newLightness = Math.round((1 - y) * 100)
    
    onChange({
      hue,
      saturation: newSaturation,
      lightness: newLightness
    })
  }, [hue, onChange])
  
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])
  
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseUp])
  
  return (
    <div className='w-full h-48 rounded-lg overflow-hidden border border-border shadow-inner'>
      <canvas
        ref={fieldRef}
        className='w-full h-full cursor-crosshair'
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}

/**
 * Componente HueSlider personalizado
 * Slider para seleccionar el tono del color
 */
const HueSlider: React.FC<{
  hue: number
  onChange: (newHue: number) => void
}> = ({ hue, onChange }) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  
  const updateHue = useCallback((clientX: number) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      onChange(Math.round(x * 360))
    }
  }, [onChange])
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      updateHue(e.clientX)
    }
  }, [updateHue])
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    isDraggingRef.current = true
    updateHue(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        updateHue(e.clientX)
      }
    }
    
    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [updateHue])
  
  useEffect(() => {
    const handleWindowMouseUp = () => {
      isDraggingRef.current = false
    }
    
    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [])
  
  return (
    <div 
      ref={sliderRef}
      className='relative h-8 rounded-md overflow-hidden border border-border cursor-pointer'
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <div
        className='absolute inset-0'
        style={{
          background: `linear-gradient(to right, 
            hsl(0, 100%, 50%), 
            hsl(60, 100%, 50%), 
            hsl(120, 100%, 50%), 
            hsl(180, 100%, 50%), 
            hsl(240, 100%, 50%), 
            hsl(300, 100%, 50%), 
            hsl(360, 100%, 50%))`
        }}
      />
      
      <div
        className='absolute top-0 bottom-0 w-1 bg-white border border-gray-400 rounded-sm shadow-md -ml-[2px] cursor-grab active:cursor-grabbing'
        style={{ left: `${(hue / 360) * 100}%` }}
        onMouseDown={(e) => {
          e.stopPropagation()
          handleMouseDown(e)
        }}
      />
    </div>
  )
}
