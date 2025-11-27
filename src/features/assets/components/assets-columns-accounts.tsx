import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Asset, AssetType } from '../types'
import { DataTableRowActions } from './data-table-row-actions'
import { AssetTypeBadge, getAssetSymbol } from '../utils/asset-helpers'

// Columnas para cuentas y depósitos (sin precio compra/actual, con saldo e interés)
export const accountsColumns: ColumnDef<Asset>[] = [
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
    id: 'balance',
    accessorFn: (row) => {
      if (row.type === AssetType.CHECKING_ACCOUNT) {
        return 'balance' in row ? row.balance : null
      }
      if (row.type === AssetType.SAVINGS_ACCOUNT || row.type === AssetType.TERM_DEPOSIT) {
        return 'initialAmount' in row ? row.initialAmount : null
      }
      if (row.type === AssetType.PENSION_PLAN) {
        return row.price || null // Valor actual del plan
      }
      return null
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Saldo/Valor' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const currency = asset.currency || 'EUR'
      
      let amount: number | undefined
      if (asset.type === AssetType.CHECKING_ACCOUNT && 'balance' in asset) {
        amount = asset.balance
      } else if ((asset.type === AssetType.SAVINGS_ACCOUNT || asset.type === AssetType.TERM_DEPOSIT) && 'initialAmount' in asset) {
        amount = asset.initialAmount
      } else if (asset.type === AssetType.PENSION_PLAN) {
        amount = asset.price // Valor actual del plan
      }
      
      if (amount === undefined) {
        return <span className='text-muted-foreground text-xs'>-</span>
      }
      
      return (
        <div className='text-xs'>
          <span className='font-semibold'>
            {amount.toLocaleString('es-ES', { 
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
    id: 'interestRate',
    accessorFn: (row) => {
      if (row.type === AssetType.SAVINGS_ACCOUNT || row.type === AssetType.TERM_DEPOSIT) {
        return 'interestRate' in row ? row.interestRate : null
      }
      return null
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo Interés' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if (asset.type === AssetType.SAVINGS_ACCOUNT || asset.type === AssetType.TERM_DEPOSIT) {
        const interestRate = 'interestRate' in asset ? asset.interestRate : undefined
        if (interestRate === undefined) {
          return <span className='text-muted-foreground text-xs'>-</span>
        }
        return (
          <div className='text-xs font-medium'>{interestRate}%</div>
        )
      }
      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'maturityDate',
    accessorFn: (row) => {
      if (row.type === AssetType.TERM_DEPOSIT && 'maturityDate' in row) {
        return row.maturityDate
      }
      return null
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vencimiento' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if (asset.type === AssetType.TERM_DEPOSIT && 'maturityDate' in asset && asset.maturityDate) {
        return (
          <div className='text-xs'>
            {asset.maturityDate.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        )
      }
      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'monthlyBenefit',
    accessorFn: (row) => {
      if (row.type === AssetType.SAVINGS_ACCOUNT || row.type === AssetType.TERM_DEPOSIT) {
        const interestRate = 'interestRate' in row ? row.interestRate : undefined
        const amount = row.type === AssetType.SAVINGS_ACCOUNT || row.type === AssetType.TERM_DEPOSIT
          ? ('initialAmount' in row ? row.initialAmount : undefined)
          : undefined
        if (interestRate && amount) {
          return (amount * interestRate / 100) / 12 // Beneficio mensual
        }
      }
      if (row.type === AssetType.PENSION_PLAN && 'annualContribution' in row && row.annualContribution) {
        return row.annualContribution / 12 // Contribución mensual
      }
      return null
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Beneficio/Contribución Mensual' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const currency = asset.currency || 'EUR'
      
      if (asset.type === AssetType.SAVINGS_ACCOUNT || asset.type === AssetType.TERM_DEPOSIT) {
        const interestRate = 'interestRate' in asset ? asset.interestRate : undefined
        const amount = 'initialAmount' in asset ? asset.initialAmount : undefined
        
        if (interestRate && amount) {
          const monthlyBenefit = (amount * interestRate / 100) / 12
          return (
            <div className='text-xs'>
              <span className='font-semibold text-green-600 dark:text-green-400'>
                +{monthlyBenefit.toLocaleString('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
              <span className='text-muted-foreground ml-1'>{currency}</span>
            </div>
          )
        }
      }
      
      if (asset.type === AssetType.PENSION_PLAN && 'annualContribution' in asset && asset.annualContribution) {
        const monthlyContribution = asset.annualContribution / 12
        return (
          <div className='text-xs'>
            <span className='font-semibold text-blue-600 dark:text-blue-400'>
              {monthlyContribution.toLocaleString('es-ES', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
            <span className='text-muted-foreground ml-1'>{currency}</span>
            <div className='text-[10px] text-muted-foreground mt-0.5'>Contribución</div>
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

