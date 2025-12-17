import { useMemo, useState, type CSSProperties } from 'react'
import { useTheme } from '@/context/theme-provider'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { type ColumnFiltersState } from '@tanstack/react-table'
import { useLanguage } from '@/context/language-provider'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { CompaniesTable } from './components/companies-table'
import { useCompanies } from './hooks/use-companies'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, Filter, Globe2, LineChart, Sparkles } from 'lucide-react'

export function Companies() {
  const { t } = useLanguage()
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const { data: companies = [], isLoading, isError, error } = useCompanies()

  const [quickFilters, setQuickFilters] = useState<ColumnFiltersState>([])
  const [viewPreset, setViewPreset] = useState<'default'|'fundamentals'|'balance'|'performance'|'all'>('default')

  const metrics = useMemo(() => {
    const regions = new Set<string>()
    const markets = new Set<string>()
    const sectors = new Set<string>()
    const sectorCountMap: Record<string, number> = {}
    const regionCountMap: Record<string, number> = {}
    const marketCountMap: Record<string, number> = {}

    companies.forEach((company) => {
      regions.add(company.region)
      markets.add(company.market)
      if (company.sector) {
        sectors.add(company.sector)
        sectorCountMap[company.sector] = (sectorCountMap[company.sector] ?? 0) + 1
      }

      regionCountMap[company.region] = (regionCountMap[company.region] ?? 0) + 1
      marketCountMap[company.market] = (marketCountMap[company.market] ?? 0) + 1
    })

    const topMarkets = Object.entries(marketCountMap)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 4)

    const groupedByRegion = Object.entries(
      companies.reduce((acc, company) => {
        const region = company.region
        const market = company.market
        if (!acc[region]) acc[region] = {}
        if (!acc[region][market]) acc[region][market] = []
        acc[region][market].push(company)
        return acc
      }, {} as Record<string, Record<string, typeof companies>>)
    )

    return {
      totals: {
        companies: companies.length,
        regions: regions.size,
        markets: markets.size,
        sectors: sectors.size,
      },
      regionCountMap,
      marketCountMap,
      topMarkets,
      sectorCountMap,
      groupedByRegion,
    }
  }, [companies])

  const hasFilters = quickFilters.length > 0

  const setFilter = (id: string, value?: string) => {
    setQuickFilters((prev) => {
      const next = prev.filter((f) => f.id !== id)
      const isActive = prev.some((f) => f.id === id && f.value === value)
      if (!value || isActive) return next
      return [...next, { id, value }]
    })
  }

  const clearFilters = () => setQuickFilters([])

  const { resolvedTheme } = useTheme()

  return (
    <>
      <Header fixed>
        <Search />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='grid gap-4 xl:grid-cols-[320px,1fr]'>
          <aside className='space-y-4 min-w-0'>
            <div className='rounded-2xl bg-card border p-4 shadow-sm max-w-full min-w-0'>
              <div className='p-3 space-y-3 min-w-0 max-w-full'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-1.5'>
                    <p className='text-[11px] uppercase tracking-[0.12em] text-muted-foreground'>{t('companies.hero.kicker')}</p>
                    <h2 className='text-lg font-semibold leading-tight text-foreground'>{t('companies.hero.title')}</h2>
                    <p className='text-sm leading-snug text-muted-foreground max-w-lg'>{t('companies.hero.subtitle')}</p>
                  </div>
                  {/* Badges: usamos una versión más compacta y neutra (movida desde la parte inferior) */}
                  <Badge variant='outline' className='w-fit border-muted-foreground/20 bg-muted/10 text-foreground backdrop-blur'>
                    {metrics.totals.regions} {t('companies.metrics.regionsLabel')} • {metrics.totals.sectors} {t('companies.metrics.sectorsLabel')}
                  </Badge>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  <div className='rounded-lg p-2 border bg-white/30 dark:bg-black/20 border-white/10 dark:border-black/30 text-foreground shadow-sm backdrop-blur-md'>
                    <div className='flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-700 dark:text-white/80'>
                      <span>{t('companies.metrics.coverage')}</span>
                      <Globe2 className='h-4 w-4' />
                    </div>
                    <p className='mt-1 text-xl font-semibold text-slate-900 dark:text-white'>{metrics.totals.companies}</p>
                    <p className='text-[11px] text-muted-foreground'>{t('companies.metrics.coverageHint')}</p>
                  </div>
                  <div className='rounded-lg p-2 border bg-white/30 dark:bg-black/20 border-white/10 dark:border-black/30 text-foreground shadow-sm backdrop-blur-md'>
                    <div className='flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-700 dark:text-white/80'>
                      <span>{t('companies.metrics.marketAccess')}</span>
                      <LineChart className='h-4 w-4' />
                    </div>
                    <p className='mt-1 text-xl font-semibold text-slate-900 dark:text-white'>{metrics.totals.markets}</p>
                    <p className='text-[11px] text-muted-foreground'>
                      {t('companies.metrics.marketHint', { regions: metrics.totals.regions })}
                    </p>
                  </div>
                </div>
                {/* Badge inferior original eliminada: la hemos movido arriba */}

                {/* Tabla y elementos principales movidos dentro de la tarjeta según petición */}
                {isError && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {error instanceof Error ? error.message : 'Error al cargar las empresas. Por favor, intenta de nuevo más tarde.'}
                      <br />
                      <span className='text-xs mt-2 block'>
                        Tip: Puedes configurar VITE_FINNHUB_API_KEY o VITE_FMP_API_KEY en tu archivo .env para obtener más datos.
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className='space-y-4'>
                    <Skeleton className='h-12 w-full' />
                    <Skeleton className='h-64 w-full' />
                    <Skeleton className='h-12 w-full' />
                  </div>
                ) : (
                  <>
                    {/* View preset buttons for columns */}
                    <div className='mb-3 flex items-center gap-2 min-w-0 max-w-full'>
                      <div className='text-xs text-muted-foreground mr-2 shrink-0'>Vista:</div>
                      <div className='flex items-center gap-2 min-w-0 max-w-full overflow-x-auto whitespace-nowrap'>
                        <Button size='sm' variant={viewPreset === 'default' ? 'default' : 'ghost'} onClick={() => setViewPreset('default')}>{t('companies.view.default')}</Button>
                        <Button size='sm' variant={viewPreset === 'fundamentals' ? 'default' : 'ghost'} onClick={() => setViewPreset('fundamentals')}>{t('companies.view.fundamentals')}</Button>
                        <Button size='sm' variant={viewPreset === 'balance' ? 'default' : 'ghost'} onClick={() => setViewPreset('balance')}>{t('companies.view.balance')}</Button>
                        <Button size='sm' variant={viewPreset === 'performance' ? 'default' : 'ghost'} onClick={() => setViewPreset('performance')}>{t('companies.view.performance')}</Button>
                        <Button size='sm' variant={viewPreset === 'all' ? 'default' : 'ghost'} onClick={() => setViewPreset('all')}>{t('companies.view.all')}</Button>
                      </div>
                    </div>

                    <CompaniesTable data={companies} search={search} navigate={navigate} presetFilters={quickFilters} viewPreset={viewPreset} />

                    {/* Desglose regional: movido fuera de la tarjeta principal (se renderiza en la sección principal) */}
                  </>
                )}
              </div>
            </div>
          </aside>

          <section className='space-y-4' />
        </div>
      </Main>
    </>
  )
}
