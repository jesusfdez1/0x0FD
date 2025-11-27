import { useState } from 'react'
import { type Asset, AssetType } from '../types'
import { getAssetTypeLabel, getAssetCategory } from '../utils/asset-helpers'
import { cn } from '@/lib/utils'

interface AssetsOverviewProps {
  assets: Asset[]
}

// Colores para cada tipo de activo - mejorados para mejor diferenciación
const getAssetTypeColor = (type: AssetType): string => {
  const colors: Record<AssetType, string> = {
    [AssetType.STOCK]: 'bg-blue-600',
    [AssetType.ETF]: 'bg-violet-600',
    [AssetType.FIXED_INCOME]: 'bg-emerald-600',
    [AssetType.GUARANTEED]: 'bg-amber-500',
    [AssetType.CURRENCY]: 'bg-cyan-600',
    [AssetType.OPTION]: 'bg-orange-600',
    [AssetType.MUTUAL_FUND]: 'bg-indigo-600',
    [AssetType.PENSION_PLAN]: 'bg-rose-500',
    [AssetType.WARRANT]: 'bg-red-600',
    [AssetType.REAL_ESTATE]: 'bg-teal-600',
    [AssetType.CRYPTO]: 'bg-yellow-500',
    [AssetType.COMMODITY]: 'bg-amber-700',
    [AssetType.FUTURES]: 'bg-purple-700',
    [AssetType.STRUCTURED_PRODUCT]: 'bg-slate-600',
    [AssetType.SAVINGS_ACCOUNT]: 'bg-green-600',
    [AssetType.TERM_DEPOSIT]: 'bg-sky-600',
    [AssetType.CHECKING_ACCOUNT]: 'bg-neutral-500',
    [AssetType.PRECIOUS_METAL]: 'bg-yellow-700',
  }
  return colors[type] || 'bg-gray-500'
}

export function AssetsOverview({ assets }: AssetsOverviewProps) {
  const [hoveredType, setHoveredType] = useState<AssetType | null>(null)
  const [hoveredPosition, setHoveredPosition] = useState<{ left: number; center: number } | null>(null)

  // Contar activos por tipo
  const assetsByType = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1
    return acc
  }, {} as Record<AssetType, number>)

  const totalAssets = assets.length

  // Ordenar tipos por cantidad (descendente) y calcular porcentajes
  const sortedTypes = Object.entries(assetsByType)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type: type as AssetType,
      count,
      percentage: totalAssets > 0 ? (count / totalAssets) * 100 : 0
    }))

  // Agrupar por categoría para la leyenda
  const typesByCategory = sortedTypes.reduce((acc, { type, count, percentage }) => {
    const category = getAssetCategory(type)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push({ type, count, percentage })
    return acc
  }, {} as Record<string, Array<{ type: AssetType; count: number; percentage: number }>>)

  // Calcular posiciones acumuladas para los segmentos
  let accumulatedWidth = 0

  return (
    <div className='mb-6'>
      {/* Header con total a la derecha del título */}
      <div className='mb-6 border-b pb-4'>
        <div className='flex items-baseline gap-3 mb-1'>
          <h2 className='text-xl font-semibold tracking-tight'>Distribución de activos</h2>
          <div className='text-2xl font-semibold tracking-tight'>{totalAssets}</div>
        </div>
        <p className='text-xs text-muted-foreground'>
          {sortedTypes.length} {sortedTypes.length === 1 ? 'tipo' : 'tipos'} diferentes
        </p>
      </div>

      {/* Barra cilíndrica horizontal única - Interactiva */}
      <div className='space-y-4'>
        {/* Contenedor de la barra */}
        <div className='relative group'>
          {/* Barra horizontal completa */}
          <div className='w-full h-12 bg-muted/50 rounded-full overflow-hidden relative border border-border/50 shadow-inner'>
            {sortedTypes.map(({ type, percentage }) => {
              const color = getAssetTypeColor(type)
              const width = percentage
              const left = accumulatedWidth
              const center = left + width / 2
              const label = getAssetTypeLabel(type)
              const isHovered = hoveredType === type
              
              // Actualizar acumulado para el siguiente segmento
              accumulatedWidth += width

              return (
                <div
                  key={type}
                  className={cn(
                    'h-full absolute top-0 transition-all duration-300 ease-out cursor-pointer',
                    color,
                    isHovered && 'ring-2 ring-offset-2 ring-foreground/20 z-10 scale-y-110'
                  )}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                  onMouseEnter={() => {
                    setHoveredType(type)
                    setHoveredPosition({ left, center })
                  }}
                  onMouseLeave={() => {
                    setHoveredType(null)
                    setHoveredPosition(null)
                  }}
                  title={`${label}: ${assetsByType[type]} activos (${percentage.toFixed(1)}%)`}
                />
              )
            })}
          </div>

          {/* Tooltip al hacer hover - posicionado sobre el segmento */}
          {hoveredType && hoveredPosition && (() => {
            const hoveredData = sortedTypes.find(t => t.type === hoveredType)
            const category = getAssetCategory(hoveredType)
            const count = assetsByType[hoveredType]
            const percentage = hoveredData?.percentage || 0
            
            // Calcular posición para evitar que se salga de pantalla
            // Aproximadamente 280px = ~15% en pantallas normales
            const leftPercent = hoveredPosition.center
            let transform = 'translateX(-50%)'
            let left = `${leftPercent}%`
            
            // Si está muy cerca del borde izquierdo (< 10%), alinear a la izquierda
            if (leftPercent < 10) {
              transform = 'translateX(0)'
              left = '0%'
            } 
            // Si está muy cerca del borde derecho (> 90%), alinear a la derecha
            else if (leftPercent > 90) {
              transform = 'translateX(-100%)'
              left = '100%'
            }
            
            return (
              <div 
                className='absolute -top-28 z-20 pointer-events-none'
                style={{
                  left,
                  transform,
                }}
              >
                <div className='bg-popover text-popover-foreground px-5 py-3 rounded-lg shadow-xl border w-[280px]'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <div className={cn('w-3 h-3 rounded-full shrink-0', getAssetTypeColor(hoveredType))} />
                      <div className='font-semibold text-sm'>{getAssetTypeLabel(hoveredType)}</div>
                    </div>
                    <div className='text-xs text-muted-foreground border-t pt-2 space-y-1.5'>
                      <div className='flex items-center justify-between'>
                        <span>Categoría:</span>
                        <span className='font-medium'>{category}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>Total de activos:</span>
                        <span className='font-semibold'>{count}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span>Porcentaje:</span>
                        <span className='font-semibold'>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Leyenda agrupada por categoría - varias categorías a la misma altura */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
          {Object.entries(typesByCategory)
            .sort(([, a], [, b]) => {
              const totalA = a.reduce((sum, item) => sum + item.count, 0)
              const totalB = b.reduce((sum, item) => sum + item.count, 0)
              return totalB - totalA
            })
            .map(([category, types]) => {
              const categoryTotal = types.reduce((sum, item) => sum + item.count, 0)
              const categoryPercentage = totalAssets > 0 ? ((categoryTotal / totalAssets) * 100).toFixed(1) : '0'

              return (
                <div key={category} className='space-y-2'>
                  {/* Header de categoría */}
                  <div className='flex items-baseline gap-2 pb-1'>
                    <h3 className='text-sm font-bold text-foreground'>{category}</h3>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <span className='font-semibold'>{categoryTotal}</span>
                      <span>({categoryPercentage}%)</span>
                    </div>
                  </div>

                  {/* Tipos dentro de la categoría - más columnas */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2'>
                    {types.map(({ type, count, percentage }) => {
                      const label = getAssetTypeLabel(type)
                      const color = getAssetTypeColor(type)
                      const isHovered = hoveredType === type
                      
                      // Calcular posición del tipo en la barra
                      const typeIndex = sortedTypes.findIndex(t => t.type === type)
                      const typeLeft = sortedTypes.slice(0, typeIndex).reduce((sum, t) => sum + t.percentage, 0)
                      const typeCenter = typeLeft + percentage / 2

                      return (
                        <div
                          key={type}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer',
                            isHovered && 'bg-muted'
                          )}
                          onMouseEnter={() => {
                            setHoveredType(type)
                            setHoveredPosition({ left: typeLeft, center: typeCenter })
                          }}
                          onMouseLeave={() => {
                            setHoveredType(null)
                            setHoveredPosition(null)
                          }}
                        >
                          {/* Indicador de color */}
                          <div className={cn('w-3 h-3 rounded-full shrink-0', color)} />
                          {/* Información */}
                          <div className='min-w-0 flex-1'>
                            <div className='text-xs font-medium text-foreground wrap-break-word leading-tight'>{label}</div>
                            <div className='flex items-center gap-1.5'>
                              <span className='text-[10px] font-semibold'>{count}</span>
                              <span className='text-[10px] text-muted-foreground'>({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
