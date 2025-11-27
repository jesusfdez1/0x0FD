import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'
import type { UseNavigateResult } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar, DataTableBulkActions } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { type Asset, AssetType } from '../types'
import { getAssetSymbol, getAssetCategory } from '../utils/asset-helpers'
import { investmentColumns } from './assets-columns-investment'
import { accountsColumns } from './assets-columns-accounts'
import { realEstateColumns } from './assets-columns-real-estate'

type DataTableProps = {
  data: Asset[]
  search: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigate: UseNavigateResult<any>
}

// Componente de tabla individual
function SingleTable({ 
  data, 
  columns, 
  search, 
  navigate, 
  title 
}: { 
  data: Asset[]
  columns: typeof investmentColumns
  search: Record<string, unknown>
  navigate: UseNavigateResult<any>
  title?: string
}) {
  const queryClient = useQueryClient()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: { ...search, tableGroup: title },
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  if (data.length === 0) {
    return null
  }

  const assetTypes = Array.from(new Set(data.map(d => d.type)))
    .map(type => {
      const labels: Record<AssetType, string> = {
        [AssetType.STOCK]: 'Acción',
        [AssetType.ETF]: 'ETF',
        [AssetType.FIXED_INCOME]: 'Renta Fija',
        [AssetType.GUARANTEED]: 'Garantizado',
        [AssetType.CURRENCY]: 'Divisa',
        [AssetType.OPTION]: 'Opción',
        [AssetType.MUTUAL_FUND]: 'Fondo',
        [AssetType.PENSION_PLAN]: 'Plan Pensiones',
        [AssetType.WARRANT]: 'Warrant',
        [AssetType.REAL_ESTATE]: 'Propiedad',
        [AssetType.CRYPTO]: 'Criptomoneda',
        [AssetType.COMMODITY]: 'Materia Prima',
        [AssetType.FUTURES]: 'Futuro',
        [AssetType.STRUCTURED_PRODUCT]: 'Producto Estructurado',
        [AssetType.SAVINGS_ACCOUNT]: 'Cuenta Remunerada',
        [AssetType.TERM_DEPOSIT]: 'Depósito a Plazo',
        [AssetType.CHECKING_ACCOUNT]: 'Cuenta Corriente',
        [AssetType.PRECIOUS_METAL]: 'Metal Precioso',
      }
      return { label: labels[type] || type, value: type }
    })

  return (
    <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', 'flex flex-1 flex-col gap-4')}>
      {title && (
        <div className='mb-2'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <p className='text-sm text-muted-foreground'>{data.length} activo{data.length > 1 ? 's' : ''}</p>
        </div>
      )}
      
      <DataTableToolbar 
        table={table} 
        searchPlaceholder='Buscar por nombre, ticker, símbolo...' 
        searchKey='name' 
        filters={[
          {
            columnId: 'type',
            title: 'Tipo de Activo',
            options: assetTypes,
          },
        ]} 
      />

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className={cn('bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted', header.column.columnDef.meta?.className, header.column.columnDef.meta?.thClassName)}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='group/row h-auto'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted py-2', cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.tdClassName)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} entityName='activo'>
        {(() => {
          const selectedRows = table.getFilteredSelectedRowModel().rows
          const selectedAssets = selectedRows.map((row) => row.original as Asset)

          const handleBulkExport = () => {
            try {
              // Convertir activos a CSV
              const headers = ['Nombre', 'Tipo', 'Símbolo', 'Cantidad', 'Precio', 'Valor Total']
              const rows = selectedAssets.map(asset => {
                const symbol = 'ticker' in asset ? asset.ticker : 
                              'symbol' in asset ? asset.symbol : 
                              'pair' in asset ? asset.pair : 
                              asset.name
                const quantity = 'quantity' in asset ? asset.quantity : 1
                const price = 'purchasePrice' in asset ? asset.purchasePrice : 0
                const total = quantity * price
                
                return [
                  asset.name,
                  asset.type,
                  symbol,
                  quantity.toString(),
                  price.toFixed(2),
                  total.toFixed(2)
                ].join(',')
              })

              const csvContent = [
                headers.join(','),
                ...rows
              ].join('\n')

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `activos-exportados-${new Date().toISOString().split('T')[0]}.csv`
              link.click()
              URL.revokeObjectURL(url)

              toast.success(`${selectedAssets.length} activo${selectedAssets.length > 1 ? 's' : ''} exportado${selectedAssets.length > 1 ? 's' : ''} correctamente`)
              table.resetRowSelection()
            } catch (error) {
              toast.error('Error al exportar los activos')
              console.error('Error exporting assets:', error)
            }
          }

          const handleBulkDelete = () => {
            if (confirm(`¿Estás seguro de que deseas eliminar ${selectedAssets.length} activo${selectedAssets.length > 1 ? 's' : ''}?`)) {
              // Aquí iría la lógica para eliminar los activos
              toast.success(`${selectedAssets.length} activo${selectedAssets.length > 1 ? 's' : ''} eliminado${selectedAssets.length > 1 ? 's' : ''} correctamente`)
              table.resetRowSelection()
              queryClient.invalidateQueries({ queryKey: ['assets'] })
            }
          }

          return (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={handleBulkExport}
                    className='size-8'
                    aria-label='Exportar activos seleccionados'
                    title='Exportar activos seleccionados'
                  >
                    <Download className='h-4 w-4' />
                    <span className='sr-only'>Exportar activos seleccionados</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar activos seleccionados</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={handleBulkDelete}
                    className='size-8 text-destructive hover:text-destructive'
                    aria-label='Eliminar activos seleccionados'
                    title='Eliminar activos seleccionados'
                  >
                    <Trash2 className='h-4 w-4' />
                    <span className='sr-only'>Eliminar activos seleccionados</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eliminar activos seleccionados</p>
                </TooltipContent>
              </Tooltip>
            </>
          )
        })()}
      </DataTableBulkActions>
    </div>
  )
}

export function AssetsTable({ data, search, navigate }: DataTableProps) {
  // Agrupar activos por tipo: inversiones, inmobiliario, cuentas/depósitos
  const investmentAssets: Asset[] = []
  const realEstateAssets: Asset[] = []
  const accountsAssets: Asset[] = []

  data.forEach(asset => {
    const category = getAssetCategory(asset.type)
    if (category === 'Efectivo y depósitos' || category === 'Planes de pensiones') {
      accountsAssets.push(asset)
    } else if (category === 'Inmobiliario') {
      realEstateAssets.push(asset)
    } else {
      investmentAssets.push(asset)
    }
  })

  return (
    <div className='space-y-8'>
      {investmentAssets.length > 0 && (
        <SingleTable
          data={investmentAssets}
          columns={investmentColumns}
          search={search}
          navigate={navigate}
          title='Activos de Inversión'
        />
      )}
      
      {realEstateAssets.length > 0 && (
        <SingleTable
          data={realEstateAssets}
          columns={realEstateColumns}
          search={search}
          navigate={navigate}
          title='Inmobiliario'
        />
      )}
      
      {accountsAssets.length > 0 && (
        <SingleTable
          data={accountsAssets}
          columns={accountsColumns}
          search={search}
          navigate={navigate}
          title='Efectivo, Depósitos y Planes de Pensiones'
        />
      )}
      
      {investmentAssets.length === 0 && realEstateAssets.length === 0 && accountsAssets.length === 0 && (
        <div className='text-center py-12 text-muted-foreground'>
          No hay activos para mostrar.
        </div>
      )}
    </div>
  )
}

