import { useEffect, useState, useMemo } from 'react'
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { UseNavigateResult } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { useLanguage } from '@/context/language-provider'
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
import { Plus } from 'lucide-react'
import { type Company } from '../data/schema'
import { getCompaniesColumns } from './companies-columns'
import { generateSyntheticPrices } from '../hooks/use-synthetic-prices'

type ViewPreset = 'default' | 'fundamentals' | 'balance' | 'performance' | 'all'

type DataTableProps = {
  data: Company[]
  search: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigate: UseNavigateResult<any>
  presetFilters?: ColumnFiltersState
  viewPreset?: ViewPreset
}

export function CompaniesTable({ data, search, navigate, presetFilters, viewPreset = 'default' }: DataTableProps) {
  const { t, language } = useLanguage()
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

  // Compute ranks by market cap for 'rank' column
  const ranksByTicker = useMemo(() => {
    const arr = data.map(d => ({ ticker: d.ticker, mc: generateSyntheticPrices(d.ticker).marketCap }))
    arr.sort((a, b) => b.mc - a.mc)
    const map: Record<string, number> = {}
    arr.forEach((v, i) => (map[v.ticker] = i + 1))
    return map
  }, [data])

  const columnsMemo = useMemo(() => getCompaniesColumns({ t, language, ranksByTicker }), [t, language, ranksByTicker])

  const table = useReactTable({
    data,
    columns: columnsMemo,
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

  const pageCount = table.getPageCount()

  const areColumnFiltersEqual = (a: ColumnFiltersState, b: ColumnFiltersState) => {
    if (a.length !== b.length) return false
    const normalize = (filters: ColumnFiltersState) =>
      [...filters]
        .map((f) => ({ id: f.id, value: f.value }))
        .sort((x, y) => x.id.localeCompare(y.id))
    const na = normalize(a)
    const nb = normalize(b)
    for (let i = 0; i < na.length; i++) {
      if (na[i]!.id !== nb[i]!.id) return false
      if (JSON.stringify(na[i]!.value) !== JSON.stringify(nb[i]!.value)) return false
    }
    return true
  }

  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  useEffect(() => {
    if (!presetFilters) return
    if (areColumnFiltersEqual(columnFilters, presetFilters)) return
    onColumnFiltersChange(() => presetFilters)
    ensurePageInRange(pageCount)
  }, [presetFilters, columnFilters, onColumnFiltersChange, ensurePageInRange, pageCount])

  // Apply view presets by toggling column visibility
  useEffect(() => {
    const presets: Record<ViewPreset, string[]> = {
      default: ['select', 'name', 'market', 'price', 'change30', 'sparkline', 'marketCap', 'volume', 'updated', 'actions'],
      fundamentals: ['select', 'name', 'market', 'price', 'marketCap', 'earnings', 'revenue', 'peRatio', 'dividend', 'priceToBook', 'actions'],
      balance: ['select', 'name', 'market', 'totalAssets', 'netAssets', 'totalLiabilities', 'totalDebt', 'cashOnHand', 'employees', 'actions'],
      performance: ['select', 'name', 'market', 'price', 'marketCapGain', 'marketCapLoss', 'operatingMargin', 'costToBorrow', 'rank', 'actions'],
      all: ['select', 'name', 'market', 'price', 'change30', 'sparkline', 'marketCap', 'volume', 'updated', 'earnings', 'revenue', 'employees', 'peRatio', 'dividend', 'marketCapGain', 'marketCapLoss', 'operatingMargin', 'costToBorrow', 'totalAssets', 'netAssets', 'totalLiabilities', 'totalDebt', 'cashOnHand', 'priceToBook', 'rank', 'actions']
    }

    const visible = presets[viewPreset]
    const visibility: Record<string, boolean> = {}
    columnsMemo.forEach((col) => {
      const id = col.id || (col as any).accessorKey
      if (!id) return
      const isSticky = id === 'select' || id === 'actions'
      visibility[id] = isSticky ? true : visible.includes(id as string)
    })

    setColumnVisibility(visibility)
  }, [viewPreset, columnsMemo])

  return (
    <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', 'flex flex-1 flex-col gap-4 min-w-0 max-w-full')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder={t('companies.filterPlaceholder')}
        searchKey='name'
        filters={[
          {
            columnId: 'region',
            title: t('companies.filters.region'),
            options: Array.from(new Set(data.map((d) => d.region))).map((region) => ({
              label: region,
              value: region,
            })),
          },
          {
            columnId: 'market',
            title: t('companies.filters.market'),
            options: Array.from(new Set(data.map((d) => d.market))).map((market) => ({
              label: market,
              value: market,
            })),
          },
          {
            columnId: 'sector',
            title: t('companies.filters.sector'),
            options: Array.from(new Set(data.map((d) => d.sector).filter(Boolean))).map((sector) => ({
              label: sector as string,
              value: sector as string,
            })),
          },
        ]}
      />

      <div className='w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden rounded-md border border-white/10 dark:border-black/30 bg-white/20 dark:bg-black/20 backdrop-blur-md'>
        <Table className='min-w-max table-auto'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className={cn('bg-transparent group-hover/row:bg-muted/10 group-data-[state=selected]/row:bg-muted/20', header.column.columnDef.meta?.className, header.column.columnDef.meta?.thClassName)}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='group/row'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('bg-transparent group-hover/row:bg-muted/10 group-data-[state=selected]/row:bg-muted/20', cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.tdClassName)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnsMemo.length} className='h-24 text-center'>
                  {t('common.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions
        table={table}
        entityName='company'
        entityLabel={{
          singular: t('companies.entity.singular'),
          plural: t('companies.entity.plural'),
        }}
      >
        <Button
          variant='outline'
          size='icon'
          onClick={() => {}}
          aria-label={t('common.add')}
          title={t('common.add')}
        >
          <Plus />
        </Button>
      </DataTableBulkActions>
    </div>
  )
}
