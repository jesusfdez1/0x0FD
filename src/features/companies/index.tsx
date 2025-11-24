import { useNavigate, useSearch } from '@tanstack/react-router'
import { useLanguage } from '@/context/language-provider'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { CompaniesTable } from './components/companies-table'
import { useCompanies } from './hooks/use-companies'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function Companies() {
  const { t } = useLanguage()
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const { data: companies = [], isLoading, isError, error } = useCompanies()

  return (
    <>
      <Header fixed>
        <Search />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t('companies.title')}</h2>
            <p className='text-muted-foreground'>{t('companies.description')}</p>
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
            <CompaniesTable data={companies} search={search} navigate={navigate} />
            {companies.length > 0 && (
              <div>
                <h3 className='text-lg font-semibold'>{t('companies.byRegion')}</h3>
                <div className='mt-2 space-y-6'>
                  {Object.entries(
                    companies.reduce((acc, c) => {
                      acc[c.region] = acc[c.region] || {}
                      ;(acc[c.region] as any)[c.market] = (acc[c.region] as any)[c.market] || []
                      ;(acc[c.region] as any)[c.market].push(c)
                      return acc
                    }, {} as Record<string, Record<string, typeof companies>>)
                  ).map(([region, markets]) => (
                    <div key={region}>
                      <h4 className='mt-4 text-md font-medium'>{region}</h4>
                      {Object.entries(markets).map(([market, list]) => (
                        <div key={market} className='mt-2'>
                          <h5 className='font-semibold'>{market}</h5>
                          <ul className='mt-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {list.slice(0, 50).map((company) => {
                              // Limpiar el ticker para quitar sufijos de exchange (ej: SAN.MC -> SAN, 7203.T -> 7203)
                              const cleanTicker = company.ticker.split('.')[0]
                              const token = import.meta.env.VITE_LOGO_DEV_TOKEN || ''
                              
                              // Primero intentar con ticker usando fallback=404
                              const tickerUrl = token
                                ? `https://img.logo.dev/ticker/${encodeURIComponent(cleanTicker)}?token=${token}&format=webp&retina=true&size=64&fallback=404`
                                : null
                              
                              // Si hay token, intentar con nombre como fallback
                              const nameUrl = token
                                ? `https://img.logo.dev/name/${encodeURIComponent(company.name)}?token=${token}&format=webp&retina=true&size=64`
                                : null
                              
                              // Placeholder como último recurso
                              const placeholderUrl = `https://via.placeholder.com/64?text=${encodeURIComponent(company.name.charAt(0))}`
                              
                              const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                const target = e.target as HTMLImageElement
                                const currentSrc = target.src
                                
                                // Si falló el ticker, intentar con el nombre
                                if (currentSrc.includes('/ticker/') && nameUrl) {
                                  target.src = nameUrl
                                } 
                                // Si falló el nombre o no hay token, usar placeholder
                                else {
                                  target.src = placeholderUrl
                                }
                              }
                              
                              return (
                                <li key={company.id} className='rounded-lg border p-4 hover:shadow-md flex items-center gap-3'>
                                  <div className='h-10 w-10 overflow-hidden rounded bg-muted/40'>
                                    <img 
                                      src={tickerUrl || nameUrl || placeholderUrl} 
                                      alt={company.name} 
                                      className='h-full w-full object-contain'
                                      onError={handleImageError}
                                    />
                                  </div>
                                  <div>
                                    <div className='font-semibold'>{company.name}</div>
                                    <div className='text-muted-foreground text-sm'>{company.ticker}</div>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                          {list.length > 50 && (
                            <p className='text-sm text-muted-foreground mt-2'>
                              Y {list.length - 50} empresas más...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Main>
    </>
  )
}
