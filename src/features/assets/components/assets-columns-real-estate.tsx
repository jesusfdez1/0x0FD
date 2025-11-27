import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Asset, AssetType } from '../types'
import { DataTableRowActions } from './data-table-row-actions'
import { AssetTypeBadge, getAssetSymbol } from '../utils/asset-helpers'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Columnas para inmobiliario (precio compra, actual, alquiler)
export const realEstateColumns: ColumnDef<Asset>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todo'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Propiedad' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const symbol = getAssetSymbol(asset)
      
      return (
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 flex items-center justify-center rounded bg-muted/40'>
            <span className='text-[10px] font-semibold'>
              {asset.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className='min-w-0 flex-1'>
            <div className='font-semibold text-sm leading-tight'>{asset.name}</div>
            {asset.type === AssetType.REAL_ESTATE && 'location' in asset && asset.location && (
              <div className='text-muted-foreground text-xs leading-tight'>{asset.location}</div>
            )}
          </div>
        </div>
      )
    },
    meta: { className: 'ps-0.5', tdClassName: 'py-2' },
    enableHiding: false,
    filterFn: (row, id, value) => {
      const asset = row.original
      const searchValue = String(value).toLowerCase()
      const name = asset.name.toLowerCase()
      const location = asset.type === AssetType.REAL_ESTATE && 'location' in asset && asset.location
        ? asset.location.toLowerCase()
        : ''
      const description = asset.description?.toLowerCase() || ''
      
      return name.includes(searchValue) || 
             location.includes(searchValue) || 
             description.includes(searchValue)
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as AssetType
      return <AssetTypeBadge type={type} className='text-xs' />
    },
    meta: { tdClassName: 'py-2' },
    enableHiding: true,
  },
  {
    id: 'purchasePrice',
    accessorFn: (row) => {
      if (row.type === AssetType.REAL_ESTATE && 'purchasePrice' in row) {
        return row.purchasePrice
      }
      return null
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Compra' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if (asset.type === AssetType.REAL_ESTATE && 'purchasePrice' in asset) {
        const purchasePrice = asset.purchasePrice
        const currency = asset.currency || 'EUR'
        
        if (purchasePrice === undefined) {
          return <span className='text-muted-foreground text-xs'>-</span>
        }
        
        return (
          <div className='text-xs text-muted-foreground'>
            {purchasePrice.toLocaleString('es-ES', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
            <span className='ml-1'>{currency}</span>
          </div>
        )
      }
      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'currentPrice',
    accessorFn: (row) => row.price || null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Actual' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const price = asset.price
      const purchasePrice = asset.type === AssetType.REAL_ESTATE && 'purchasePrice' in asset
        ? asset.purchasePrice
        : undefined
      const currency = asset.currency || 'EUR'
      
      if (price === undefined) {
        return <span className='text-muted-foreground text-xs'>-</span>
      }
      
      // Calcular cambio porcentual del precio
      let priceChange: number | null = null
      if (purchasePrice && purchasePrice > 0) {
        priceChange = ((price - purchasePrice) / purchasePrice) * 100
      }
      
      return (
        <div className='text-xs'>
          <div className='font-medium'>
            {price.toLocaleString('es-ES', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
            <span className='text-muted-foreground ml-1'>{currency}</span>
          </div>
          {priceChange !== null && (
            <div className={cn(
              'text-[10px] mt-0.5',
              priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {priceChange >= 0 ? '+' : ''}
              {priceChange.toFixed(2)}%
            </div>
          )}
        </div>
      )
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'rentalIncome',
    accessorFn: (row) => {
      if (row.type === AssetType.REAL_ESTATE && 'rentalYield' in row && row.rentalYield && row.price) {
        // Calcular alquiler mensual aproximado basado en yield anual
        return (row.price * row.rentalYield / 100) / 12
      }
      return null
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Alquiler Mensual' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if (asset.type === AssetType.REAL_ESTATE && 'rentalYield' in asset) {
        const rentalYield = asset.rentalYield
        const price = asset.price
        const currency = asset.currency || 'EUR'
        
        if (rentalYield && price) {
          const monthlyRent = (price * rentalYield / 100) / 12
          return (
            <div className='text-xs'>
              <div className='font-semibold text-green-600 dark:text-green-400'>
                +{monthlyRent.toLocaleString('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
                <span className='text-muted-foreground ml-1'>{currency}</span>
              </div>
              <div className='text-[10px] text-muted-foreground mt-0.5'>
                Yield: {rentalYield}%
              </div>
            </div>
          )
        }
      }
      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'gainLoss',
    accessorFn: (row) => {
      if (row.type === AssetType.REAL_ESTATE && 'purchasePrice' in row && row.purchasePrice && row.price) {
        return row.price - row.purchasePrice
      }
      return null
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ganancia/Pérdida' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if (asset.type === AssetType.REAL_ESTATE && 'purchasePrice' in asset) {
        const purchasePrice = asset.purchasePrice
        const price = asset.price
        const currency = asset.currency || 'EUR'
        
        if (!purchasePrice || !price) {
          return <span className='text-muted-foreground text-xs'>-</span>
        }
        
        const amount = price - purchasePrice
        const percentage = (amount / purchasePrice) * 100
        const isPositive = amount >= 0
        
        return (
          <div className='flex items-center gap-1.5'>
            {isPositive ? (
              <TrendingUp className='h-3 w-3 text-green-600' />
            ) : (
              <TrendingDown className='h-3 w-3 text-red-600' />
            )}
            <div className='text-xs'>
              <div className={cn(
                'font-semibold',
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {isPositive ? '+' : ''}
                {amount.toLocaleString('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
                <span className='text-muted-foreground ml-1'>{currency}</span>
              </div>
              <div className={cn(
                'text-[10px]',
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {isPositive ? '+' : ''}
                {percentage.toFixed(2)}%
              </div>
            </div>
          </div>
        )
      }
      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]

