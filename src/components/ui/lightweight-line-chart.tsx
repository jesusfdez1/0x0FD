import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ColorType,
  LineStyle,
  type LineData,
  createChart,
  LineSeries,
} from 'lightweight-charts'
import { useTheme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'

export interface LightweightLineChartProps {
  data: LineData[]
  className?: string
  heightClassName?: string
  valueFormatter?: (value: number) => string
  timeFormatter?: (time: unknown) => string
  dashed?: boolean
  framed?: boolean
  label?: string
  showLegend?: boolean
}

export function LightweightLineChart({
  data,
  className,
  heightClassName = 'h-44',
  valueFormatter,
  timeFormatter,
  dashed = false,
  framed = true,
  label,
  showLegend = false,
}: LightweightLineChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<any>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const { resolvedTheme } = useTheme()

  const [hover, setHover] = useState<{ timeLabel: string; valueLabel: string } | null>(null)

  const palette = useMemo(() => {
    const isDark = resolvedTheme === 'dark'
    return {
      text: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.72)',
      grid: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.25)',
      background: 'transparent',
      line: 'rgba(59,130,246,1)',
    }
  }, [resolvedTheme])

  const formatValue = (v: number) => (valueFormatter ? valueFormatter(v) : String(v))
  const formatTime = (t: unknown) => {
    if (timeFormatter) return timeFormatter(t)
    if (typeof t === 'string') return t
    return String(t ?? '')
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (!data || data.length === 0) {
      setHover(null)
      return
    }

    let chart: ReturnType<typeof createChart> | null = null

    const init = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) {
        requestAnimationFrame(init)
        return
      }

      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch {
          // ignore
        }
        chartRef.current = null
        seriesRef.current = null
      }

      chart = createChart(container, {
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
          scaleMargins: { top: 0.12, bottom: 0.12 },
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

      chartRef.current = chart

      const line = chart.addSeries(LineSeries, {
        color: palette.line,
        lineWidth: 2,
        lineStyle: dashed ? LineStyle.Dotted : LineStyle.Solid,
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => formatValue(price),
        },
      })

      seriesRef.current = line
      line.setData(data)

      chart.subscribeCrosshairMove((param) => {
        if (!param?.time) {
          setHover(null)
          return
        }

        const seriesData = (param.seriesData as any)?.get?.(line)
        const v = seriesData?.value
        if (typeof v !== 'number') {
          setHover(null)
          return
        }

        setHover({
          timeLabel: formatTime(param.time),
          valueLabel: formatValue(v),
        })
      })

      observerRef.current?.disconnect()
      observerRef.current = new ResizeObserver(() => {
        const c = containerRef.current
        const ch = chartRef.current
        if (!c || !ch) return
        ch.applyOptions({ width: c.clientWidth, height: c.clientHeight })
      })
      observerRef.current.observe(container)
    }

    const timeoutId = setTimeout(init, 0)

    return () => {
      clearTimeout(timeoutId)
      observerRef.current?.disconnect()
      observerRef.current = null
      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch {
          // ignore
        }
      }
      chartRef.current = null
      seriesRef.current = null
      setHover(null)
    }
  }, [data, palette, dashed, valueFormatter, timeFormatter])

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        framed && 'rounded-lg border bg-card/40',
        className
      )}
    >
      <div className={cn('w-full', heightClassName)} ref={containerRef} />
      {showLegend && label && (
        <div className='absolute bottom-1 left-2 flex items-center gap-2 rounded-md bg-background/60 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur'>
          <span className='h-2 w-2 rounded-full' style={{ backgroundColor: palette.line }} />
          <span className='text-foreground'>{label}</span>
        </div>
      )}
      {hover && (
        <div
          className={cn(
            'pointer-events-none absolute left-2 top-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground backdrop-blur',
            framed ? 'bg-background/70' : 'bg-background/60'
          )}
        >
          <div className='truncate'>
            {hover.timeLabel}: <span className='text-foreground'>{hover.valueLabel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
