import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { type Asset, AssetType } from '../types'
import { DataTableRowActions } from './data-table-row-actions'
import { AssetTypeBadge, getAssetSymbol } from '../utils/asset-helpers'
import { TrendingUp, TrendingDown } from 'lucide-react'

export const assetsColumns: ColumnDef<Asset>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Activo' />
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
            <div className='text-muted-foreground text-xs leading-tight'>{symbol}</div>
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
      const symbol = getAssetSymbol(asset).toLowerCase()
      const description = asset.description?.toLowerCase() || ''
      
      return name.includes(searchValue) || 
             symbol.includes(searchValue) || 
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
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'region',
    accessorFn: (row) => row.region || null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Región' />
    ),
    cell: ({ row }) => {
      const region = row.getValue('region') as string | null
      return region ? (
        <span className='text-xs'>{region}</span>
      ) : (
        <span className='text-muted-foreground text-xs'>-</span>
      )
    },
    meta: { tdClassName: 'py-2' },
    filterFn: (row, id, value) => {
      const region = row.getValue(id)
      if (!region) return false
      return value.includes(region)
    },
  },
  {
    id: 'sector',
    accessorFn: (row) => row.sector || null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sector' />
    ),
    cell: ({ row }) => {
      const sector = row.getValue('sector') as string | null
      return sector ? (
        <span className='text-xs'>{sector}</span>
      ) : (
        <span className='text-muted-foreground text-xs'>-</span>
      )
    },
    meta: { tdClassName: 'py-2' },
    filterFn: (row, id, value) => {
      const sector = row.getValue(id)
      if (!sector) return false
      return value.includes(sector)
    },
  },
  {
    id: 'quantity',
    accessorFn: (row) => row.quantity || null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cantidad' />
    ),
    cell: ({ row }) => {
      const quantity = row.original.quantity
      if (quantity === undefined) {
        return <span className='text-muted-foreground text-xs'>-</span>
      }
      return (
        <div className='text-xs font-medium'>
          {quantity.toLocaleString('es-ES', { maximumFractionDigits: 4 })}
        </div>
      )
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'purchasePrice',
    accessorFn: (row) => row.purchasePrice || null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Compra' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const purchasePrice = asset.purchasePrice
      const currency = asset.currency || 'EUR'
      
      if (purchasePrice === undefined) {
        return <span className='text-muted-foreground text-xs'>-</span>
      }
      
      return (
        <div className='text-xs'>
          <span className='font-medium'>
            {purchasePrice.toLocaleString('es-ES', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </span>
          <span className='text-muted-foreground ml-1'>{currency}</span>
        </div>
      )
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'price',
    accessorFn: (row) => row.price || null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Actual' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const price = asset.price
      const currency = asset.currency || 'EUR'
      
      if (price === undefined) {
        return <span className='text-muted-foreground text-xs'>-</span>
      }
      
      return (
        <div className='text-xs'>
          <span className='font-medium'>
            {price.toLocaleString('es-ES', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </span>
          <span className='text-muted-foreground ml-1'>{currency}</span>
        </div>
      )
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'gainLoss',
    accessorFn: (row) => {
      if (!row.quantity || !row.purchasePrice || !row.price) return null
      const purchaseValue = row.quantity * row.purchasePrice
      const currentValue = row.quantity * row.price
      return currentValue - purchaseValue
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ganancia/Pérdida' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if (!asset.quantity || !asset.purchasePrice || !asset.price) {
        return <span className='text-muted-foreground text-xs'>-</span>
      }
      
      const purchaseValue = asset.quantity * asset.purchasePrice
      const currentValue = asset.quantity * asset.price
      const amount = currentValue - purchaseValue
      const percentage = (amount / purchaseValue) * 100
      const currency = asset.currency || 'EUR'
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
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'keyInfo',
    header: 'Información Clave',
    cell: ({ row }) => {
      const asset = row.original
      
      switch (asset.type) {
        case AssetType.STOCK:
          return asset.dividendYield ? (
            <div className='text-xs'>
              <span className='text-muted-foreground'>Div: </span>
              <span className='font-medium'>{asset.dividendYield}%</span>
            </div>
          ) : null
          
        case AssetType.ETF:
          return asset.expenseRatio ? (
            <div className='text-xs'>
              <span className='text-muted-foreground'>Com: </span>
              <span className='font-medium'>{asset.expenseRatio}%</span>
            </div>
          ) : null
          
        case AssetType.FIXED_INCOME:
          return (
            <div className='space-y-0.5 text-xs'>
              {asset.coupon && (
                <div>
                  <span className='text-muted-foreground'>Cupón: </span>
                  <span className='font-medium'>{asset.coupon}%</span>
                </div>
              )}
              {asset.rating && (
                <div>
                  <span className='text-muted-foreground'>Rating: </span>
                  <span className='font-medium'>{asset.rating}</span>
                </div>
              )}
            </div>
          )
          
        case AssetType.CURRENCY:
          return asset.exchangeRate ? (
            <div className='text-xs'>
              <span className='font-medium'>{asset.exchangeRate}</span>
            </div>
          ) : null
          
        case AssetType.OPTION:
        case AssetType.WARRANT:
          return (
            <div className='space-y-0.5 text-xs'>
              <div>
                <span className='text-muted-foreground'>Strike: </span>
                <span className='font-medium'>{asset.strikePrice}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Venc: </span>
                <span className='font-medium'>
                  {asset.expirationDate.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          )
          
        case AssetType.REAL_ESTATE:
          return (
            <div className='space-y-0.5 text-xs'>
              {asset.rentalYield && (
                <div>
                  <span className='text-muted-foreground'>Rendimiento: </span>
                  <span className='font-medium'>{asset.rentalYield}%</span>
                </div>
              )}
              {asset.squareMeters && (
                <div>
                  <span className='text-muted-foreground'>{asset.squareMeters}m²</span>
                </div>
              )}
            </div>
          )
          
        case AssetType.CRYPTO:
          return asset.blockchain ? (
            <div className='text-xs'>
              <span className='text-muted-foreground'>{asset.blockchain}</span>
            </div>
          ) : null
          
        case AssetType.COMMODITY:
          return asset.commodityType ? (
            <div className='text-xs'>
              <span className='text-muted-foreground capitalize'>{asset.commodityType.replace('_', ' ')}</span>
            </div>
          ) : null
          
        case AssetType.FUTURES:
          return (
            <div className='space-y-0.5 text-xs'>
              <div>
                <span className='text-muted-foreground'>Venc: </span>
                <span className='font-medium'>
                  {asset.expirationDate.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          )
          
        case AssetType.STRUCTURED_PRODUCT:
          return (
            <div className='space-y-0.5 text-xs'>
              {asset.issuer && (
                <div>
                  <span className='text-muted-foreground'>Emisor: </span>
                  <span className='font-medium'>{asset.issuer}</span>
                </div>
              )}
              {asset.maturityDate && (
                <div>
                  <span className='text-muted-foreground'>Venc: </span>
                  <span className='font-medium'>
                    {asset.maturityDate.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit' 
                    })}
                  </span>
                </div>
              )}
            </div>
          )
          
        case AssetType.SAVINGS_ACCOUNT:
          return asset.interestRate ? (
            <div className='text-xs'>
              <span className='text-muted-foreground'>Tipo: </span>
              <span className='font-medium'>{asset.interestRate}%</span>
            </div>
          ) : null
          
        case AssetType.TERM_DEPOSIT:
          return (
            <div className='space-y-0.5 text-xs'>
              <div>
                <span className='text-muted-foreground'>Tipo: </span>
                <span className='font-medium'>{asset.interestRate}%</span>
              </div>
              <div>
                <span className='text-muted-foreground'>Venc: </span>
                <span className='font-medium'>
                  {asset.maturityDate.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          )
          
        case AssetType.CHECKING_ACCOUNT:
          return asset.balance !== undefined ? (
            <div className='text-xs'>
              <span className='font-medium'>
                {asset.balance.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              <span className='text-muted-foreground ml-1'>{asset.currency || 'EUR'}</span>
            </div>
          ) : null
          
        case AssetType.PRECIOUS_METAL:
          return (
            <div className='space-y-0.5 text-xs'>
              <div>
                <span className='text-muted-foreground'>{asset.weight}</span>
                <span className='text-muted-foreground ml-1'>{asset.unit}</span>
              </div>
              {asset.purity && (
                <div>
                  <span className='text-muted-foreground'>{asset.purity}%</span>
                </div>
              )}
            </div>
          )
          
        default:
          return null
      }
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
