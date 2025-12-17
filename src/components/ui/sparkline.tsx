import React, { useMemo, useRef, useState } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  className?: string
  interactive?: boolean
  labels?: Array<string | number>
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string | number) => string
}

export function Sparkline({
  data,
  width = 80,
  height = 28,
  stroke,
  fill = 'none',
  className,
  interactive = false,
  labels,
  valueFormatter,
  labelFormatter,
}: SparklineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const safeLabels = useMemo(() => {
    if (!labels || labels.length !== data.length) return null
    return labels
  }, [labels, data.length])

  if (!data || data.length === 0) {
    return (
      <div ref={containerRef} className={className}>
        <svg width={width} height={height} />
      </div>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width
      const y = height - ((d - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  // stroke color default based on last change
  const strokeColor = stroke || (data[data.length - 1] >= data[0] ? '#16a34a' : '#dc2626')

  const activeIndex = hoverIndex == null ? null : Math.max(0, Math.min(data.length - 1, hoverIndex))
  const activeValue = activeIndex == null ? null : data[activeIndex]
  const activeX = activeIndex == null ? null : (activeIndex / Math.max(1, data.length - 1)) * width
  const activeY = activeValue == null ? null : height - ((activeValue - min) / range) * height

  const formatValue = (v: number) => (valueFormatter ? valueFormatter(v) : String(v))
  const formatLabel = (l: string | number) => (labelFormatter ? labelFormatter(l) : String(l))

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!interactive) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = rect.width <= 0 ? 0 : x / rect.width
    const idx = Math.round(ratio * (data.length - 1))
    setHoverIndex(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const handleLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    if (!interactive) return
    setHoverIndex(null)
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      role={interactive ? 'img' : undefined}
    >
      <svg width='100%' height='100%' viewBox={`0 0 ${width} ${height}`} preserveAspectRatio='none'>
        <polyline fill={fill} stroke={strokeColor} strokeWidth={1.5} points={points} strokeLinecap='round' strokeLinejoin='round' />

        {interactive && activeIndex != null && activeX != null && activeY != null && (
          <>
            <line x1={activeX} y1={0} x2={activeX} y2={height} stroke={strokeColor} strokeWidth={1} opacity={0.35} />
            <circle cx={activeX} cy={activeY} r={3} fill={strokeColor} />
          </>
        )}
      </svg>

      {interactive && activeIndex != null && activeValue != null && (
        <div className='pointer-events-none mt-1 text-[11px] text-muted-foreground'>
          {safeLabels ? `${formatLabel(safeLabels[activeIndex])}: ` : ''}
          <span className='text-foreground'>{formatValue(activeValue)}</span>
        </div>
      )}
    </div>
  )
}

export default Sparkline
