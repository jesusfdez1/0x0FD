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
import { derivativesColumns } from './assets-columns-derivatives'
import { useLanguage } from '@/context/language-provider'

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
  const { t } = useLanguage()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const tableSlug =
    (title ?? 'table')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'table'

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: { ...search, tableGroup: title },
    navigate,
    pagination: {
      defaultPage: 1,
      defaultPageSize: 10,
      pageKey: `${tableSlug}Page`,
      pageSizeKey: `${tableSlug}PageSize`,
    },
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

  const assetTypeLabels: Record<AssetType, string> = {
    [AssetType.STOCK]: t('assets.types.stock'),
    [AssetType.ETF]: t('assets.types.etf'),
    [AssetType.FIXED_INCOME]: t('assets.types.fixed_income'),
    [AssetType.GUARANTEED]: t('assets.types.guaranteed'),
    [AssetType.CURRENCY]: t('assets.types.currency'),
    [AssetType.OPTION]: t('assets.types.option'),
    [AssetType.MUTUAL_FUND]: t('assets.types.mutual_fund'),
    [AssetType.PENSION_PLAN]: t('assets.types.pension_plan'),
    [AssetType.WARRANT]: t('assets.types.warrant'),
    [AssetType.REAL_ESTATE]: t('assets.types.real_estate'),
    [AssetType.CRYPTO]: t('assets.types.crypto'),
    [AssetType.COMMODITY]: t('assets.types.commodity'),
    [AssetType.FUTURES]: t('assets.types.futures'),
    [AssetType.STRUCTURED_PRODUCT]: t('assets.types.structured_product'),
    [AssetType.SAVINGS_ACCOUNT]: t('assets.types.savings_account'),
    [AssetType.TERM_DEPOSIT]: t('assets.types.term_deposit'),
    [AssetType.CHECKING_ACCOUNT]: t('assets.types.checking_account'),
    [AssetType.PRECIOUS_METAL]: t('assets.types.precious_metal'),
  }

  const assetTypes = Array.from(new Set(data.map(d => d.type))).map(type => ({
    label: assetTypeLabels[type] || type,
    value: type,
  }))

  return (
    <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', 'flex flex-1 flex-col gap-4')}>
      {title && (
        <div className='mb-2'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <p className='text-sm text-muted-foreground'>
            {data.length}{' '}
            {data.length === 1 ? t('assets.table.assetSingular') : t('assets.table.assetPlural')}
          </p>
        </div>
      )}
      
      <DataTableToolbar 
        table={table} 
        searchPlaceholder={t('assets.table.searchPlaceholder')} 
        searchKey='name' 
        filters={[
          {
            columnId: 'type',
            title: t('assets.table.typeFilter'),
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
                  {t('assets.table.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} entityName={t('assets.table.entityName')}>
        {(() => {
          const selectedRows = table.getFilteredSelectedRowModel().rows
          const selectedAssets = selectedRows.map((row) => row.original as Asset)

          const csvHeaders = [
            t('assets.table.csvHeaders.name'),
            t('assets.table.csvHeaders.type'),
            t('assets.table.csvHeaders.symbol'),
            t('assets.table.csvHeaders.quantity'),
            t('assets.table.csvHeaders.price'),
            t('assets.table.csvHeaders.total'),
          ]

          const handleBulkExport = () => {
            try {
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
                csvHeaders.join(','),
                ...rows
              ].join('\n')

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `${t('assets.table.exportFileName')}-${new Date().toISOString().split('T')[0]}.csv`
              link.click()
              URL.revokeObjectURL(url)

              const assetWord = selectedAssets.length === 1 ? t('assets.table.assetSingular') : t('assets.table.assetPlural')
              const exportedWord = selectedAssets.length === 1 ? t('assets.table.exportedSingular') : t('assets.table.exportedPlural')
              toast.success(`${selectedAssets.length} ${assetWord} ${exportedWord}`)
              table.resetRowSelection()
            } catch (error) {
              toast.error(t('assets.table.exportError'))
              console.error('Error exporting assets:', error)
            }
          }

          const handleBulkDelete = () => {
            const assetWord = selectedAssets.length === 1 ? t('assets.table.assetSingular') : t('assets.table.assetPlural')
            if (!confirm(`${t('assets.table.deleteConfirmPrefix')} ${selectedAssets.length} ${assetWord}?`)) {
              return
            }

            const idsToRemove = new Set(selectedAssets.map((asset) => asset.id))
            queryClient.setQueryData<Asset[]>(['assets'], (old = []) =>
              old.filter((asset) => !idsToRemove.has(asset.id))
            )

            toast.success(
              `${selectedAssets.length} ${assetWord} ${
                selectedAssets.length === 1 ? t('assets.table.deletedSingular') : t('assets.table.deletedPlural')
              }`
            )
            table.resetRowSelection()
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
                    aria-label={t('assets.table.exportSelected')}
                    title={t('assets.table.exportSelected')}
                  >
                    <Download className='h-4 w-4' />
                    <span className='sr-only'>{t('assets.table.exportSelected')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('assets.table.exportSelected')}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={handleBulkDelete}
                    className='size-8 text-destructive hover:text-destructive'
                    aria-label={t('assets.table.deleteSelected')}
                    title={t('assets.table.deleteSelected')}
                  >
                    <Trash2 className='h-4 w-4' />
                    <span className='sr-only'>{t('assets.table.deleteSelected')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('assets.table.deleteSelected')}</p>
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
  const { t } = useLanguage()
  // Agrupar activos por tipo
  const investmentAssets: Asset[] = []
  const realEstateAssets: Asset[] = []
  const derivativesAssets: Asset[] = []
  const accountsAssets: Asset[] = []

  data.forEach(asset => {
    const category = getAssetCategory(asset.type)
    if (category === 'Efectivo y depósitos' || category === 'Planes de pensiones') {
      accountsAssets.push(asset)
    } else if (category === 'Derivados') {
      derivativesAssets.push(asset)
    } else if (category === 'Inmobiliario') {
      realEstateAssets.push(asset)
    } else {
      investmentAssets.push(asset)
    }
  })

  return (
    <div className='space-y-8'>
      {investmentAssets.length > 0 && (
        <div className='rounded-2xl border bg-card p-4 shadow-sm'>
          <SingleTable
            data={investmentAssets}
            columns={investmentColumns}
            search={search}
            navigate={navigate}
            title={t('assets.table.sections.investments')}
          />
        </div>
      )}
      
      {realEstateAssets.length > 0 && (
        <div className='rounded-2xl border bg-card p-4 shadow-sm'>
          <SingleTable
            data={realEstateAssets}
            columns={realEstateColumns}
            search={search}
            navigate={navigate}
            title={t('assets.table.sections.realEstate')}
          />
        </div>
      )}

      {derivativesAssets.length > 0 && (
        <div className='rounded-2xl border bg-card p-4 shadow-sm'>
          <SingleTable
            data={derivativesAssets}
            columns={derivativesColumns}
            search={search}
            navigate={navigate}
            title={t('assets.table.sections.derivatives')}
          />
        </div>
      )}

      {accountsAssets.length > 0 && (
        <div className='rounded-2xl border bg-card p-4 shadow-sm'>
          <SingleTable
            data={accountsAssets}
            columns={accountsColumns}
            search={search}
            navigate={navigate}
            title={t('assets.table.sections.cash')}
          />
        </div>
      )}
      
      {investmentAssets.length === 0 && realEstateAssets.length === 0 && derivativesAssets.length === 0 && accountsAssets.length === 0 && (
        <div className='text-center py-12 text-muted-foreground'>
          {t('assets.table.emptyState')}
        </div>
      )}
    </div>
  )
}

