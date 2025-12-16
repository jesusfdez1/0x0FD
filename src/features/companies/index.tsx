import { useMemo, useState, type CSSProperties } from 'react'
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

  const panelAccent = useMemo(
    () =>
      ({
        '--panel-from': 'color-mix(in oklab, var(--primary) 65%, #1a1f2b)',
        '--panel-to': 'color-mix(in oklab, var(--primary) 82%, #101218)',
        '--panel-tile': 'color-mix(in oklab, var(--primary) 16%, #1b2230)',
        '--panel-glass': 'color-mix(in oklab, var(--primary) 12%, #e6e9f2)',
      }) as CSSProperties,
    []
  )

  return (
    <>
      <Header fixed>
        <Search />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='grid gap-4 xl:grid-cols-[320px,1fr]'>
          <aside className='space-y-4'>
            <div
              className='rounded-2xl bg-[radial-gradient(circle_at_18%_18%,var(--panel-to)_0%,transparent_34%),linear-gradient(135deg,var(--panel-from)_0%,var(--panel-to)_60%,#050505_100%)] text-white shadow-2xl backdrop-blur-xl'
              style={panelAccent}
            >
              <div className='p-4 space-y-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-1.5'>
                    <p className='text-[11px] uppercase tracking-[0.12em] text-white/60'>{t('companies.hero.kicker')}</p>
                    <h2 className='text-xl font-semibold leading-tight text-white'>{t('companies.hero.title')}</h2>
                    <p className='text-sm leading-relaxed text-white/80 max-w-xl'>{t('companies.hero.subtitle')}</p>
                  </div>
                  <Badge variant='secondary' className='border-white/15 bg-white/10 text-white shadow-sm backdrop-blur'>
                    <Sparkles className='mr-1 h-4 w-4' />
                    {t('companies.hero.badge')}
                  </Badge>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  <div className='rounded-lg bg-[color:var(--panel-glass)]/60 p-3 text-slate-900 shadow-sm backdrop-blur-2xl dark:text-white/90'>
                    <div className='flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-700 dark:text-white/80'>
                      <span>{t('companies.metrics.coverage')}</span>
                      <Globe2 className='h-4 w-4' />
                    </div>
                    <p className='mt-1 text-2xl font-semibold text-slate-900 dark:text-white'>{metrics.totals.companies}</p>
                    <p className='text-[11px] text-slate-700 dark:text-white/80'>{t('companies.metrics.coverageHint')}</p>
                  </div>
                  <div className='rounded-lg bg-[color:var(--panel-glass)]/60 p-3 text-slate-900 shadow-sm backdrop-blur-2xl dark:text-white/90'>
                    <div className='flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-700 dark:text-white/80'>
                      <span>{t('companies.metrics.marketAccess')}</span>
                      <LineChart className='h-4 w-4' />
                    </div>
                    <p className='mt-1 text-2xl font-semibold text-slate-900 dark:text-white'>{metrics.totals.markets}</p>
                    <p className='text-[11px] text-slate-700 dark:text-white/80'>
                      {t('companies.metrics.marketHint', { regions: metrics.totals.regions })}
                    </p>
                  </div>
                </div>

                <Badge variant='outline' className='w-fit border-white/20 bg-white/15 text-white backdrop-blur'>
                  {metrics.totals.regions} {t('companies.metrics.regionsLabel')} • {metrics.totals.sectors} {t('companies.metrics.sectorsLabel')}
                </Badge>
              </div>
            </div>
          </aside>

          <section className='space-y-4'>
            <div className='rounded-2xl border bg-card/50 p-3 sm:p-4 shadow-sm backdrop-blur'>
              <div className='flex flex-wrap items-center gap-2 justify-start'>
                {Object.entries(metrics.regionCountMap)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([region]) => {
                    const active = quickFilters.some((f) => f.id === 'region' && f.value === region)
                    return (
                      <Button key={region} variant={active ? 'default' : 'outline'} size='sm' onClick={() => setFilter('region', region)}>
                        {region}
                      </Button>
                    )
                  })}

                {metrics.topMarkets.map(([market]) => {
                  const active = quickFilters.some((f) => f.id === 'market' && f.value === market)
                  return (
                    <Button key={market} variant={active ? 'default' : 'ghost'} size='sm' onClick={() => setFilter('market', market)}>
                      {market}
                    </Button>
                  )
                })}

                {Object.entries(metrics.sectorCountMap)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([sector]) => {
                    const active = quickFilters.some((f) => f.id === 'sector' && f.value === sector)
                    return (
                      <Button key={sector} variant={active ? 'default' : 'ghost'} size='sm' onClick={() => setFilter('sector', sector)}>
                        {sector}
                      </Button>
                    )
                  })}

                {hasFilters && (
                  <Button variant='outline' size='sm' onClick={clearFilters}>
                    {t('companies.quickFilters.reset')}
                  </Button>
                )}
              </div>
            </div>

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
                <CompaniesTable data={companies} search={search} navigate={navigate} presetFilters={quickFilters} />

                {companies.length > 0 && (
                  <div className='rounded-2xl border bg-card/40 p-4 sm:p-6 shadow-sm'>
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                      <div>
                        <p className='text-[11px] uppercase tracking-[0.12em] text-muted-foreground'>{t('companies.regionOverview.kicker')}</p>
                        <h3 className='text-lg font-semibold'>{t('companies.regionOverview.title')}</h3>
                        <p className='text-sm text-muted-foreground'>{t('companies.regionOverview.subtitle')}</p>
                      </div>
                      <Badge variant='outline' className='gap-1 border-muted-foreground/30'>
                        <Sparkles className='h-4 w-4' />
                        {metrics.totals.regions} {t('companies.metrics.regionsLabel')}
                      </Badge>
                    </div>

                    <div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                      {metrics.groupedByRegion.map(([region, markets]) => {
                        const totalByRegion = Object.values(markets as Record<string, typeof companies>).reduce((sum, list) => sum + list.length, 0)
                        return (
                        <div key={region} className='rounded-xl border bg-background/60 p-4 shadow-sm'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline'>{region}</Badge>
                              <span className='text-xs text-muted-foreground'>
                                {totalByRegion} {t('companies.entity.plural')}
                              </span>
                            </div>
                            <ArrowRight className='h-4 w-4 text-muted-foreground' />
                          </div>

                          <div className='mt-3 space-y-4'>
                            {Object.entries(markets).map(([market, list]) => (
                              <div key={market} className='rounded-lg border border-dashed bg-muted/30 p-3'>
                                <div className='flex items-center justify-between gap-2'>
                                  <div className='flex items-center gap-2'>
                                    <Badge variant='secondary' className='bg-muted text-muted-foreground'>{market}</Badge>
                                    <span className='text-xs text-muted-foreground'>
                                      {list.length} {t('companies.entity.plural')}
                                    </span>
                                  </div>
                                  <Button variant='ghost' size='sm' onClick={() => setFilter('market', market)}>
                                    {t('companies.quickFilters.focus')}
                                  </Button>
                                </div>
                                <ul className='mt-2 grid gap-2'>
                                  {list.slice(0, 6).map((company) => {
                                    const cleanTicker = company.ticker.split('.')[0]
                                    const token = import.meta.env.VITE_LOGO_DEV_TOKEN || ''

                                    const tickerUrl = token
                                      ? `https://img.logo.dev/ticker/${encodeURIComponent(cleanTicker)}?token=${token}&format=webp&retina=true&size=48&fallback=404`
                                      : null

                                    const nameUrl = token
                                      ? `https://img.logo.dev/name/${encodeURIComponent(company.name)}?token=${token}&format=webp&retina=true&size=48`
                                      : null

                                    const placeholderUrl = `https://via.placeholder.com/48?text=${encodeURIComponent(company.name.charAt(0))}`

                                    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                      const target = e.target as HTMLImageElement
                                      const currentSrc = target.src

                                      if (currentSrc.includes('/ticker/') && nameUrl) {
                                        target.src = nameUrl
                                      } else {
                                        target.src = placeholderUrl
                                      }
                                    }

                                    return (
                                      <li key={company.id} className='flex items-center gap-3 rounded-md bg-background/80 px-2 py-1.5'>
                                        <div className='h-9 w-9 overflow-hidden rounded bg-muted/60'>
                                          <img
                                            src={tickerUrl || nameUrl || placeholderUrl}
                                            alt={company.name}
                                            className='h-full w-full object-contain'
                                            onError={handleImageError}
                                          />
                                        </div>
                                        <div className='min-w-0'>
                                          <p className='truncate text-sm font-medium'>{company.name}</p>
                                          <p className='text-xs text-muted-foreground'>{company.ticker}</p>
                                        </div>
                                      </li>
                                    )
                                  })}
                                  {list.length > 6 && (
                                    <p className='text-xs text-muted-foreground'>
                                      {t('companies.regionOverview.more', { count: list.length - 6 })}
                                    </p>
                                  )}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </Main>
    </>
  )
}
