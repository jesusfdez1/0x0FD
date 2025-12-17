import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { LongText } from '@/components/long-text'
import { type Company } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useTheme } from '@/context/theme-provider'
import { Sparkline } from '@/components/ui/sparkline'
import { useSyntheticPrices } from '../hooks/use-synthetic-prices'
import { format } from 'date-fns'
import { enUS, es as esLocale } from 'date-fns/locale'

type Language = 'en' | 'es'
type Translator = (key: string, params?: Record<string, any>) => string

export const getCompaniesColumns = ({
  t,
  language,
  ranksByTicker,
}: {
  t: Translator
  language: Language
  ranksByTicker?: Record<string, number>
}): ColumnDef<Company>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t('companies.columns.selectAll')}
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t('companies.columns.selectRow')}
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('companies.columns.company')} />
    ),
    cell: ({ row }) => {
      const company = row.original
      // Limpiar el ticker para quitar sufijos de exchange (ej: SAN.MC -> SAN, 7203.T -> 7203)
      const cleanTicker = company.ticker.split('.')[0]
      const token = import.meta.env.VITE_LOGO_DEV_TOKEN || ''
      const { resolvedTheme } = useTheme()
      const themeParam = resolvedTheme === 'dark' ? '&theme=dark' : ''
      
      // Primero intentar con ticker usando fallback=404
      const tickerUrl = token
        ? `https://img.logo.dev/ticker/${encodeURIComponent(cleanTicker)}?token=${token}&format=webp&retina=true&size=64&fallback=404${themeParam}`
        : null
      
      // Si hay token, intentar con nombre como fallback
      const nameUrl = token
        ? `https://img.logo.dev/name/${encodeURIComponent(company.name)}?token=${token}&format=webp&retina=true&size=64${themeParam}`
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
      
      const priceData = useSyntheticPrices(company.ticker)

      return (
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 overflow-hidden rounded bg-muted/40'>
            <img 
              src={tickerUrl || nameUrl || placeholderUrl} 
              alt={company.name} 
              className='h-full w-full object-contain'
              onError={handleImageError}
            />
          </div>
          <div className='min-w-0'>
            <div className='font-semibold'>{company.name}</div>
            <div className='text-muted-foreground text-sm'>{company.ticker}</div>
          </div>
          <div className='ml-auto text-right'>
            <div className='text-sm font-semibold'>{priceData.currentPrice.toFixed(2)}</div>
            <div className={cn('text-xs', priceData.change30dPercent >= 0 ? 'text-emerald-600' : 'text-red-600')}>{priceData.change30dPercent}%</div>
          </div>
        </div>
      )
    },
    meta: { className: 'ps-0.5' },
    enableHiding: false,
  },
  {
    accessorKey: 'market',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('companies.columns.market')} />
    ),
    cell: ({ row }) => <div>{row.getValue('market')}</div>,
  },
  {
    id: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.price')} />,
    cell: ({ row }) => {
      const company = row.original
      const { currentPrice } = useSyntheticPrices(company.ticker)
      return (
        <div className='text-right pr-2'>
          <div className='text-sm font-semibold'>{currentPrice.toFixed(2)}</div>
          <div className='text-xs text-muted-foreground'>USD</div>
        </div>
      )
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'change30',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.change30d')} />,
    cell: ({ row }) => {
      const company = row.original
      const { change30dPercent } = useSyntheticPrices(company.ticker)
      return <div className={cn('text-sm font-medium', change30dPercent >= 0 ? 'text-emerald-600' : 'text-red-600')}>{change30dPercent}%</div>
    },
    meta: { className: 'w-[80px] ps-0.5 text-right' },
  },
  {
    id: 'sparkline',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.trend30d')} />,
    cell: ({ row }) => {
      const company = row.original
      const { history30d } = useSyntheticPrices(company.ticker)
      const data = history30d.map(d => d.price)
      return <div className='pr-2'><Sparkline data={data} width={120} height={28} /></div>
    },
    meta: { className: 'w-[140px] ps-0.5' },
  },
  {
    id: 'marketCap',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.marketCap')} />,
    cell: ({ row }) => {
      const company = row.original
      const { marketCap } = useSyntheticPrices(company.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact', compactDisplay: 'short' })
      return <div className='text-sm font-medium'>{fmt.format(marketCap)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'volume',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.volume')} />,
    cell: ({ row }) => {
      const company = row.original
      const { volume } = useSyntheticPrices(company.ticker)
      const fmt = new Intl.NumberFormat()
      return <div className='text-sm'>{fmt.format(volume)}</div>
    },
    meta: { className: 'w-[100px] ps-0.5 text-right' },
  },
  {
    id: 'updated',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.updated')} />,
    cell: ({ row }) => {
      const company = row.original
      const { lastUpdated } = useSyntheticPrices(company.ticker)
      const locale = language === 'es' ? esLocale : enUS
      return <div className='text-xs text-muted-foreground'>{format(new Date(lastUpdated), 'MMM d, HH:mm', { locale })}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'rank',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.rank')} />,
    cell: ({ row }) => {
      const rank = ranksByTicker?.[row.original.ticker] ?? '-'
      return <div className='text-sm font-medium'>{rank}</div>
    },
    meta: { className: 'w-[72px] ps-0.5 text-right' },
  },
  {
    id: 'earnings',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.earnings')} />,
    cell: ({ row }) => {
      const { earnings } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm'>{fmt.format(earnings || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'revenue',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.revenue')} />,
    cell: ({ row }) => {
      const { revenue } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm'>{fmt.format(revenue || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'employees',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.employees')} />,
    cell: ({ row }) => {
      const { employees } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat()
      return <div className='text-sm'>{fmt.format(employees || 0)}</div>
    },
    meta: { className: 'w-[100px] ps-0.5 text-right' },
  },
  {
    id: 'peRatio',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.peRatio')} />,
    cell: ({ row }) => {
      const { peRatio } = useSyntheticPrices(row.original.ticker)
      return <div className='text-sm'>{peRatio?.toFixed(2)}</div>
    },
    meta: { className: 'w-[80px] ps-0.5 text-right' },
  },
  {
    id: 'dividend',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.dividendYield')} />,
    cell: ({ row }) => {
      const { dividendYield } = useSyntheticPrices(row.original.ticker)
      return <div className='text-sm'>{dividendYield?.toFixed(2)}%</div>
    },
    meta: { className: 'w-[100px] ps-0.5 text-right' },
  },
  {
    id: 'marketCapGain',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.marketCapGain')} />,
    cell: ({ row }) => {
      const { marketCapGain } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm text-emerald-600'>{fmt.format(marketCapGain || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'marketCapLoss',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.marketCapLoss')} />,
    cell: ({ row }) => {
      const { marketCapLoss } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm text-red-600'>{fmt.format(marketCapLoss || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'operatingMargin',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.operatingMargin')} />,
    cell: ({ row }) => {
      const { operatingMargin } = useSyntheticPrices(row.original.ticker)
      return <div className={cn('text-sm font-medium', (operatingMargin || 0) >= 0 ? 'text-emerald-600' : 'text-red-600')}>{(operatingMargin || 0).toFixed(1)}%</div>
    },
    meta: { className: 'w-[110px] ps-0.5 text-right' },
  },
  {
    id: 'costToBorrow',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.costToBorrow')} />,
    cell: ({ row }) => {
      const { costToBorrow } = useSyntheticPrices(row.original.ticker)
      return <div className='text-sm'>{(costToBorrow || 0).toFixed(2)}%</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'totalAssets',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.totalAssets')} />,
    cell: ({ row }) => {
      const { totalAssets } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm'>{fmt.format(totalAssets || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'netAssets',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.netAssets')} />,
    cell: ({ row }) => {
      const { netAssets } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm'>{fmt.format(netAssets || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'totalLiabilities',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.totalLiabilities')} />,
    cell: ({ row }) => {
      const { totalLiabilities } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm'>{fmt.format(totalLiabilities || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'totalDebt',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.totalDebt')} />,
    cell: ({ row }) => {
      const { totalDebt } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm'>{fmt.format(totalDebt || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'cashOnHand',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.cash')} />,
    cell: ({ row }) => {
      const { cashOnHand } = useSyntheticPrices(row.original.ticker)
      const fmt = new Intl.NumberFormat(undefined, { notation: 'compact' })
      return <div className='text-sm'>{fmt.format(cashOnHand || 0)}</div>
    },
    meta: { className: 'w-[120px] ps-0.5 text-right' },
  },
  {
    id: 'priceToBook',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('companies.columns.priceToBook')} />,
    cell: ({ row }) => {
      const { priceToBook } = useSyntheticPrices(row.original.ticker)
      return <div className='text-sm'>{(priceToBook || 0).toFixed(2)}</div>
    },
    meta: { className: 'w-[80px] ps-0.5 text-right' },
  },
  {
    accessorKey: 'region',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('companies.columns.region')} />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='w-32 justify-center'>
        {row.getValue('region')}
      </Badge>
    ),
  },
  {
    accessorKey: 'sector',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('companies.columns.sector')} />
    ),
    cell: ({ row }) => <LongText>{row.getValue('sector')}</LongText>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
    enableHiding: false,
    enableSorting: false,
  },
]
