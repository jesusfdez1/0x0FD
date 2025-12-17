import React from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
}

export function Sparkline({ data, width = 80, height = 28, stroke, fill = 'none' }: SparklineProps) {
  if (!data || data.length === 0) return <svg width={width} height={height} />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  // stroke color default based on last change
  const strokeColor = stroke || (data[data.length - 1] >= data[0] ? '#16a34a' : '#dc2626')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio='none'>
      <polyline fill={fill} stroke={strokeColor} strokeWidth={1.5} points={points} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export default Sparkline
