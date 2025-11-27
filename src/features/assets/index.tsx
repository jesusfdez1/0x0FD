import { useNavigate, useSearch } from '@tanstack/react-router'
import { useLanguage } from '@/context/language-provider'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { AssetsTable } from './components/assets-table'
import { AssetsOverview } from './components/assets-overview'
import { AssetFormDialog } from './components/asset-form/asset-form-dialog'
import { useAssets } from './hooks/use-assets'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function Assets() {
  const { t } = useLanguage()
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const { data: assets = [], isLoading, isError, error } = useAssets()

  return (
    <>
      <Header fixed>
        <Search />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t('assets.title')}</h2>
            <p className='text-muted-foreground'>{t('assets.description')}</p>
          </div>
          {!isLoading && assets.length > 0 && (
            <AssetFormDialog />
          )}
        </div>

        {isError && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Error al cargar los activos. Por favor, intenta de nuevo más tarde.'}
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
            {assets.length > 0 && <AssetsOverview assets={assets} />}
            <AssetsTable data={assets} search={search} navigate={navigate} />
          </>
        )}
      </Main>
    </>
  )
}

