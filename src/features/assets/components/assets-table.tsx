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
import { type Asset, AssetType } from '../types'
import { assetsColumns as columns } from './assets-columns'
import { AssetFormDialog } from './asset-form/asset-form-dialog'

type DataTableProps = {
  data: Asset[]
  search: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigate: UseNavigateResult<any>
}

export function AssetsTable({ data, search, navigate }: DataTableProps) {
  const queryClient = useQueryClient()
  // Local UI-only states
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
    search,
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

  // Obtener opciones para filtros
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

  // Obtener regiones únicas
  const regions = Array.from(
    new Set(
      data
        .map(d => {
          if ('region' in d && d.region) return d.region
          return null
        })
        .filter((r): r is string => r !== null)
    )
  ).map(region => ({ label: region, value: region }))

  // Obtener sectores únicos
  const sectors = Array.from(
    new Set(
      data
        .map(d => {
          if ('sector' in d && d.sector) return d.sector
          return null
        })
        .filter((s): s is string => s !== null)
    )
  ).map(sector => ({ label: sector, value: sector }))

  return (
    <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', 'flex flex-1 flex-col gap-4')}>
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
          ...(regions.length > 0 ? [{
            columnId: 'region',
            title: 'Región',
            options: regions,
          }] : []),
          ...(sectors.length > 0 ? [{
            columnId: 'sector',
            title: 'Sector',
            options: sectors,
          }] : []),
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
      <DataTableBulkActions table={table} entityName='asset'>
        <AssetFormDialog onSuccess={() => {
          // Refrescar datos
          queryClient.invalidateQueries({ queryKey: ['assets'] })
        }} />
      </DataTableBulkActions>
    </div>
  )
}

