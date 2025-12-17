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

export type LightweightMultiLineChartSeries = {
  id: string
  label: string
  data: LineData[]
  valueFormatter?: (value: number) => string
  dashed?: boolean
  color?: string
  priceScaleId?: string
}

export interface LightweightMultiLineChartProps {
  series: LightweightMultiLineChartSeries[]
  className?: string
  heightClassName?: string
  timeFormatter?: (time: unknown) => string
  framed?: boolean
  showLegend?: boolean
}

export function LightweightMultiLineChart({
  series,
  className,
  heightClassName = 'h-44',
  timeFormatter,
  framed = true,
  showLegend = true,
}: LightweightMultiLineChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRefs = useRef<{ id: string; label: string; color: string; formatter?: (v: number) => string; ref: any }[]>([])
  const observerRef = useRef<ResizeObserver | null>(null)

  const { resolvedTheme } = useTheme()
  const [hover, setHover] = useState<{ timeLabel: string; rows: { id: string; label: string; color: string; valueLabel: string }[] } | null>(null)

  const palette = useMemo(() => {
    const isDark = resolvedTheme === 'dark'
    return {
      text: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.72)',
      grid: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.25)',
      background: 'transparent',
    }
  }, [resolvedTheme])

  const formatTime = (t: unknown) => {
    if (timeFormatter) return timeFormatter(t)
    if (typeof t === 'string') return t
    return String(t ?? '')
  }

  const getDefaultColors = () => {
    if (typeof window === 'undefined') {
      return ['rgba(59,130,246,1)', 'rgba(16,185,129,1)', 'rgba(234,179,8,1)', 'rgba(168,85,247,1)', 'rgba(244,63,94,1)']
    }

    const style = getComputedStyle(document.documentElement)
    const vars = ['--color-chart-1', '--color-chart-2', '--color-chart-3', '--color-chart-4', '--color-chart-5']
    const values = vars
      .map((v) => style.getPropertyValue(v).trim())
      .filter(Boolean)

    return values.length > 0
      ? values
      : ['rgba(59,130,246,1)', 'rgba(16,185,129,1)', 'rgba(234,179,8,1)', 'rgba(168,85,247,1)', 'rgba(244,63,94,1)']
  }

  const legendItems = useMemo(() => {
    const fallback = ['rgba(59,130,246,1)', 'rgba(16,185,129,1)', 'rgba(234,179,8,1)', 'rgba(168,85,247,1)', 'rgba(244,63,94,1)']
    let colors = fallback

    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement)
      const vars = ['--color-chart-1', '--color-chart-2', '--color-chart-3', '--color-chart-4', '--color-chart-5']
      const values = vars.map((v) => style.getPropertyValue(v).trim()).filter(Boolean)
      if (values.length > 0) colors = values
    }

    return (series ?? []).map((s, idx) => ({
      id: s.id,
      label: s.label,
      color: s.color ?? colors[idx % colors.length],
    }))
  }, [series, resolvedTheme])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (!series || series.length === 0 || series.every((s) => !s.data || s.data.length === 0)) {
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
        seriesRefs.current = []
      }

      const needsLeftScale = series.some((s) => (s.priceScaleId ?? 'right') === 'left')

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
        leftPriceScale: {
          visible: needsLeftScale,
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

      const colors = getDefaultColors()

      seriesRefs.current = series.map((s, idx) => {
        const color = s.color ?? colors[idx % colors.length]

        const line = chart!.addSeries(LineSeries, {
          color,
          lineWidth: 2,
          lineStyle: s.dashed ? LineStyle.Dotted : LineStyle.Solid,
          priceScaleId: s.priceScaleId,
          priceFormat: {
            type: 'custom',
            formatter: (price: number) => (s.valueFormatter ? s.valueFormatter(price) : String(price)),
          },
        })

        line.setData(s.data)

        return {
          id: s.id,
          label: s.label,
          color,
          formatter: s.valueFormatter,
          ref: line,
        }
      })

      chart.subscribeCrosshairMove((param) => {
        if (!param?.time) {
          setHover(null)
          return
        }

        const timeLabel = formatTime(param.time)
        const rows = seriesRefs.current
          .map((s) => {
            const seriesData = (param.seriesData as any)?.get?.(s.ref)
            const v = seriesData?.value
            if (typeof v !== 'number') return null

            return {
              id: s.id,
              label: s.label,
              color: s.color,
              valueLabel: s.formatter ? s.formatter(v) : String(v),
            }
          })
          .filter(Boolean) as { id: string; label: string; color: string; valueLabel: string }[]

        if (rows.length === 0) {
          setHover(null)
          return
        }

        setHover({ timeLabel, rows })
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
      seriesRefs.current = []
      setHover(null)
    }
  }, [series, palette, timeFormatter])

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        framed && 'rounded-lg border bg-card/40',
        className
      )}
    >
      <div className={cn('w-full', heightClassName)} ref={containerRef} />

      {showLegend && legendItems.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground'>
          {legendItems.map((item) => (
            <div key={item.id} className='flex items-center gap-2'>
              <span className='h-2 w-2 rounded-full' style={{ backgroundColor: item.color }} />
              <span className='text-foreground'>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {hover && (
        <div
          className={cn(
            'pointer-events-none absolute left-2 top-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground backdrop-blur',
            framed ? 'bg-background/70' : 'bg-background/60'
          )}
        >
          <div className='truncate'>{hover.timeLabel}</div>
          <div className='mt-1 space-y-0.5'>
            {hover.rows.map((row) => (
              <div key={row.id} className='flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full' style={{ backgroundColor: row.color }} />
                <span className='text-foreground'>{row.label}</span>
                <span className='ml-auto text-foreground'>{row.valueLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
