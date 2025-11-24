import { useNavigate, useSearch } from '@tanstack/react-router'
import { useLanguage } from '@/context/language-provider'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { PortfoliosTable } from './components/portfolios-table'

export function Portfolios() {
  const { t } = useLanguage()
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()

  return (
    <>
      <Header fixed>
        <Search />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t('portfolios.title')}</h2>
            <p className='text-muted-foreground'>{t('portfolios.description')}</p>
          </div>
        </div>
        <PortfoliosTable />
      </Main>
    </>
  )
}
