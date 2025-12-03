import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Asset, AssetType } from '../types'
import { DataTableRowActions } from './data-table-row-actions'
import { AssetTypeBadge, getAssetSymbol } from '../utils/asset-helpers'

export const derivativesColumns: ColumnDef<Asset>[] = [
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
      <DataTableColumnHeader column={column} title='Derivado' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const symbol = getAssetSymbol(asset)
      const details: string[] = []

      if (asset.type === AssetType.OPTION || asset.type === AssetType.WARRANT) {
        if ('optionType' in asset) details.push(asset.optionType.toUpperCase())
        if ('position' in asset) details.push(asset.position === 'buy' ? 'Largo' : 'Corto')
      } else if (asset.type === AssetType.FUTURES) {
        if ('settlementType' in asset && asset.settlementType) {
          details.push(asset.settlementType === 'cash' ? 'Liquidación en efectivo' : 'Entrega física')
        }
      }

      return (
        <div className='min-w-0'>
          <div className='font-semibold text-sm leading-tight'>{asset.name}</div>
          <div className='text-muted-foreground text-xs leading-tight'>
            {symbol}
            {details.length > 0 && <> · {details.join(' · ')}</>}
          </div>
        </div>
      )
    },
    meta: { tdClassName: 'py-2' },
    enableHiding: false,
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
  },
  {
    id: 'underlying',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subyacente' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if ('underlyingAsset' in asset && asset.underlyingAsset) {
        return <span className='text-xs font-medium'>{asset.underlyingAsset}</span>
      }
      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'strikePrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Strike / Nivel' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const currency = asset.currency || 'EUR'

      if ((asset.type === AssetType.OPTION || asset.type === AssetType.WARRANT) && 'strikePrice' in asset) {
        return (
          <span className='text-xs font-medium'>
            {asset.strikePrice.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className='text-muted-foreground ml-1'>{currency}</span>
          </span>
        )
      }

      if (asset.type === AssetType.FUTURES && 'contractSize' in asset) {
        return <span className='text-xs'>{asset.contractSize.toLocaleString('es-ES')} unidades</span>
      }

      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'expiration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vencimiento' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if ('expirationDate' in asset && asset.expirationDate) {
        return (
          <span className='text-xs'>
            {asset.expirationDate.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        )
      }
      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'positionSize',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cantidad / Tamaño' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      if ('quantity' in asset && asset.quantity) {
        return (
          <span className='text-xs font-medium'>
            {asset.quantity.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
          </span>
        )
      }
      if ('contractSize' in asset && asset.contractSize) {
        return (
          <span className='text-xs font-medium'>
            {asset.contractSize.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
          </span>
        )
      }
      return <span className='text-muted-foreground text-xs'>-</span>
    },
    meta: { tdClassName: 'py-2' },
  },
  {
    id: 'premium',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Prima / Margen' />
    ),
    cell: ({ row }) => {
      const asset = row.original
      const currency = asset.currency || 'EUR'

      if ((asset.type === AssetType.OPTION || asset.type === AssetType.WARRANT) && 'premium' in asset && asset.premium) {
        return (
          <span className='text-xs font-semibold'>
            {asset.premium.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className='text-muted-foreground ml-1'>{currency}</span>
          </span>
        )
      }

      if (asset.type === AssetType.FUTURES && 'margin' in asset && asset.margin) {
        return (
          <span className='text-xs font-semibold'>
            {asset.margin.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className='text-muted-foreground ml-1'>{currency}</span>
          </span>
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


