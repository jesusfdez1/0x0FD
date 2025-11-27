import { useState } from 'react'
import { type Asset, AssetType } from '../types'
import { getAssetTypeLabel, getAssetCategory } from '../utils/asset-helpers'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-provider'

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
  const { t } = useLanguage()
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

  const categoryTotals = Object.entries(typesByCategory).reduce((acc, [category, types]) => {
    acc[category] = types.reduce((sum, item) => sum + item.count, 0)
    return acc
  }, {} as Record<string, number>)

  const getCategoryPercentage = (categoriesList: string[]) => {
    const total = categoriesList.reduce((sum, category) => sum + (categoryTotals[category] || 0), 0)
    return totalAssets > 0 ? (total / totalAssets) * 100 : 0
  }

  const uniqueCategories = Object.keys(categoryTotals).length
  const diversificationScore = totalAssets > 0
    ? 1 - Object.values(categoryTotals).reduce((sum, count) => {
        const weight = count / totalAssets
        return sum + weight * weight
      }, 0)
    : 0
  const diversificationScorePercent = Math.round(diversificationScore * 100)
  type LevelKey = 'high' | 'medium' | 'low' | 'strong' | 'moderate' | 'limited'

  const levelLabels: Record<LevelKey, string> = {
    high: t('assets.overview.level.high'),
    medium: t('assets.overview.level.medium'),
    low: t('assets.overview.level.low'),
    strong: t('assets.overview.level.strong'),
    moderate: t('assets.overview.level.moderate'),
    limited: t('assets.overview.level.limited'),
  }

  const diversificationLevelKey: LevelKey =
    diversificationScorePercent >= 70 ? 'high' :
    diversificationScorePercent >= 40 ? 'medium' :
    'low'
  const diversificationLevel = levelLabels[diversificationLevelKey]

  const riskyExposure = getCategoryPercentage([
    'Renta variable',
    'Derivados',
    'Criptoactivos',
    'Materias primas',
  ])
  const defensiveCoverage = getCategoryPercentage([
    'Renta fija',
    'Efectivo y depósitos',
    'Planes de pensiones',
    'Productos estructurados',
  ])
  const liquidityShare = getCategoryPercentage([
    'Efectivo y depósitos',
    'Divisas',
  ])
  const growthShare = getCategoryPercentage([
    'Renta variable',
    'Fondos',
    'Criptoactivos',
  ])

  const riskyLevelKey: LevelKey =
    riskyExposure >= 60 ? 'high' :
    riskyExposure >= 35 ? 'medium' :
    'low'
  const riskyLevel = levelLabels[riskyLevelKey]

  const defensiveLevelKey: LevelKey =
    defensiveCoverage >= 50 ? 'strong' :
    defensiveCoverage >= 25 ? 'moderate' :
    'limited'
  const defensiveLevel = levelLabels[defensiveLevelKey]

  const indicatorBadgeClasses = (level: LevelKey) => {
    switch (level) {
      case 'high':
      case 'strong':
        return 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20'
      case 'medium':
      case 'moderate':
        return 'text-amber-600 bg-amber-500/10 border border-amber-500/20'
      case 'low':
      case 'limited':
        return 'text-red-600 bg-red-500/10 border border-red-500/20'
      default:
        return 'text-muted-foreground bg-muted border border-border/60'
    }
  }

  // Calcular posiciones acumuladas para los segmentos
  let accumulatedWidth = 0

  return (
    <div className='mb-6'>
      {/* Header con total a la derecha del título */}
      <div className='mb-6 border-b pb-4'>
        <div className='flex items-baseline gap-3 mb-1'>
          <h2 className='text-xl font-semibold tracking-tight'>{t('assets.overview.title')}</h2>
          <div className='text-2xl font-semibold tracking-tight'>{totalAssets}</div>
        </div>
        <p className='text-xs text-muted-foreground'>
          {sortedTypes.length}{' '}
          {sortedTypes.length === 1 ? t('assets.overview.typeLabelSingle') : t('assets.overview.typeLabelPlural')}
        </p>
      </div>

      <div className='space-y-2 mb-3'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2'>
          <div className='rounded-md border bg-card/20 px-3 py-2 min-h-[70px]'>
            <div className='flex items-center justify-between gap-2'>
              <div>
                <p className='text-[10px] text-muted-foreground uppercase tracking-[0.08em]'>{t('assets.overview.indicators.diversification')}</p>
                <div className='flex items-baseline gap-1 leading-none'>
                  <p className='text-base font-semibold'>{diversificationScorePercent}%</p>
                  <span className='text-[10px] text-muted-foreground'>{t('assets.overview.indicators.categoriesLabel')} {uniqueCategories}</span>
                </div>
              </div>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full border leading-none', indicatorBadgeClasses(diversificationLevelKey))}>
                {diversificationLevel}
              </span>
            </div>
            <div className='h-1 w-full rounded-full bg-muted mt-1'>
              <div
                className='h-full rounded-full bg-primary transition-all'
                style={{ width: `${diversificationScorePercent}%` }}
              />
            </div>
          </div>

          <div className='rounded-md border bg-card/20 px-3 py-2 min-h-[70px]'>
            <div className='flex items-center justify-between gap-2'>
              <div>
                <p className='text-[10px] text-muted-foreground uppercase tracking-[0.08em]'>{t('assets.overview.indicators.riskExposure')}</p>
                <p className='text-base font-semibold leading-none'>{riskyExposure.toFixed(1)}%</p>
                <p className='text-[10px] text-muted-foreground'>{t('assets.overview.indicators.riskHint')}</p>
              </div>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full border leading-none', indicatorBadgeClasses(riskyLevelKey))}>
                {riskyLevel}
              </span>
            </div>
          </div>

          <div className='rounded-md border bg-card/20 px-3 py-2 min-h-[70px]'>
            <div className='flex items-center justify-between gap-2'>
              <div>
                <p className='text-[10px] text-muted-foreground uppercase tracking-[0.08em]'>{t('assets.overview.indicators.defensiveCoverage')}</p>
                <p className='text-base font-semibold leading-none'>{defensiveCoverage.toFixed(1)}%</p>
                <p className='text-[10px] text-muted-foreground'>{t('assets.overview.indicators.defensiveHint')}</p>
              </div>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full border leading-none', indicatorBadgeClasses(defensiveLevelKey))}>
                {defensiveLevel}
              </span>
            </div>
          </div>
          <div className='rounded-md border bg-card/20 px-3 py-2 min-h-[70px]'>
            <p className='text-[10px] text-muted-foreground uppercase tracking-[0.08em]'>{t('assets.overview.indicators.liquidity')}</p>
            <p className='text-sm font-semibold leading-none mt-1'>{liquidityShare.toFixed(1)}%</p>
            <p className='text-[10px] text-muted-foreground'>{t('assets.overview.indicators.liquidityHint')}</p>
          </div>
          <div className='rounded-md border bg-card/20 px-3 py-2 min-h-[70px]'>
            <p className='text-[10px] text-muted-foreground uppercase tracking-[0.08em]'>{t('assets.overview.indicators.growth')}</p>
            <p className='text-sm font-semibold leading-none mt-1'>{growthShare.toFixed(1)}%</p>
            <p className='text-[10px] text-muted-foreground'>{t('assets.overview.indicators.growthHint')}</p>
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='relative group'>
          <div className='w-full h-12 bg-muted/50 rounded-full overflow-hidden relative border border-border/50 shadow-inner'>
            {sortedTypes.map(({ type, percentage }) => {
              const color = getAssetTypeColor(type)
              const width = percentage
              const left = accumulatedWidth
              const center = left + width / 2
              const label = getAssetTypeLabel(type)
              const isHovered = hoveredType === type
              
              accumulatedWidth += width

                return (
                  <div
                    key={type}
                    className={cn(
                      'h-full absolute top-0 transition-all duration-300 ease-out cursor-pointer border border-white/50 dark:border-black/40 box-border',
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
                    title={`${label}: ${assetsByType[type]} ${t('assets.table.assetPlural')} (${percentage.toFixed(1)}%)`}
                  />
                )
            })}
          </div>

          {hoveredType && hoveredPosition && (() => {
            const hoveredData = sortedTypes.find(t => t.type === hoveredType)
            const category = getAssetCategory(hoveredType)
            const count = assetsByType[hoveredType]
            const percentage = hoveredData?.percentage || 0
            
            const leftPercent = hoveredPosition.center
            let transform = 'translateX(-50%)'
            let left = `${leftPercent}%`
            
            if (leftPercent < 10) {
              transform = 'translateX(0)'
              left = '0%'
            } else if (leftPercent > 90) {
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
                          <span>{t('assets.overview.tooltip.category')}:</span>
                          <span className='font-medium'>{category}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span>{t('assets.overview.tooltip.total')}:</span>
                          <span className='font-semibold'>{count}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span>{t('assets.overview.tooltip.percentage')}:</span>
                          <span className='font-semibold'>{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
          {Object.entries(typesByCategory)
            .sort(([categoryA, a], [categoryB, b]) => {
              const categoriesToEnd = ['Renta fija', 'Renta variable', 'Criptoactivos', 'Planes de pensiones']
              const aShouldEnd = categoriesToEnd.includes(categoryA)
              const bShouldEnd = categoriesToEnd.includes(categoryB)
              
              if (aShouldEnd && !bShouldEnd) return 1
              if (!aShouldEnd && bShouldEnd) return -1
              
              const totalA = a.reduce((sum, item) => sum + item.count, 0)
              const totalB = b.reduce((sum, item) => sum + item.count, 0)
              return totalB - totalA
            })
            .map(([category, types]) => {
              const categoryTotal = types.reduce((sum, item) => sum + item.count, 0)
              const categoryPercentage = totalAssets > 0 ? ((categoryTotal / totalAssets) * 100).toFixed(1) : '0'

              return (
                <div key={category} className='space-y-2'>
                  <div className='flex items-baseline gap-2 pb-1'>
                    <h3 className='text-sm font-bold text-foreground'>{category}</h3>
                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <span className='font-semibold'>{categoryTotal}</span>
                      <span>({categoryPercentage}%)</span>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2'>
                    {types.map(({ type, count, percentage }) => {
                      const label = getAssetTypeLabel(type)
                      const color = getAssetTypeColor(type)
                      const isHovered = hoveredType === type
                      
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
                          <div className={cn('w-3 h-3 rounded-full shrink-0', color)} />
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
