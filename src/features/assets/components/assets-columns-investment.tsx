import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Asset, AssetType } from '../types'
import { DataTableRowActions } from './data-table-row-actions'
import { AssetTypeBadge, getAssetSymbol } from '../utils/asset-helpers'
import { TrendingUp, TrendingDown } from 'lucide-react'

// Columnas para activos de inversión (con precio compra, actual, ganancia)
export const investmentColumns: ColumnDef<Asset>[] = [
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
    id: 'totalValue',
    accessorFn: (row) => {
      if (!row.quantity || !row.price) return null
      return row.quantity * row.price
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Total' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const quantity = asset.quantity
      const price = asset.price
      const currency = asset.currency || 'EUR'
      
      if (quantity === undefined || price === undefined) {
        return <span className='text-muted-foreground text-xs'>-</span>
      }
      
      const total = quantity * price
      
      return (
        <div className='text-xs'>
          <span className='font-semibold'>
            {total.toLocaleString('es-ES', { 
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
    id: 'actions',
    cell: DataTableRowActions,
  },
]

