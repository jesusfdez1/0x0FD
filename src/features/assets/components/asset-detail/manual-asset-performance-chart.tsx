import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ColorType,
  LineStyle,
  type LineData,
  createChart,
  AreaSeries,
  LineSeries,
} from 'lightweight-charts'
import { useTheme } from '@/context/theme-provider'

interface ManualAssetPerformanceChartProps {
  series: LineData[] // Serie de lo invertido/valor actual
  benchmark: LineData[] // Serie de inflación
  currency: string
  onColorsReady?: (colors: { assetColor: string; inflationColor: string }) => void
}

export function ManualAssetPerformanceChart({
  series,
  benchmark,
  currency,
  onColorsReady,
}: ManualAssetPerformanceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartInstanceRef = useRef<any>(null)
  const { resolvedTheme } = useTheme()
  const [hasError, setHasError] = useState(false)

  const palette = useMemo(() => {
    const isDark = resolvedTheme === 'dark'
    return {
      text: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.72)',
      grid: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.25)',
      background: 'transparent',
      asset: {
        top: 'rgba(59,130,246,0.35)',
        bottom: 'rgba(59,130,246,0.05)',
        line: 'rgba(59,130,246,1)',
      },
      benchmark: isDark ? 'rgba(148,163,184,0.8)' : 'rgba(15,23,42,0.45)',
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    // Validar datos antes de continuar
    if (!series || !Array.isArray(series) || series.length === 0) {
      console.warn('Series vacías o inválidas', series)
      setHasError(true)
      return
    }
    
    if (!benchmark || !Array.isArray(benchmark) || benchmark.length === 0) {
      console.warn('Benchmark vacío o inválido', benchmark)
      setHasError(true)
      return
    }

    // Validar formato de datos
    const validSeries = series.filter((item: any) => item && item.time && typeof item.value === 'number' && !isNaN(item.value))
    const validBenchmark = benchmark.filter((item: any) => item && item.time && typeof item.value === 'number' && !isNaN(item.value))

    if (validSeries.length === 0 || validBenchmark.length === 0) {
      console.warn('Datos sin formato válido', { validSeries, validBenchmark })
      setHasError(true)
      return
    }

    let chartInstance: ReturnType<typeof createChart> | null = null
    let observerInstance: ResizeObserver | null = null

    const initChart = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      if (width === 0 || height === 0) {
        requestAnimationFrame(initChart)
        return
      }

      try {
        // Limpiar gráfico anterior
        if (chartInstanceRef.current) {
          try {
            chartInstanceRef.current.remove()
          } catch (e) {
            // Ignorar
          }
        }

        const chart = createChart(container, {
          width,
          height,
          layout: {
            background: { type: ColorType.Solid, color: palette.background },
            textColor: palette.text,
          },
          grid: {
            vertLines: { color: palette.grid, visible: true },
            horzLines: { color: palette.grid, visible: true },
          },
          rightPriceScale: {
            borderVisible: false,
            scaleMargins: { top: 0.1, bottom: 0.1 },
          },
          timeScale: {
            borderVisible: false,
            timeVisible: true,
            fixRightEdge: true,
          },
          crosshair: { 
            mode: 1,
          },
        })

        // Verificar que el chart tenga el método addSeries (API v5)
        if (!chart || typeof chart.addSeries !== 'function') {
          console.error('El objeto chart no tiene el método addSeries', chart)
          setHasError(true)
          return
        }

        chartInstance = chart
        chartInstanceRef.current = chart

        // Serie de lo invertido/valor actual (API v5)
        const investedLine = chart.addSeries(AreaSeries, {
          topColor: palette.asset.top,
          bottomColor: palette.asset.bottom,
          lineColor: palette.asset.line,
          lineWidth: 2,
          priceFormat: {
            type: 'custom',
            formatter: (price: number) =>
              new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(price),
          },
        })
        investedLine.setData(validSeries as LineData[])

        // Serie de inflación (API v5)
        const inflationLine = chart.addSeries(LineSeries, {
          color: palette.benchmark,
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
        })
        inflationLine.setData(validBenchmark as LineData[])

        observerInstance = new ResizeObserver(() => {
          if (container && chartInstance) {
            chartInstance.applyOptions({ 
              width: container.clientWidth,
              height: container.clientHeight,
            })
          }
        })
        observerInstance.observe(container)
        
        setHasError(false)
      } catch (error) {
        console.error('Error al inicializar el gráfico:', error)
        setHasError(true)
      }
    }

    const timeoutId = setTimeout(initChart, 150)

    return () => {
      clearTimeout(timeoutId)
      if (observerInstance) {
        observerInstance.disconnect()
      }
      if (chartInstance) {
        try {
          chartInstance.remove()
        } catch (error) {
          // Ignorar
        }
      }
      chartInstanceRef.current = null
    }
  }, [palette, series, benchmark, currency, onColorsReady])

  // Notificar los colores cuando cambien
  useEffect(() => {
    if (onColorsReady && !hasError) {
      onColorsReady({
        assetColor: palette.asset.line,
        inflationColor: palette.benchmark,
      })
    }
  }, [palette, onColorsReady, hasError])

  // Debug: verificar datos
  useEffect(() => {
    if (series && benchmark) {
      console.log('Datos del gráfico:', {
        seriesLength: series.length,
        benchmarkLength: benchmark.length,
        firstSeries: series[0],
        firstBenchmark: benchmark[0],
      })
    }
  }, [series, benchmark])

  return (
    <div className='h-[220px] w-full rounded-lg border bg-card/40 relative overflow-hidden'>
      {hasError && (
        <div className='absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded-lg'>
          <div className='text-center'>
            <p className='text-sm font-medium text-muted-foreground mb-1'>No se pudo cargar el gráfico</p>
            <p className='text-xs text-muted-foreground/70'>Verifica la consola para más detalles</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className='h-full w-full' />
    </div>
  )
}


