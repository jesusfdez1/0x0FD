import { useEffect, useState } from 'react'
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
import { companiesColumns as columns } from './companies-columns'

type DataTableProps = {
  data: Company[]
  search: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigate: UseNavigateResult<any>
  presetFilters?: ColumnFiltersState
}

export function CompaniesTable({ data, search, navigate, presetFilters }: DataTableProps) {
  const { t } = useLanguage()
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

  useEffect(() => {
    if (!presetFilters) return
    onColumnFiltersChange(() => presetFilters)
    ensurePageInRange(table.getPageCount())
  }, [presetFilters, onColumnFiltersChange, ensurePageInRange, table])

  return (
    <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', 'flex flex-1 flex-col gap-4')}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='group/row'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn('bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted', cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.tdClassName)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
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
