import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useTheme } from '@/context/theme-provider'
import { useLanguage } from '@/context/language-provider'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LightweightLineChart } from '@/components/ui/lightweight-line-chart'
import { LightweightMultiLineChart } from '@/components/ui/lightweight-multi-line-chart'
import { cn } from '@/lib/utils'
import { useCompanies } from './hooks/use-companies'
import { generateSyntheticPrices, useSyntheticPrices } from './hooks/use-synthetic-prices'
import { ArrowLeft, ArrowUpRight, Copy, ExternalLink } from 'lucide-react'

function seedFromString(value: string) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildYearlySeries(options: {
  seedKey: string
  currentYear: number
  yearsBack: number
  currentValue: number
  minRate: number
  maxRate: number
  floor?: number
}) {
  const { seedKey, currentYear, yearsBack, currentValue, minRate, maxRate, floor = 0 } = options
  const rand = mulberry32(seedFromString(seedKey))

  const rows: Array<{ year: number; value: number; changePct: number | null }> = []
  let v = Math.max(floor, currentValue)
  rows.push({ year: currentYear, value: v, changePct: null })
  for (let y = currentYear - 1; y >= currentYear - yearsBack + 1; y--) {
    const rate = Math.max(minRate, Math.min(maxRate, minRate + (maxRate - minRate) * rand()))
    const denom = Math.max(0.01, 1 + rate)
    const prev = Math.max(floor, v / denom)
    const prevRounded = Math.abs(prev) >= 1 ? Math.round(prev) : +prev.toFixed(4)
    const changePct = prevRounded === 0 ? null : +(((v - prevRounded) / Math.abs(prevRounded)) * 100).toFixed(2)
    rows.push({ year: y, value: prevRounded, changePct })
    v = prevRounded
  }
  return rows
}

export function CompanyDetail({ ticker }: { ticker: string }) {
  const { t, language } = useLanguage()
  const { data = [], isLoading, isError, error } = useCompanies()
  const { resolvedTheme } = useTheme()

  const company = useMemo(
    () => data.find((c) => c.ticker.toLowerCase() === ticker.toLowerCase()),
    [data, ticker]
  )

  const rank = useMemo(() => {
    if (!company || data.length === 0) return null
    const items = data
      .map((c) => ({ ticker: c.ticker, mc: generateSyntheticPrices(c.ticker).marketCap }))
      .sort((a, b) => b.mc - a.mc)
    const index = items.findIndex((i) => i.ticker === company.ticker)
    return index >= 0 ? index + 1 : null
  }, [company, data])

  const activePriceData = useSyntheticPrices(company?.ticker ?? ticker)

  const cleanTicker = useMemo(() => company?.ticker.split('.')[0] ?? ticker.split('.')[0], [company, ticker])

  const logo = useMemo(() => {
    const token = import.meta.env.VITE_LOGO_DEV_TOKEN || ''
    const themeParam = resolvedTheme === 'dark' ? '&theme=dark' : ''
    const tickerUrl = token
      ? `https://img.logo.dev/ticker/${encodeURIComponent(cleanTicker)}?token=${token}&format=webp&retina=true&size=96&fallback=404${themeParam}`
      : null
    const nameUrl = token && company
      ? `https://img.logo.dev/name/${encodeURIComponent(company.name)}?token=${token}&format=webp&retina=true&size=96${themeParam}`
      : null
    const placeholderUrl = company
      ? `https://via.placeholder.com/96?text=${encodeURIComponent(company.name.charAt(0))}`
      : `https://via.placeholder.com/96?text=${encodeURIComponent(cleanTicker.charAt(0) || '?')}`
    return { tickerUrl, nameUrl, placeholderUrl }
  }, [cleanTicker, company, resolvedTheme])

  const meta = useMemo(() => {
    if (!company) return null

    const locale = language === 'es' ? 'es-ES' : undefined
    const usd = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    const compact = new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: language === 'es' ? 'long' : 'short',
      maximumFractionDigits: 2,
    })
    const compactPlain = (value: number) => compact.format(value)
    const moneyCompact = (value: number) => `$${compactPlain(value)}`

    const countryFromMarket = (market: string, region: string) => {
      const m = market.toUpperCase()
      const isEs = language === 'es'
      if (['NYSE', 'NASDAQ', 'AMEX'].includes(m)) return { label: isEs ? 'Estados Unidos' : 'United States', flag: '🇺🇸' }
      if (m === 'LSE') return { label: isEs ? 'Reino Unido' : 'United Kingdom', flag: '🇬🇧' }
      if (m === 'BME') return { label: isEs ? 'España' : 'Spain', flag: '🇪🇸' }
      if (m === 'XETR') return { label: isEs ? 'Alemania' : 'Germany', flag: '🇩🇪' }
      if (m === 'TSE') return { label: isEs ? 'Japón' : 'Japan', flag: '🇯🇵' }
      if (m === 'HKEX') return { label: isEs ? 'Hong Kong' : 'Hong Kong', flag: '🇭🇰' }
      if (region === 'Europe') return { label: isEs ? 'Europa' : 'Europe', flag: '🌍' }
      if (region === 'Asia') return { label: isEs ? 'Asia' : 'Asia', flag: '🌏' }
      if (region === 'North America') return { label: isEs ? 'Norteamérica' : 'North America', flag: '🌎' }
      return { label: region, flag: '🌐' }
    }

    const country = countryFromMarket(company.market, company.region)
    const positive = (v: number) => v >= 0

    const aboutByTicker: Record<string, { es: string; en: string }> = {
      NVDA: {
        es: 'NVIDIA diseña chips y plataformas de computación acelerada (GPU) que impulsan cargas de IA, gráficos y centros de datos. Su tesis suele moverse con ciclos de demanda de cómputo, capex de hyperscalers y adopción de software alrededor de CUDA.',
        en: 'NVIDIA designs chips and accelerated computing platforms (GPUs) powering AI, graphics, and data centers. Its investment thesis often tracks compute demand cycles, hyperscaler capex, and software adoption around CUDA.',
      },
      KO: {
        es: 'Coca‑Cola opera un negocio global de bebidas con marcas ampliamente distribuidas. Su lectura suele estar ligada a precios, mix de producto, ejecución en canales y estabilidad de flujos en entornos defensivos.',
        en: 'Coca‑Cola runs a global beverages business with widely distributed brands. The narrative often revolves around pricing, product mix, channel execution, and stable cashflows in defensive regimes.',
      },
    }
    const about = (aboutByTicker[cleanTicker]?.[language]) ?? t('companies.detail.overview.aboutFallback', { name: company.name, market: company.market })

    return {
      usd,
      moneyCompact,
      compactPlain,
      country,
      about,
      positive,
    }
  }, [company, cleanTicker, t, language])

  const marketCapHistory = useMemo(() => {
    if (!company) return []
    const currentYear = new Date().getFullYear()
    const startYear = 1999
    const rand = mulberry32(seedFromString(`${company.ticker.toUpperCase()}:mchist`))

    const years: Array<{ year: number; marketCap: number; changePct: number | null }> = []
    let cap = activePriceData.marketCap
    years.push({ year: currentYear, marketCap: cap, changePct: null })

    for (let y = currentYear - 1; y >= startYear; y--) {
      const rate = Math.max(-0.85, Math.min(2.0, (rand() - 0.45) * 2.2))
      const denom = Math.max(0.12, 1 + rate)
      const prevCap = Math.max(1, Math.round(cap / denom))
      const changePct = +(((cap - prevCap) / prevCap) * 100).toFixed(2)
      years.push({ year: y, marketCap: prevCap, changePct })
      cap = prevCap
    }

    return years
  }, [company, activePriceData.marketCap])

  const recentYears = 15
  const currentYear = new Date().getFullYear()

  const revenueHistory = useMemo(() => {
    if (!company) return []
    return buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:revenue`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.revenue || 0,
      minRate: -0.15,
      maxRate: 0.55,
      floor: 0,
    })
  }, [company, currentYear, recentYears, activePriceData.revenue])

  const earningsHistory = useMemo(() => {
    if (!company) return []
    return buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:earnings`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.earnings || 0,
      minRate: -0.35,
      maxRate: 0.75,
      floor: 0,
    })
  }, [company, currentYear, recentYears, activePriceData.earnings])

  const epsHistory = useMemo(() => {
    if (!company) return []
    return buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:eps`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.eps ?? 0,
      minRate: -0.35,
      maxRate: 0.85,
      floor: 0,
    })
  }, [company, currentYear, recentYears, activePriceData.eps])

  const operatingMarginHistory = useMemo(() => {
    if (!company) return []
    const base = activePriceData.operatingMargin ?? 0
    const rows = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:opmargin`,
      currentYear,
      yearsBack: recentYears,
      currentValue: base,
      minRate: -0.15,
      maxRate: 0.15,
      floor: -100,
    })
    return rows.map((r) => ({ ...r, value: +Math.max(-100, Math.min(100, r.value)).toFixed(2) }))
  }, [company, currentYear, recentYears, activePriceData.operatingMargin])

  const sharesHistory = useMemo(() => {
    if (!company) return []
    return buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:shares`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.sharesOutstanding,
      minRate: -0.12,
      maxRate: 0.18,
      floor: 0,
    })
  }, [company, currentYear, recentYears, activePriceData.sharesOutstanding])

  const balanceHistory = useMemo(() => {
    if (!company) return []
    const assets = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:assets`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.totalAssets || 0,
      minRate: -0.08,
      maxRate: 0.28,
      floor: 0,
    })
    const liabilities = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:liabilities`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.totalLiabilities || 0,
      minRate: -0.1,
      maxRate: 0.32,
      floor: 0,
    })
    const debt = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:debt`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.totalDebt || 0,
      minRate: -0.2,
      maxRate: 0.35,
      floor: 0,
    })
    const cash = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:cash`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.cashOnHand || 0,
      minRate: -0.18,
      maxRate: 0.5,
      floor: 0,
    })
    const netAssets = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:netassets`,
      currentYear,
      yearsBack: recentYears,
      currentValue: activePriceData.netAssets || 0,
      minRate: -0.12,
      maxRate: 0.35,
      floor: 0,
    })

    return assets.map((row, idx) => ({
      year: row.year,
      assets: row.value,
      liabilities: liabilities[idx]?.value ?? 0,
      debt: debt[idx]?.value ?? 0,
      cash: cash[idx]?.value ?? 0,
      netAssets: netAssets[idx]?.value ?? 0,
    }))
  }, [company, currentYear, recentYears, activePriceData.totalAssets, activePriceData.totalLiabilities, activePriceData.totalDebt, activePriceData.cashOnHand, activePriceData.netAssets])

  const valuationHistory = useMemo(() => {
    if (!company) return []
    const revenue = Math.max(1, activePriceData.revenue || 1)
    const psNow = activePriceData.marketCap / revenue
    const peNow = activePriceData.peRatio ?? 0
    const pbNow = activePriceData.priceToBook ?? 0

    const pe = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:pe`,
      currentYear,
      yearsBack: recentYears,
      currentValue: peNow,
      minRate: -0.25,
      maxRate: 0.25,
      floor: 0,
    })
    const ps = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:ps`,
      currentYear,
      yearsBack: recentYears,
      currentValue: psNow,
      minRate: -0.25,
      maxRate: 0.25,
      floor: 0,
    })
    const pb = buildYearlySeries({
      seedKey: `${company.ticker.toUpperCase()}:pb`,
      currentYear,
      yearsBack: recentYears,
      currentValue: pbNow,
      minRate: -0.25,
      maxRate: 0.25,
      floor: 0,
    })

    return pe.map((row, idx) => ({
      year: row.year,
      pe: +(pe[idx]?.value ?? 0).toFixed(2),
      ps: +(ps[idx]?.value ?? 0).toFixed(2),
      pb: +(pb[idx]?.value ?? 0).toFixed(2),
    }))
  }, [company, currentYear, recentYears, activePriceData.marketCap, activePriceData.revenue, activePriceData.peRatio, activePriceData.priceToBook])

  const market30dHistory = useMemo(() => {
    if (!company) return { costToBorrow: [], failsToDeliver: [] }
    const randBorrow = mulberry32(seedFromString(`${company.ticker.toUpperCase()}:borrow30d`))
    const randFtd = mulberry32(seedFromString(`${company.ticker.toUpperCase()}:ftd30d`))

    const borrowBase = activePriceData.costToBorrow ?? 0
    const ftdBase = activePriceData.failsToDeliver ?? 0

    const costToBorrow = activePriceData.history30d.map((row, idx) => {
      const wobble = (randBorrow() - 0.5) * 1.6
      const v = Math.max(0, borrowBase + wobble + (idx - 15) * 0.02)
      return { date: row.date, value: +v.toFixed(2) }
    })
    const failsToDeliver = activePriceData.history30d.map((row, idx) => {
      const wobble = (randFtd() - 0.4) * (ftdBase * 0.18 + 15)
      const v = Math.max(0, ftdBase + wobble + (15 - idx) * 0.8)
      return { date: row.date, value: Math.round(v) }
    })

    return { costToBorrow, failsToDeliver }
  }, [company, activePriceData.costToBorrow, activePriceData.failsToDeliver, activePriceData.history30d])

  const ratios = useMemo(() => {
    const revenue = Math.max(1, activePriceData.revenue || 1)
    const ps = activePriceData.marketCap / revenue
    return {
      pe: activePriceData.peRatio ?? null,
      ps,
      pb: activePriceData.priceToBook ?? null,
    }
  }, [activePriceData.marketCap, activePriceData.peRatio, activePriceData.priceToBook, activePriceData.revenue])

  const externalLinks = useMemo(() => {
    const symRaw = company?.ticker ?? ticker
    const sym = encodeURIComponent(symRaw)
    const nameRaw = company?.name ?? ticker
    const name = encodeURIComponent(nameRaw)
    const market = (company?.market ?? '').toUpperCase()

    const isUs = ['NYSE', 'NASDAQ', 'AMEX'].includes(market)
    const isEs = market === 'BME'
    const isUk = market === 'LSE'
    const isDe = market === 'XETR'
    const isJp = market === 'TSE'
    const isHk = market === 'HKEX'

    return {
      // US
      secSearch: `https://www.sec.gov/edgar/search/#/q=${sym}`,
      sec10k: `https://www.sec.gov/edgar/search/#/q=${sym}&filter_forms=10-K`,
      sec10q: `https://www.sec.gov/edgar/search/#/q=${sym}&filter_forms=10-Q`,
      sec8k: `https://www.sec.gov/edgar/search/#/q=${sym}&filter_forms=8-K`,
      showSec: isUs,

      // Spain (CNMV)
      cnmvPortal: 'https://www.cnmv.es/',
      cnmvSearch: `https://www.cnmv.es/portal/consultas/ConsultaListado.aspx?tipo=5&texto=${name}`,
      showCnmv: isEs,

      // UK (FCA NSM)
      fcaNsm: 'https://data.fca.org.uk/#/nsm/nationalstoragemechanism',
      showFca: isUk,

      // Germany (Unternehmensregister)
      unternehmensregister: `https://www.unternehmensregister.de/ureg/search1.2.html?query=${name}`,
      showUnternehmensregister: isDe,

      // Japan (EDINET)
      edinet: 'https://disclosure2.edinet-fsa.go.jp/',
      showEdinet: isJp,

      // Hong Kong (HKEXnews)
      hkexnews: 'https://www1.hkexnews.hk/search/titlesearch.xhtml?lang=en',
      showHkex: isHk,

      // Fallback / complementary
      sustainability: `https://duckduckgo.com/?q=${name}%20sustainability%20report`,
      filingsSearch: `https://duckduckgo.com/?q=${sym}%20${name}%20annual%20report%20filings`,
      showFallback: !isUs && !isEs && !isUk && !isDe && !isJp && !isHk,
      symbolLabel: symRaw,
      companyLabel: nameRaw,
    }
  }, [company, ticker])

  const handleCopy = async () => {
    if (!company) return
    try {
      await navigator.clipboard.writeText(company.ticker)
    } catch (err) {
      console.warn('Unable to copy ticker', err)
    }
  }

  const openYahoo = () => {
    if (!company) return
    window.open(`https://finance.yahoo.com/quote/${company.ticker}`, '_blank', 'noreferrer')
  }

  const openMarketWatch = () => {
    if (!company) return
    window.open(`https://www.marketwatch.com/investing/stock/${company.ticker}`, '_blank', 'noreferrer')
  }

  return (
    <>
      <Header fixed>
        <Search />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {isError && (
          <Alert variant='destructive'>
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t('companies.detail.error')}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className='space-y-4'>
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-40 w-full' />
            <Skeleton className='h-32 w-full' />
          </div>
        )}

        {!isLoading && !company && !isError && (
          <Alert>
            <AlertTitle>{t('companies.detail.notFoundTitle')}</AlertTitle>
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>{t('companies.detail.notFoundCopy')}</span>
              <Button asChild variant='outline' size='sm'>
                <Link to='/companies'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  {t('companies.detail.backToList')}
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {company && (
          <>
            <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
              <div className='flex flex-col gap-5'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Button asChild variant='ghost' size='sm' className='px-2'>
                    <Link to='/companies'>
                      <ArrowLeft className='mr-2 h-4 w-4' />
                      {t('companies.detail.backToList')}
                    </Link>
                  </Button>
                  <Badge variant='secondary' className='border border-primary/20 bg-primary/10 text-primary'>
                    {company.market}
                  </Badge>
                  <Badge variant='secondary' className='border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'>
                    {(() => {
                      if (language !== 'es') return company.region
                      const r = company.region
                      if (r === 'North America') return 'Norteamérica'
                      if (r === 'Europe') return 'Europa'
                      if (r === 'Asia') return 'Asia'
                      if (r === 'LatAm') return 'LatAm'
                      if (r === 'Oceania') return 'Oceanía'
                      return r
                    })()}
                  </Badge>
                  {company.sector && (
                    <Badge variant='secondary' className='border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300'>
                      {(() => {
                        const s = company.sector
                        if (language !== 'es') return s
                        const map: Record<string, string> = {
                          Technology: t('companies.quickFilters.technology'),
                          Financials: t('companies.quickFilters.financial'),
                          Energy: t('companies.quickFilters.energy'),
                          'Retail & consumer': t('companies.quickFilters.retail'),
                          Automotive: t('companies.quickFilters.automotive'),
                        }
                        return map[s] ?? s
                      })()}
                    </Badge>
                  )}
                </div>

                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='flex items-start gap-4 min-w-0'>
                    <div className='h-14 w-14 overflow-hidden rounded-xl bg-muted/40 shrink-0'>
                      <img
                        src={logo.tickerUrl || logo.nameUrl || logo.placeholderUrl}
                        alt={company.name}
                        className='h-full w-full object-contain'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          const currentSrc = target.src
                          if (currentSrc.includes('/ticker/') && logo.nameUrl) {
                            target.src = logo.nameUrl
                          } else {
                            target.src = logo.placeholderUrl
                          }
                        }}
                      />
                    </div>

                    <div className='min-w-0 space-y-2'>
                      <div>
                        <h1 className='text-2xl font-semibold leading-tight truncate'>{company.name}</h1>
                        <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                          <span className='font-medium text-foreground'>{company.ticker}</span>
                          <span>•</span>
                          <span>{t('companies.detail.subtitle', { ticker: company.ticker })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center gap-2'>
                    <Button variant='secondary' size='sm' onClick={openYahoo}>
                      <ExternalLink className='mr-2 h-4 w-4' />
                      {t('companies.detail.openYahoo')}
                    </Button>
                    <Button variant='outline' size='sm' onClick={openMarketWatch}>
                      <ArrowUpRight className='mr-2 h-4 w-4' />
                      {t('companies.detail.openMarketwatch')}
                    </Button>
                    <Button variant='ghost' size='icon' onClick={handleCopy} aria-label={t('companies.actions.copyTicker')} title={t('companies.actions.copyTicker')}>
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                {meta && (
                  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                    <div className='rounded-xl border bg-card/60 p-4 shadow-sm'>
                      <p className='text-xs text-muted-foreground'>{t('companies.detail.overview.rank')}</p>
                      <p className='mt-1 text-xl font-semibold'>{rank ? `#${rank}` : '—'}</p>
                      <p className='text-xs text-muted-foreground'>{t('companies.detail.overview.rankHint')}</p>
                    </div>
                    <div className='rounded-xl border bg-card/60 p-4 shadow-sm'>
                      <p className='text-xs text-muted-foreground'>{t('companies.detail.overview.marketCap')}</p>
                      <p className='mt-1 text-xl font-semibold'>{meta.moneyCompact(activePriceData.marketCap)}</p>
                      <p className='text-xs text-muted-foreground'>{t('companies.detail.overview.marketCapHint')}</p>
                    </div>
                    <div className='rounded-xl border bg-card/60 p-4 shadow-sm'>
                      <p className='text-xs text-muted-foreground'>{t('companies.detail.overview.country')}</p>
                      <p className='mt-1 text-xl font-semibold'>{meta.country.label}</p>
                      <p className='text-xs text-muted-foreground'>{t('companies.detail.overview.countryHint', { market: company.market })}</p>
                    </div>
                    <div className='rounded-xl border bg-card/60 p-4 shadow-sm'>
                      <p className='text-xs text-muted-foreground'>{t('companies.detail.overview.sharePrice')}</p>
                      <p className='mt-1 text-xl font-semibold'>{meta.usd.format(activePriceData.currentPrice)}</p>
                      <p className='text-xs text-muted-foreground'>
                        <span className={cn(meta.positive(activePriceData.change1dPercent) ? 'text-emerald-600' : 'text-red-600')}>{activePriceData.change1dPercent}%</span>
                        <span className='text-muted-foreground'> {t('companies.detail.overview.change1d')}</span>
                        <span className='text-muted-foreground'> • </span>
                        <span className={cn(meta.positive(activePriceData.change1yPercent) ? 'text-emerald-600' : 'text-red-600')}>{activePriceData.change1yPercent}%</span>
                        <span className='text-muted-foreground'> {t('companies.detail.overview.change1y')}</span>
                      </p>
                    </div>
                  </div>
                )}

                {meta && (
                  <div className='space-y-2'>
                    <p className='text-sm leading-relaxed text-muted-foreground'>{meta.about}</p>
                  </div>
                )}
              </div>
            </div>

            <Tabs defaultValue='overview' className='w-full'>
              <div className='overflow-x-auto'>
                <TabsList className='min-w-max'>
                  <TabsTrigger value='overview'>{t('companies.detail.tabGroups.overview')}</TabsTrigger>
                  <TabsTrigger value='valuation'>{t('companies.detail.tabGroups.valuation')}</TabsTrigger>
                  <TabsTrigger value='financials'>{t('companies.detail.tabGroups.financials')}</TabsTrigger>
                  <TabsTrigger value='shareholder'>{t('companies.detail.tabGroups.shareholder')}</TabsTrigger>
                  <TabsTrigger value='balance'>{t('companies.detail.tabGroups.balance')}</TabsTrigger>
                  <TabsTrigger value='market'>{t('companies.detail.tabGroups.market')}</TabsTrigger>
                  <TabsTrigger value='reports'>{t('companies.detail.tabGroups.reports')}</TabsTrigger>
                  <TabsTrigger value='more'>{t('companies.detail.tabGroups.more')}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value='overview'>
                <div className='space-y-4'>
                  <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div>
                        <h3 className='text-lg font-semibold'>{t('companies.detail.tabGroups.overview')}</h3>
                      </div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='secondary' className='border border-primary/20 bg-primary/10 text-primary'>
                          {t('companies.detail.fields.sharePrice')}: {meta?.usd.format(activePriceData.currentPrice) ?? activePriceData.currentPrice}
                        </Badge>
                        <Badge variant='secondary' className='border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'>
                          {t('companies.detail.fields.marketCap')}: {meta?.moneyCompact(activePriceData.marketCap) ?? activePriceData.marketCap}
                        </Badge>
                      </div>
                    </div>
                    <Separator className='my-4' />

                    <div className='grid gap-4 lg:grid-cols-2'>
                      <div className='space-y-3'>
                        <div className='grid gap-3 sm:grid-cols-3'>
                          <div className='rounded-xl border bg-card/60 p-4'>
                            <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.sharePrice')}</p>
                            <p className='mt-1 text-lg font-semibold'>{meta?.usd.format(activePriceData.currentPrice) ?? activePriceData.currentPrice}</p>
                          </div>
                          <div className='rounded-xl border bg-card/60 p-4'>
                            <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.marketCap')}</p>
                            <p className='mt-1 text-lg font-semibold'>{meta?.moneyCompact(activePriceData.marketCap) ?? activePriceData.marketCap}</p>
                          </div>
                          <div className='rounded-xl border bg-card/60 p-4'>
                            <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.sharesOutstanding')}</p>
                            <p className='mt-1 text-lg font-semibold'>{meta?.compactPlain(activePriceData.sharesOutstanding) ?? activePriceData.sharesOutstanding}</p>
                          </div>
                        </div>

                        <div className='rounded-xl border bg-card/60 p-4'>
                          <LightweightMultiLineChart
                            framed={false}
                            heightClassName='h-80'
                            series={[
                              {
                                id: 'price',
                                label: t('companies.detail.fields.price'),
                                data: activePriceData.history30d.map((p) => ({ time: p.date, value: p.price })),
                                valueFormatter: (v) => (meta ? meta.usd.format(v) : String(v)),
                                priceScaleId: 'right',
                              },
                              {
                                id: 'marketCap',
                                label: t('companies.detail.fields.marketCap'),
                                data: activePriceData.history30d.map((p) => ({ time: p.date, value: p.price * activePriceData.sharesOutstanding })),
                                valueFormatter: (v) => (meta ? meta.moneyCompact(v) : String(v)),
                                priceScaleId: 'left',
                              },
                            ]}
                          />
                        </div>
                      </div>

                      <div className='rounded-xl border bg-card/60 overflow-hidden'>
                        <div className='max-h-[520px] overflow-auto'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className='w-[120px]'>{t('companies.detail.fields.date')}</TableHead>
                                <TableHead>{t('companies.detail.fields.price')}</TableHead>
                                <TableHead className='text-right'>{t('companies.detail.fields.marketCap')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {activePriceData.history30d.map((row) => (
                                <TableRow key={row.date}>
                                  <TableCell className='font-medium'>{row.date}</TableCell>
                                  <TableCell>{meta?.usd.format(row.price) ?? row.price}</TableCell>
                                  <TableCell className='text-right'>
                                    {meta?.moneyCompact(row.price * activePriceData.sharesOutstanding) ?? (row.price * activePriceData.sharesOutstanding)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </TabsContent>

              <TabsContent value='valuation'>
                <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold'>{t('companies.detail.facts.tabs.ratios')}</h3>
                  <p className='text-sm text-muted-foreground'>{t('companies.detail.sections.pb.subtitle')}</p>
                  <Separator className='my-4' />

                  <div className='grid gap-4 lg:grid-cols-2'>
                    <div className='space-y-3'>
                      <div className='grid gap-3 sm:grid-cols-3'>
                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.peRatio')}</p>
                          <p className='mt-1 text-lg font-semibold'>{ratios.pe != null ? ratios.pe.toFixed(2) : '—'}</p>
                        </div>
                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.psRatio')}</p>
                          <p className='mt-1 text-lg font-semibold'>{ratios.ps.toFixed(2)}</p>
                        </div>
                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.pbRatio')}</p>
                          <p className='mt-1 text-lg font-semibold'>{ratios.pb != null ? ratios.pb.toFixed(2) : '—'}</p>
                        </div>
                      </div>

                      <div className='rounded-xl border bg-card/60 p-4'>
                        <div className='mt-1'>
                          <LightweightMultiLineChart
                            framed={false}
                            heightClassName='h-72'
                            timeFormatter={(time) => (typeof time === 'string' ? time.slice(0, 4) : String(time ?? ''))}
                            series={[
                              {
                                id: 'pe',
                                label: t('companies.detail.fields.peRatio'),
                                data: valuationHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.pe })),
                                valueFormatter: (v) => v.toFixed(2),
                              },
                              {
                                id: 'ps',
                                label: t('companies.detail.fields.psRatio'),
                                data: valuationHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.ps })),
                                valueFormatter: (v) => v.toFixed(2),
                              },
                              {
                                id: 'pb',
                                label: t('companies.detail.fields.pbRatio'),
                                data: valuationHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.pb })),
                                valueFormatter: (v) => v.toFixed(2),
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='rounded-xl border bg-card/60 overflow-hidden'>
                      <div className='max-h-[520px] overflow-auto'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className='w-[90px]'>{t('companies.detail.fields.year')}</TableHead>
                              <TableHead>{t('companies.detail.fields.peRatio')}</TableHead>
                              <TableHead>{t('companies.detail.fields.psRatio')}</TableHead>
                              <TableHead>{t('companies.detail.fields.pbRatio')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {valuationHistory.map((row) => (
                              <TableRow key={row.year}>
                                <TableCell className='font-medium'>{row.year}</TableCell>
                                <TableCell>{row.pe || '—'}</TableCell>
                                <TableCell>{row.ps || '—'}</TableCell>
                                <TableCell>{row.pb || '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='financials'>
                <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold'>{t('companies.detail.tabGroups.financials')}</h3>
                  <p className='text-sm text-muted-foreground'>{t('companies.detail.facts.subtitle')}</p>
                  <Separator className='my-4' />

                  <div className='grid gap-4 lg:grid-cols-2'>
                    <div className='space-y-3'>
                      <div className='grid gap-3 sm:grid-cols-2'>
                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.facts.revenue')}</p>
                          <p className='mt-1 text-lg font-semibold'>{meta?.moneyCompact(activePriceData.revenue || 0) ?? (activePriceData.revenue || 0)}</p>
                        </div>

                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.facts.earnings')}</p>
                          <p className='mt-1 text-lg font-semibold'>{meta?.moneyCompact(activePriceData.earnings || 0) ?? (activePriceData.earnings || 0)}</p>
                        </div>

                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.eps')}</p>
                          <p className='mt-1 text-lg font-semibold'>{activePriceData.eps != null ? activePriceData.eps.toFixed(4) : '—'}</p>
                        </div>

                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.operatingMargin')}</p>
                          <p className='mt-1 text-lg font-semibold'>{(activePriceData.operatingMargin ?? 0).toFixed(2)}%</p>
                        </div>
                      </div>

                      <div className='rounded-xl border bg-card/60 p-4'>
                        <div className='mt-1'>
                          <LightweightMultiLineChart
                            framed={false}
                            heightClassName='h-72'
                            timeFormatter={(time) => (typeof time === 'string' ? time.slice(0, 4) : String(time ?? ''))}
                            series={[
                              {
                                id: 'revenue',
                                label: t('companies.detail.facts.revenue'),
                                data: revenueHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.value })),
                                valueFormatter: (v) => (meta ? meta.moneyCompact(v) : String(v)),
                                priceScaleId: 'right',
                              },
                              {
                                id: 'earnings',
                                label: t('companies.detail.facts.earnings'),
                                data: earningsHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.value })),
                                valueFormatter: (v) => (meta ? meta.moneyCompact(v) : String(v)),
                                priceScaleId: 'right',
                              },
                              {
                                id: 'eps',
                                label: t('companies.detail.fields.eps'),
                                data: epsHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.value })),
                                valueFormatter: (v) => v.toFixed(4),
                                priceScaleId: 'right',
                                dashed: true,
                              },
                              {
                                id: 'opMargin',
                                label: t('companies.detail.fields.operatingMargin'),
                                data: operatingMarginHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.value })),
                                valueFormatter: (v) => `${v.toFixed(2)}%`,
                                priceScaleId: 'left',
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='rounded-xl border bg-card/60 overflow-hidden'>
                      <div className='max-h-[740px] overflow-auto'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className='w-[90px]'>{t('companies.detail.fields.year')}</TableHead>
                              <TableHead>{t('companies.detail.facts.revenue')}</TableHead>
                              <TableHead>{t('companies.detail.facts.earnings')}</TableHead>
                              <TableHead>{t('companies.detail.fields.eps')}</TableHead>
                              <TableHead className='text-right'>{t('companies.detail.fields.operatingMargin')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {revenueHistory.map((r, idx) => (
                              <TableRow key={r.year}>
                                <TableCell className='font-medium'>{r.year}</TableCell>
                                <TableCell>{meta?.moneyCompact(r.value) ?? r.value}</TableCell>
                                <TableCell>{meta?.moneyCompact(earningsHistory[idx]?.value ?? 0) ?? (earningsHistory[idx]?.value ?? 0)}</TableCell>
                                <TableCell>{epsHistory[idx]?.value != null ? epsHistory[idx]!.value.toFixed(4) : '—'}</TableCell>
                                <TableCell className='text-right'>{(operatingMarginHistory[idx]?.value ?? 0).toFixed(2)}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='shareholder'>
                <div className='space-y-4'>
                  <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <h3 className='text-lg font-semibold'>{t('companies.detail.tabs.dividends')}</h3>
                      <Badge variant='secondary' className='border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'>
                        {(activePriceData.dividendYield ?? 0).toFixed(2)}% {t('companies.detail.tabs.dividendYield')}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>{t('companies.detail.sections.dividends.subtitle')}</p>
                    <Separator className='my-4' />

                    <div className='grid gap-4 lg:grid-cols-2'>
                      <div className='space-y-3'>
                        <LightweightLineChart
                          data={(activePriceData.dividends ?? []).map((d) => ({ time: d.date, value: d.amount }))}
                          heightClassName='h-56'
                          valueFormatter={(v) => (meta ? meta.usd.format(v) : String(v))}
                        />
                        <div className='flex items-center justify-between gap-3'>
                          <div />
                          <div className='text-right'>
                            <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.amount')}</p>
                            <p className='text-lg font-semibold'>{meta?.usd.format((activePriceData.dividends?.[0]?.amount ?? 0)) ?? (activePriceData.dividends?.[0]?.amount ?? 0)}</p>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-xl border bg-card/60 overflow-hidden'>
                        <div className='max-h-80 overflow-auto'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className='w-[120px]'>{t('companies.detail.fields.date')}</TableHead>
                                <TableHead>{t('companies.detail.fields.amount')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {activePriceData.dividends?.map((d) => (
                                <TableRow key={d.date}>
                                  <TableCell className='font-medium'>{d.date}</TableCell>
                                  <TableCell>{meta?.usd.format(d.amount) ?? d.amount}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold'>{t('companies.detail.tabs.sharesOutstanding')}</h3>
                    <p className='text-sm text-muted-foreground'>{t('companies.detail.sections.shares.subtitle')}</p>
                    <Separator className='my-4' />

                    <div className='grid gap-4 lg:grid-cols-2'>
                      <div className='space-y-3'>
                        <LightweightLineChart
                          data={sharesHistory
                            .slice()
                            .reverse()
                            .map((r) => ({ time: `${r.year}-01-01`, value: r.value }))}
                          heightClassName='h-56'
                          valueFormatter={(v) => (meta ? meta.compactPlain(v) : String(v))}
                          timeFormatter={(time) => (typeof time === 'string' ? time.slice(0, 4) : String(time ?? ''))}
                        />
                        <div className='flex items-center justify-between gap-3'>
                          <div />
                          <div className='text-right'>
                            <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.sharesOutstanding')}</p>
                            <p className='text-lg font-semibold'>{meta?.compactPlain(activePriceData.sharesOutstanding) ?? activePriceData.sharesOutstanding}</p>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-xl border bg-card/60 overflow-hidden'>
                        <div className='max-h-80 overflow-auto'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className='w-[90px]'>{t('companies.detail.fields.year')}</TableHead>
                                <TableHead>{t('companies.detail.fields.sharesOutstanding')}</TableHead>
                                <TableHead className='text-right'>{t('companies.detail.fields.change')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sharesHistory.map((row) => (
                                <TableRow key={row.year}>
                                  <TableCell className='font-medium'>{row.year}</TableCell>
                                  <TableCell>{meta?.compactPlain(row.value) ?? row.value}</TableCell>
                                  <TableCell className='text-right'>
                                    {row.changePct == null ? (
                                      <span className='text-muted-foreground'>—</span>
                                    ) : (
                                      <span className={cn(row.changePct >= 0 ? 'text-emerald-600' : 'text-red-600')}>{row.changePct}%</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    <Separator className='my-4' />
                    <h4 className='text-sm font-semibold'>{t('companies.detail.tabs.stockSplits')}</h4>
                    {(activePriceData.stockSplits?.length ?? 0) === 0 ? (
                      <p className='mt-2 text-sm text-muted-foreground'>{t('companies.detail.sections.splits.empty')}</p>
                    ) : (
                      <div className='mt-2 rounded-xl border bg-card/60 overflow-hidden'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className='w-[120px]'>{t('companies.detail.fields.date')}</TableHead>
                              <TableHead>{t('companies.detail.fields.ratio')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activePriceData.stockSplits?.map((s) => (
                              <TableRow key={`${s.date}-${s.ratio}`}>
                                <TableCell className='font-medium'>{s.date}</TableCell>
                                <TableCell>{s.ratio}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='balance'>
                <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold'>{t('companies.detail.tabGroups.balance')}</h3>
                  <p className='text-sm text-muted-foreground'>{t('companies.detail.sections.assets.subtitle')}</p>
                  <Separator className='my-4' />

                  <div className='grid gap-4 lg:grid-cols-2'>
                    <div className='space-y-3'>
                      <div className='grid gap-3 sm:grid-cols-2'>
                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.tabs.totalAssets')}</p>
                          <p className='mt-1 text-lg font-semibold'>{meta?.moneyCompact(activePriceData.totalAssets || 0) ?? (activePriceData.totalAssets || 0)}</p>
                        </div>

                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.tabs.totalLiabilities')}</p>
                          <p className='mt-1 text-lg font-semibold'>{meta?.moneyCompact(activePriceData.totalLiabilities || 0) ?? (activePriceData.totalLiabilities || 0)}</p>
                        </div>

                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.tabs.totalDebt')}</p>
                          <p className='mt-1 text-lg font-semibold'>{meta?.moneyCompact(activePriceData.totalDebt || 0) ?? (activePriceData.totalDebt || 0)}</p>
                        </div>

                        <div className='rounded-xl border bg-card/60 p-4'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.tabs.cashOnHand')}</p>
                          <p className='mt-1 text-lg font-semibold'>{meta?.moneyCompact(activePriceData.cashOnHand || 0) ?? (activePriceData.cashOnHand || 0)}</p>
                        </div>

                        <div className='rounded-xl border bg-card/60 p-4 sm:col-span-2'>
                          <p className='text-xs text-muted-foreground'>{t('companies.detail.tabs.netAssets')}</p>
                          <p className='mt-1 text-lg font-semibold'>{meta?.moneyCompact(activePriceData.netAssets || 0) ?? (activePriceData.netAssets || 0)}</p>
                        </div>
                      </div>

                      <div className='rounded-xl border bg-card/60 p-4'>
                        <div className='mt-1'>
                          <LightweightMultiLineChart
                            framed={false}
                            heightClassName='h-72'
                            timeFormatter={(time) => (typeof time === 'string' ? time.slice(0, 4) : String(time ?? ''))}
                            series={[
                              {
                                id: 'assets',
                                label: t('companies.detail.fields.totalAssets'),
                                data: balanceHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.assets })),
                                valueFormatter: (v) => (meta ? meta.moneyCompact(v) : String(v)),
                              },
                              {
                                id: 'liabilities',
                                label: t('companies.detail.fields.totalLiabilities'),
                                data: balanceHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.liabilities })),
                                valueFormatter: (v) => (meta ? meta.moneyCompact(v) : String(v)),
                              },
                              {
                                id: 'debt',
                                label: t('companies.detail.fields.totalDebt'),
                                data: balanceHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.debt })),
                                valueFormatter: (v) => (meta ? meta.moneyCompact(v) : String(v)),
                                dashed: true,
                              },
                              {
                                id: 'cash',
                                label: t('companies.detail.fields.cashOnHand'),
                                data: balanceHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.cash })),
                                valueFormatter: (v) => (meta ? meta.moneyCompact(v) : String(v)),
                              },
                              {
                                id: 'netAssets',
                                label: t('companies.detail.fields.netAssets'),
                                data: balanceHistory.slice().reverse().map((r) => ({ time: `${r.year}-01-01`, value: r.netAssets })),
                                valueFormatter: (v) => (meta ? meta.moneyCompact(v) : String(v)),
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='rounded-xl border bg-card/60 overflow-hidden'>
                      <div className='max-h-[740px] overflow-auto'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className='w-[90px]'>{t('companies.detail.fields.year')}</TableHead>
                              <TableHead>{t('companies.detail.fields.totalAssets')}</TableHead>
                              <TableHead>{t('companies.detail.fields.totalLiabilities')}</TableHead>
                              <TableHead>{t('companies.detail.fields.totalDebt')}</TableHead>
                              <TableHead>{t('companies.detail.fields.cashOnHand')}</TableHead>
                              <TableHead>{t('companies.detail.fields.netAssets')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {balanceHistory.map((row) => (
                              <TableRow key={row.year}>
                                <TableCell className='font-medium'>{row.year}</TableCell>
                                <TableCell>{meta?.moneyCompact(row.assets) ?? row.assets}</TableCell>
                                <TableCell>{meta?.moneyCompact(row.liabilities) ?? row.liabilities}</TableCell>
                                <TableCell>{meta?.moneyCompact(row.debt) ?? row.debt}</TableCell>
                                <TableCell>{meta?.moneyCompact(row.cash) ?? row.cash}</TableCell>
                                <TableCell>{meta?.moneyCompact(row.netAssets) ?? row.netAssets}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='market'>
                <div className='space-y-4'>
                  <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold'>{t('companies.detail.tabs.costToBorrow')}</h3>
                    <p className='text-sm text-muted-foreground'>{t('companies.detail.sections.borrow.subtitle')}</p>
                    <Separator className='my-4' />

                    <div className='grid gap-4 lg:grid-cols-2'>
                      <div className='space-y-3'>
                        <LightweightLineChart
                          data={market30dHistory.costToBorrow.map((r) => ({ time: r.date, value: r.value }))}
                          heightClassName='h-56'
                          valueFormatter={(v) => `${v.toFixed(2)}%`}
                        />
                        <div className='flex items-center justify-between gap-3'>
                          <div />
                          <div className='text-right'>
                            <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.costToBorrow')}</p>
                            <p className='text-lg font-semibold'>{(activePriceData.costToBorrow ?? 0).toFixed(2)}%</p>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-xl border bg-card/60 overflow-hidden'>
                        <div className='max-h-80 overflow-auto'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className='w-[120px]'>{t('companies.detail.fields.date')}</TableHead>
                                <TableHead className='text-right'>{t('companies.detail.fields.costToBorrow')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {market30dHistory.costToBorrow.map((row) => (
                                <TableRow key={row.date}>
                                  <TableCell className='font-medium'>{row.date}</TableCell>
                                  <TableCell className='text-right'>{row.value.toFixed(2)}%</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                    <h3 className='text-lg font-semibold'>{t('companies.detail.tabs.failsToDeliver')}</h3>
                    <p className='text-sm text-muted-foreground'>{t('companies.detail.sections.ftd.subtitle')}</p>
                    <Separator className='my-4' />

                    <div className='grid gap-4 lg:grid-cols-2'>
                      <div className='space-y-3'>
                        <LightweightLineChart
                          data={market30dHistory.failsToDeliver.map((r) => ({ time: r.date, value: r.value }))}
                          heightClassName='h-56'
                          valueFormatter={(v) => (meta ? meta.compactPlain(v) : String(v))}
                        />
                        <div className='flex items-center justify-between gap-3'>
                          <div />
                          <div className='text-right'>
                            <p className='text-xs text-muted-foreground'>{t('companies.detail.fields.failsToDeliver')}</p>
                            <p className='text-lg font-semibold'>{meta?.compactPlain(activePriceData.failsToDeliver || 0) ?? (activePriceData.failsToDeliver || 0)}</p>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-xl border bg-card/60 overflow-hidden'>
                        <div className='max-h-80 overflow-auto'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className='w-[120px]'>{t('companies.detail.fields.date')}</TableHead>
                                <TableHead className='text-right'>{t('companies.detail.fields.failsToDeliver')}</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {market30dHistory.failsToDeliver.map((row) => (
                                <TableRow key={row.date}>
                                  <TableCell className='font-medium'>{row.date}</TableCell>
                                  <TableCell className='text-right'>{meta?.compactPlain(row.value) ?? row.value}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='reports'>
                <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold'>{t('companies.detail.tabGroups.reports')}</h3>
                  <p className='text-sm text-muted-foreground'>{t('companies.detail.sections.annual.subtitle')}</p>
                  <Separator className='my-4' />
                  <div className='flex flex-wrap gap-2'>
                    {externalLinks.showSec && (
                      <>
                        <Button asChild variant='outline' size='sm'>
                          <a href={externalLinks.secSearch} target='_blank' rel='noreferrer'>
                            <ExternalLink className='mr-2 h-4 w-4' />
                            {t('companies.detail.sections.annual.openSec')}
                          </a>
                        </Button>
                        <Button asChild variant='outline' size='sm'>
                          <a href={externalLinks.sec10k} target='_blank' rel='noreferrer'>
                            <ExternalLink className='mr-2 h-4 w-4' />
                            {t('companies.detail.sections.annual10k.openSec')}
                          </a>
                        </Button>
                        <Button asChild variant='outline' size='sm'>
                          <a href={externalLinks.sec10q} target='_blank' rel='noreferrer'>
                            <ExternalLink className='mr-2 h-4 w-4' />
                            {t('companies.detail.sections.annual10q.openSec')}
                          </a>
                        </Button>
                        <Button asChild variant='outline' size='sm'>
                          <a href={externalLinks.sec8k} target='_blank' rel='noreferrer'>
                            <ExternalLink className='mr-2 h-4 w-4' />
                            {t('companies.detail.sections.annual8k.openSec')}
                          </a>
                        </Button>
                      </>
                    )}

                    {externalLinks.showCnmv && (
                      <>
                        <Button asChild variant='outline' size='sm'>
                          <a href={externalLinks.cnmvPortal} target='_blank' rel='noreferrer'>
                            <ExternalLink className='mr-2 h-4 w-4' />
                            {t('companies.detail.sections.cnmv.portal')}
                          </a>
                        </Button>
                        <Button asChild variant='outline' size='sm'>
                          <a href={externalLinks.cnmvSearch} target='_blank' rel='noreferrer'>
                            <ExternalLink className='mr-2 h-4 w-4' />
                            {t('companies.detail.sections.cnmv.search')}
                          </a>
                        </Button>
                      </>
                    )}

                    {externalLinks.showFca && (
                      <Button asChild variant='outline' size='sm'>
                        <a href={externalLinks.fcaNsm} target='_blank' rel='noreferrer'>
                          <ExternalLink className='mr-2 h-4 w-4' />
                          {t('companies.detail.sections.fca.portal')}
                        </a>
                      </Button>
                    )}

                    {externalLinks.showUnternehmensregister && (
                      <Button asChild variant='outline' size='sm'>
                        <a href={externalLinks.unternehmensregister} target='_blank' rel='noreferrer'>
                          <ExternalLink className='mr-2 h-4 w-4' />
                          {t('companies.detail.sections.unternehmensregister.search')}
                        </a>
                      </Button>
                    )}

                    {externalLinks.showEdinet && (
                      <Button asChild variant='outline' size='sm'>
                        <a href={externalLinks.edinet} target='_blank' rel='noreferrer'>
                          <ExternalLink className='mr-2 h-4 w-4' />
                          {t('companies.detail.sections.edinet.portal')}
                        </a>
                      </Button>
                    )}

                    {externalLinks.showHkex && (
                      <Button asChild variant='outline' size='sm'>
                        <a href={externalLinks.hkexnews} target='_blank' rel='noreferrer'>
                          <ExternalLink className='mr-2 h-4 w-4' />
                          {t('companies.detail.sections.hkex.portal')}
                        </a>
                      </Button>
                    )}

                    {externalLinks.showFallback && (
                      <Button asChild variant='outline' size='sm'>
                        <a href={externalLinks.filingsSearch} target='_blank' rel='noreferrer'>
                          <ExternalLink className='mr-2 h-4 w-4' />
                          {t('companies.detail.sections.filings.search')}
                        </a>
                      </Button>
                    )}

                    <Button asChild variant='outline' size='sm'>
                      <a href={externalLinks.sustainability} target='_blank' rel='noreferrer'>
                        <ExternalLink className='mr-2 h-4 w-4' />
                        {t('companies.detail.sections.sustainability.search')}
                      </a>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='more'>
                <div className='rounded-2xl border bg-card/60 p-4 sm:p-6 shadow-sm'>
                  <h3 className='text-lg font-semibold'>{t('companies.detail.sections.more.title')}</h3>
                  <p className='text-sm text-muted-foreground'>{t('companies.detail.sections.more.subtitle')}</p>
                  <Separator className='my-4' />
                  <div className='flex flex-wrap gap-2'>
                    <Button variant='secondary' size='sm' onClick={openYahoo}>
                      <ExternalLink className='mr-2 h-4 w-4' />
                      {t('companies.detail.openYahoo')}
                    </Button>
                    <Button variant='outline' size='sm' onClick={openMarketWatch}>
                      <ArrowUpRight className='mr-2 h-4 w-4' />
                      {t('companies.detail.openMarketwatch')}
                    </Button>
                    <Button variant='outline' size='sm' onClick={handleCopy}>
                      <Copy className='mr-2 h-4 w-4' />
                      {t('companies.actions.copyTicker')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </Main>
    </>
  )
}
