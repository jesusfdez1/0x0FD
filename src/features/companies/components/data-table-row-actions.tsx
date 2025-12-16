import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Company } from '../data/schema'
import { Copy, ExternalLink, Eye, Info, Plus, Sparkles } from 'lucide-react'

type DataTableRowActionsProps = {
  row: Row<Company>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useLanguage()
  const company = row.original

  const openInYahoo = () => {
    window.open(`https://finance.yahoo.com/quote/${company.ticker}`, '_blank', 'noreferrer')
  }

  const copyTicker = async () => {
    try {
      await navigator.clipboard.writeText(company.ticker)
    } catch (error) {
      console.warn('Unable to copy ticker to clipboard', error)
    }
  }

  return (
    <div className='flex items-center gap-1'>
      <Button
        asChild
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        aria-label={t('companies.actions.viewDetails')}
        title={t('companies.actions.viewDetails')}
      >
        <Link to='/companies/$ticker' params={{ ticker: company.ticker }}>
          <Info className='h-4 w-4' />
          <span className='sr-only'>{t('companies.actions.viewDetails')}</span>
        </Link>
      </Button>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
            aria-label={t('common.openMenu')}
            title={t('common.openMenu')}
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>{t('common.openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem disabled className='flex flex-col items-start gap-1 py-2'>
            <span className='text-xs uppercase text-muted-foreground'>{t('companies.actions.context')}</span>
            <span className='text-sm font-medium'>{company.region} • {company.market}</span>
            {company.sector && <span className='text-xs text-muted-foreground'>{company.sector}</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openInYahoo}>
            <div className='flex items-center gap-3'>
              <Eye size={16} />
              <span>{t('companies.actions.viewProfile')}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyTicker}>
            <div className='flex items-center gap-3'>
              <Copy size={16} />
              <span>{t('companies.actions.copyTicker')}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open(`https://www.marketwatch.com/investing/stock/${company.ticker}`, '_blank', 'noreferrer')}>
            <div className='flex items-center gap-3'>
              <ExternalLink size={16} />
              <span>{t('companies.actions.openMarketwatch')}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className='flex items-center gap-3'>
              <Sparkles size={16} />
              <span>{t('companies.actions.smartFollow')}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className='flex items-center gap-3'>
              <Plus size={16} />
              <span>{t('companies.actions.addToPortfolio')}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
