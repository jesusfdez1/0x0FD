import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { LongText } from '@/components/long-text'
import { type Company } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useTheme } from '@/context/theme-provider'

export const companiesColumns: ColumnDef<Company>[] = [
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
      <DataTableColumnHeader column={column} title='Company' />
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
        </div>
      )
    },
    meta: { className: 'ps-0.5' },
    enableHiding: false,
  },
  {
    accessorKey: 'market',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Market' />
    ),
    cell: ({ row }) => <div>{row.getValue('market')}</div>,
  },
  {
    accessorKey: 'region',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Region' />
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
      <DataTableColumnHeader column={column} title='Sector' />
    ),
    cell: ({ row }) => <LongText>{row.getValue('sector')}</LongText>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
