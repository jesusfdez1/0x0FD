import { useMemo, type ComponentType } from 'react'
import { Link } from '@tanstack/react-router'
import { useLanguage } from '@/context/language-provider'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useCompanies } from './hooks/use-companies'
import { ArrowLeft, ArrowUpRight, Copy, ExternalLink, LineChart, MapPin, ShieldCheck, Sparkles, Target } from 'lucide-react'

function InsightCard({ title, value, hint, icon: Icon }: { title: string; value: string; hint: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className='rounded-xl border bg-card/60 p-4 shadow-sm'>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-sm font-semibold'>{title}</p>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </div>
      <p className='mt-2 text-xl font-semibold'>{value}</p>
      <p className='text-xs text-muted-foreground'>{hint}</p>
    </div>
  )
}

export function CompanyDetail({ ticker }: { ticker: string }) {
  const { t } = useLanguage()
  const { data = [], isLoading, isError, error } = useCompanies()

  const company = useMemo(
    () => data.find((c) => c.ticker.toLowerCase() === ticker.toLowerCase()),
    [data, ticker]
  )

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
                <Link to='/companies/'>
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
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div className='space-y-3'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Button asChild variant='ghost' size='sm' className='px-2'>
                      <Link to='/companies/'>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        {t('companies.detail.backToList')}
                      </Link>
                    </Button>
                    <Badge variant='secondary' className='bg-muted text-foreground'>
                      {company.market}
                    </Badge>
                    <Badge variant='outline'>{company.region}</Badge>
                    {company.sector && <Badge variant='outline'>{company.sector}</Badge>}
                  </div>
                  <div>
                    <p className='text-[11px] uppercase tracking-[0.12em] text-muted-foreground'>{t('companies.detail.kicker')}</p>
                    <h1 className='text-2xl font-semibold leading-tight'>{company.name}</h1>
                    <p className='text-muted-foreground'>{t('companies.detail.subtitle', { ticker: company.ticker })}</p>
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
            </div>

            <div className='grid gap-4 lg:grid-cols-[1.4fr,1fr]'>
              <div className='space-y-4'>
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  <InsightCard
                    title={t('companies.detail.cards.region.title')}
                    value={company.region}
                    hint={t('companies.detail.cards.region.hint')}
                    icon={MapPin}
                  />
                  <InsightCard
                    title={t('companies.detail.cards.market.title')}
                    value={company.market}
                    hint={t('companies.detail.cards.market.hint')}
                    icon={LineChart}
                  />
                  <InsightCard
                    title={t('companies.detail.cards.sector.title')}
                    value={company.sector || t('companies.detail.cards.sector.fallback')}
                    hint={t('companies.detail.cards.sector.hint')}
                    icon={Target}
                  />
                </div>

                <div className='rounded-2xl border bg-card p-4 sm:p-6 shadow-sm'>
                  <div className='flex items-center justify-between gap-2'>
                    <div>
                      <p className='text-[11px] uppercase tracking-[0.12em] text-muted-foreground'>{t('companies.detail.snapshot.kicker')}</p>
                      <h3 className='text-lg font-semibold'>{t('companies.detail.snapshot.title')}</h3>
                      <p className='text-sm text-muted-foreground'>{t('companies.detail.snapshot.subtitle')}</p>
                    </div>
                    <Badge variant='outline' className='gap-2'>
                      <ShieldCheck className='h-4 w-4' />
                      {t('companies.detail.snapshot.badge')}
                    </Badge>
                  </div>

                  <div className='mt-4 grid gap-3 md:grid-cols-2'>
                    <div className='rounded-xl border border-dashed bg-muted/40 p-4'>
                      <div className='flex items-center gap-2'>
                        <Sparkles className='h-4 w-4 text-muted-foreground' />
                        <p className='text-sm font-medium'>{t('companies.detail.snapshot.uxTitle')}</p>
                      </div>
                      <p className='mt-2 text-sm text-muted-foreground'>{t('companies.detail.snapshot.uxCopy')}</p>
                    </div>
                    <div className='rounded-xl border border-dashed bg-muted/40 p-4'>
                      <div className='flex items-center gap-2'>
                        <ExternalLink className='h-4 w-4 text-muted-foreground' />
                        <p className='text-sm font-medium'>{t('companies.detail.snapshot.dataTitle')}</p>
                      </div>
                      <p className='mt-2 text-sm text-muted-foreground'>{t('companies.detail.snapshot.dataCopy')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='rounded-2xl border bg-card p-4 sm:p-6 shadow-sm'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-[11px] uppercase tracking-[0.12em] text-muted-foreground'>{t('companies.detail.actions.kicker')}</p>
                      <h3 className='text-lg font-semibold'>{t('companies.detail.actions.title')}</h3>
                    </div>
                    <Badge variant='secondary' className='bg-muted text-foreground'>
                      {t('companies.detail.actions.badge')}
                    </Badge>
                  </div>
                  <Separator className='my-4' />
                  <div className='space-y-3'>
                    <Button variant='default' className='w-full justify-between'>
                      {t('companies.detail.actions.addToPortfolio')}
                      <ArrowUpRight className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' className='w-full justify-between'>
                      {t('companies.detail.actions.startWatch')}
                      <Sparkles className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' className='w-full justify-between'>
                      {t('companies.detail.actions.createNote')}
                      <ArrowUpRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='rounded-2xl border bg-card p-4 sm:p-6 shadow-sm'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-[11px] uppercase tracking-[0.12em] text-muted-foreground'>{t('companies.detail.research.kicker')}</p>
                      <h3 className='text-lg font-semibold'>{t('companies.detail.research.title')}</h3>
                    </div>
                    <Badge variant='outline'>{t('companies.detail.research.badge')}</Badge>
                  </div>
                  <Separator className='my-4' />
                  <div className='space-y-3 text-sm text-muted-foreground'>
                    <div className='flex items-center justify-between'>
                      <span>{t('companies.detail.research.profile')}</span>
                      <Button variant='link' size='sm' className='px-0' onClick={openYahoo}>
                        {t('companies.detail.openYahoo')}
                      </Button>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>{t('companies.detail.research.news')}</span>
                      <Button variant='link' size='sm' className='px-0' onClick={openMarketWatch}>
                        {t('companies.detail.research.read')}
                      </Button>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>{t('companies.detail.research.ticker')}</span>
                      <Button variant='link' size='sm' className='px-0' onClick={handleCopy}>
                        {t('companies.actions.copyTicker')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
