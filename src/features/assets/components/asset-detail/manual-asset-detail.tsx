import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/context/language-provider'
import { cn } from '@/lib/utils'
import {
  AssetType,
  type Asset,
  type RealEstateAsset,
  type SavingsAccountAsset,
  type TermDepositAsset,
  type CheckingAccountAsset,
  type PreciousMetalAsset,
  type CommodityAsset,
  type PensionPlanAsset,
} from '../../types'

type ManualAsset =
  | RealEstateAsset
  | SavingsAccountAsset
  | TermDepositAsset
  | CheckingAccountAsset
  | PreciousMetalAsset
  | CommodityAsset
  | PensionPlanAsset

const DEFAULT_INFLATION = 0.035
const DEFAULT_YEARS = 3

const formatCurrency = (value?: number, currency = 'EUR') => {
  if (value === undefined || Number.isNaN(value)) return '―'
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  })
}

const formatPercent = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return '―'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

interface ManualAssetMetrics {
  currency: string
  invested?: number
  baseInvested?: number
  expensesTotal: number
  currentValue?: number
  gainLoss?: number
  roiPercent?: number
  monthlyCashflow?: number
  inflationRate: number
  years: number
  inflationTarget?: number
  inflationGapPercent?: number
  riskLevel: 'low' | 'medium' | 'high'
}

const buildManualAssetMetrics = (asset: ManualAsset): ManualAssetMetrics => {
  const currency = asset.currency || 'EUR'
  let baseInvested: number | undefined
  let currentValue: number | undefined
  let monthlyCashflow: number | undefined
  let riskLevel: ManualAssetMetrics['riskLevel'] = 'medium'
  let years = DEFAULT_YEARS
  const expensesTotal = (asset.initialExpenses ?? []).reduce(
    (sum, entry) => sum + (entry?.amount ?? 0),
    0
  )

  switch (asset.type) {
    case AssetType.REAL_ESTATE: {
      baseInvested = asset.purchasePrice ?? asset.price
      currentValue = asset.price ?? asset.purchasePrice
      if (asset.rentalYield && currentValue) {
        monthlyCashflow = (currentValue * asset.rentalYield) / 100 / 12
      }
      riskLevel = 'medium'
      years = 5
      break
    }
    case AssetType.SAVINGS_ACCOUNT: {
      baseInvested = asset.initialAmount ?? 0
      currentValue = asset.initialAmount
      if (asset.interestRate && asset.initialAmount) {
        monthlyCashflow = (asset.initialAmount * asset.interestRate) / 100 / 12
      }
      riskLevel = 'low'
      years = 1
      break
    }
    case AssetType.TERM_DEPOSIT: {
      baseInvested = asset.initialAmount ?? 0
      const baseAmount = asset.initialAmount ?? 0
      const yearsToMaturity = asset.maturityDate
        ? Math.max(
            0.25,
            (asset.maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)
          )
        : DEFAULT_YEARS
      currentValue = baseAmount + (baseAmount * (asset.interestRate ?? 0) * yearsToMaturity) / 100
      monthlyCashflow = (baseAmount * (asset.interestRate ?? 0)) / 100 / 12
      years = yearsToMaturity
      riskLevel = 'low'
      break
    }
    case AssetType.CHECKING_ACCOUNT: {
      baseInvested = asset.balance ?? 0
      currentValue = asset.balance
      riskLevel = 'low'
      years = 0.5
      break
    }
    case AssetType.PRECIOUS_METAL: {
      baseInvested = asset.purchasePrice ?? asset.price
      currentValue = asset.price ?? asset.purchasePrice
      riskLevel = 'medium'
      years = 4
      break
    }
    case AssetType.COMMODITY: {
      const quantity = asset.contractSize ?? 1
      baseInvested = asset.purchasePrice ?? (asset.price ? asset.price * quantity : undefined)
      currentValue = asset.price ? asset.price * quantity : asset.purchasePrice
      riskLevel = 'medium'
      years = 2
      break
    }
    case AssetType.PENSION_PLAN: {
      baseInvested = asset.annualContribution ? asset.annualContribution * 3 : asset.price
      currentValue = asset.price ?? baseInvested
      if (asset.annualContribution) {
        monthlyCashflow = asset.annualContribution / 12
      }
      riskLevel = 'medium'
      years = 10
      break
    }
    default:
      break
  }

  const invested =
    baseInvested !== undefined || currentValue !== undefined
      ? (baseInvested ?? currentValue ?? 0) + expensesTotal
      : undefined

  const gainLoss =
    invested !== undefined && currentValue !== undefined
      ? currentValue - invested
      : undefined
  const roiPercent =
    gainLoss !== undefined && invested
      ? (gainLoss / invested) * 100
      : undefined

  const inflationTarget =
    invested !== undefined
      ? invested * Math.pow(1 + DEFAULT_INFLATION, years)
      : undefined
  const inflationGapPercent =
    inflationTarget && currentValue
      ? ((currentValue - inflationTarget) / inflationTarget) * 100
      : undefined

  return {
    currency,
    invested,
    baseInvested,
    expensesTotal,
    currentValue,
    gainLoss,
    roiPercent,
    monthlyCashflow,
    inflationRate: DEFAULT_INFLATION,
    years,
    inflationTarget,
    inflationGapPercent,
    riskLevel,
  }
}

type InfoRow = { label: string; value: string }

const buildInfoRows = (asset: ManualAsset, t: (key: string) => string): InfoRow[] => {
  const rows: InfoRow[] = []

  if (asset.type === AssetType.REAL_ESTATE) {
    if (asset.location) rows.push({ label: t('assets.detail.manual.fields.location'), value: asset.location })
    if (asset.propertyType)
      rows.push({
        label: t('assets.detail.manual.fields.propertyType'),
        value: asset.propertyType,
      })
    if (asset.squareMeters)
      rows.push({
        label: t('assets.detail.manual.fields.squareMeters'),
        value: `${asset.squareMeters} m²`,
      })
    if (asset.rentalYield !== undefined)
      rows.push({
        label: t('assets.detail.manual.fields.rentalYield'),
        value: formatPercent(asset.rentalYield),
      })
    if (asset.purchasePrice !== undefined)
      rows.push({
        label: t('assets.detail.manual.fields.purchasePrice'),
        value: formatCurrency(asset.purchasePrice, asset.currency),
      })
  }

  if (asset.type === AssetType.SAVINGS_ACCOUNT || asset.type === AssetType.CHECKING_ACCOUNT) {
    rows.push({ label: t('assets.detail.manual.fields.bankName'), value: asset.bankName })
    if (asset.accountNumber)
      rows.push({
        label: t('assets.detail.manual.fields.accountNumber'),
        value: asset.accountNumber,
      })
    if ('interestRate' in asset && asset.interestRate !== undefined) {
      rows.push({
        label: t('assets.detail.manual.fields.interestRate'),
        value: formatPercent(asset.interestRate),
      })
    }
  }

  if (asset.type === AssetType.TERM_DEPOSIT) {
    rows.push({ label: t('assets.detail.manual.fields.bankName'), value: asset.bankName })
    if (asset.depositType)
      rows.push({
        label: t('assets.detail.manual.fields.depositType'),
        value: t(`assets.detail.manual.fields.depositTypes.${asset.depositType}`),
      })
    if (asset.maturityDate)
      rows.push({
        label: t('assets.detail.manual.fields.maturityDate'),
        value: asset.maturityDate.toLocaleDateString(),
      })
    if (asset.interestRate !== undefined)
      rows.push({
        label: t('assets.detail.manual.fields.interestRate'),
        value: formatPercent(asset.interestRate),
      })
  }

  if (asset.type === AssetType.PRECIOUS_METAL) {
    rows.push({ label: t('assets.detail.manual.fields.metalType'), value: asset.metalType })
    rows.push({ label: t('assets.detail.manual.fields.weight'), value: `${asset.weight} ${asset.unit}` })
    if (asset.purity !== undefined)
      rows.push({
        label: t('assets.detail.manual.fields.purity'),
        value: formatPercent(asset.purity),
      })
    if (asset.storageLocation)
      rows.push({
        label: t('assets.detail.manual.fields.storageLocation'),
        value: asset.storageLocation,
      })
  }

  if (asset.type === AssetType.COMMODITY) {
    rows.push({
      label: t('assets.detail.manual.fields.commodityType'),
      value: t(`assets.detail.manual.fields.commodityTypes.${asset.commodityType ?? 'other'}`),
    })
    if (asset.contractSize !== undefined && asset.unit)
      rows.push({
        label: t('assets.detail.manual.fields.contractSize'),
        value: `${asset.contractSize} ${asset.unit}`,
      })
    if (asset.storageLocation)
      rows.push({
        label: t('assets.detail.manual.fields.storageLocation'),
        value: asset.storageLocation,
      })
  }

  if (asset.type === AssetType.PENSION_PLAN) {
    rows.push({
      label: t('assets.detail.manual.fields.planType'),
      value: t(`assets.detail.manual.fields.planTypes.${asset.planType}`),
    })
    if (asset.provider)
      rows.push({
        label: t('assets.detail.manual.fields.provider'),
        value: asset.provider,
      })
    if (asset.riskProfile)
      rows.push({
        label: t('assets.detail.manual.fields.riskProfile'),
        value: asset.riskProfile,
      })
    if (asset.annualContribution !== undefined)
      rows.push({
        label: t('assets.detail.manual.fields.annualContribution'),
        value: formatCurrency(asset.annualContribution, asset.currency),
      })
    if (asset.expectedReturn !== undefined)
      rows.push({
        label: t('assets.detail.manual.fields.expectedReturn'),
        value: formatPercent(asset.expectedReturn),
      })
  }

  return rows
}

const buildSeries = (metrics: ManualAssetMetrics) => {
  const start =
    metrics.invested ??
    metrics.currentValue ??
    1
  const end = metrics.currentValue ?? start
  const inflationEnd = metrics.inflationTarget ?? start
  const points = 6

  const assetSeries = Array.from({ length: points }, (_, idx) => {
    const progress = idx / (points - 1)
    return start + (end - start) * progress
  })

  const inflationSeries = Array.from({ length: points }, (_, idx) => {
    const progress = idx / (points - 1)
    return start + (inflationEnd - start) * progress
  })

  return { assetSeries, inflationSeries }
}

const MiniTrendChart = ({
  assetSeries,
  inflationSeries,
}: {
  assetSeries: number[]
  inflationSeries: number[]
}) => {
  const allValues = [...assetSeries, ...inflationSeries]
  const max = Math.max(...allValues)
  const min = Math.min(...allValues)
  const range = max - min || 1

  const toPoints = (series: number[]) =>
    series
      .map((value, idx) => {
        const x = (idx / (series.length - 1 || 1)) * 100
        const y = 100 - ((value - min) / range) * 100
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')

  return (
    <svg viewBox='0 0 100 100' preserveAspectRatio='none' className='h-36 w-full rounded-md bg-muted/30'>
      <polyline
        points={toPoints(inflationSeries)}
        fill='none'
        stroke='hsl(var(--muted-foreground))'
        strokeWidth={1.5}
        strokeDasharray='4 2'
        opacity={0.7}
      />
      <polyline
        points={toPoints(assetSeries)}
        fill='none'
        stroke='hsl(var(--primary))'
        strokeWidth={2}
      />
    </svg>
  )
}

const SummaryCard = ({
  label,
  value,
  helper,
  accent,
}: {
  label: string
  value: string
  helper?: string
  accent?: 'positive' | 'negative' | 'neutral'
}) => (
  <Card>
    <CardHeader className='pb-2'>
      <CardDescription>{label}</CardDescription>
      <CardTitle className='text-2xl'>{value}</CardTitle>
      {helper && (
        <p
          className={cn(
            'text-sm',
            accent === 'positive' && 'text-emerald-600 dark:text-emerald-400',
            accent === 'negative' && 'text-red-600 dark:text-red-400',
            accent === 'neutral' && 'text-muted-foreground'
          )}
        >
          {helper}
        </p>
      )}
    </CardHeader>
  </Card>
)

export function ManualAssetDetail({ asset }: { asset: ManualAsset }) {
  const { t } = useLanguage()
  const metrics = useMemo(() => buildManualAssetMetrics(asset), [asset])
  const infoRows = useMemo(() => buildInfoRows(asset, t), [asset, t])
  const { assetSeries, inflationSeries } = useMemo(() => buildSeries(metrics), [metrics])

  const riskLabels: Record<ManualAssetMetrics['riskLevel'], string> = {
    low: t('assets.detail.manual.risk.low'),
    medium: t('assets.detail.manual.risk.medium'),
    high: t('assets.detail.manual.risk.high'),
  }

  const handleExport = () => {
    const payload = {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      initialExpenses: asset.initialExpenses,
      metrics,
      info: infoRows,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${asset.name.replace(/\s+/g, '-').toLowerCase()}-detalle.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <SummaryCard
          label={t('assets.detail.manual.summary.currentValue')}
          value={formatCurrency(metrics.currentValue, metrics.currency)}
          helper={
            metrics.gainLoss !== undefined
              ? `${formatCurrency(metrics.gainLoss, metrics.currency)} (${formatPercent(metrics.roiPercent)})`
              : undefined
          }
          accent={metrics.gainLoss && metrics.gainLoss >= 0 ? 'positive' : 'negative'}
        />
        <SummaryCard
          label={t('assets.detail.manual.summary.invested')}
          value={formatCurrency(metrics.invested, metrics.currency)}
          helper={metrics.invested ? t('assets.detail.manual.summary.holdingPeriod', { years: metrics.years.toFixed(1) }) : undefined}
          accent='neutral'
        />
        <SummaryCard
          label={t('assets.detail.manual.summary.expenses')}
          value={formatCurrency(metrics.expensesTotal, metrics.currency)}
          helper={t('assets.detail.manual.summary.expensesHelper')}
          accent={metrics.expensesTotal ? 'negative' : 'neutral'}
        />
        <SummaryCard
          label={t('assets.detail.manual.summary.cashflow')}
          value={
            metrics.monthlyCashflow !== undefined
              ? formatCurrency(metrics.monthlyCashflow, metrics.currency)
              : '―'
          }
          helper={
            metrics.monthlyCashflow
              ? t('assets.detail.manual.summary.monthly')
              : t('assets.detail.manual.summary.noCashflow')
          }
          accent={metrics.monthlyCashflow ? 'positive' : 'neutral'}
        />
        <SummaryCard
          label={t('assets.detail.manual.summary.inflationGap')}
          value={formatPercent(metrics.inflationGapPercent)}
          helper={t('assets.detail.manual.summary.inflationHelper')}
          accent={
            metrics.inflationGapPercent && metrics.inflationGapPercent >= 0 ? 'positive' : 'negative'
          }
        />
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>{t('assets.detail.manual.chart.title')}</CardTitle>
            <CardDescription>
              {t('assets.detail.manual.chart.description', {
                rate: (metrics.inflationRate * 100).toFixed(1),
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MiniTrendChart assetSeries={assetSeries} inflationSeries={inflationSeries} />
            <div className='mt-4 flex flex-wrap gap-4 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-6 rounded-full bg-primary' />
                <span>{t('assets.detail.manual.chart.legend.asset')}</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-2 w-6 rounded-full bg-muted-foreground/60' />
                <span>{t('assets.detail.manual.chart.legend.inflation')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('assets.detail.manual.insights.title')}</CardTitle>
            <CardDescription>{t('assets.detail.manual.insights.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-xs uppercase text-muted-foreground tracking-wide'>
                {t('assets.detail.manual.insights.risk')}
              </p>
              <div className='mt-1 flex items-center gap-2'>
                <Badge variant='secondary'>{riskLabels[metrics.riskLevel]}</Badge>
                {metrics.roiPercent !== undefined && (
                  <span className='text-sm text-muted-foreground'>
                    {formatPercent(metrics.roiPercent)} {t('assets.detail.manual.insights.annualised')}
                  </span>
                )}
              </div>
            </div>
            <Separator />
            <div className='space-y-1 text-sm'>
              <p className='font-medium'>
                {metrics.inflationGapPercent !== undefined &&
                metrics.inflationGapPercent >= 0
                  ? t('assets.detail.manual.insights.aboveInflation')
                  : t('assets.detail.manual.insights.belowInflation')}
              </p>
              <p className='text-muted-foreground'>
                {t('assets.detail.manual.insights.guidance')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('assets.detail.manual.details.title')}</CardTitle>
          <CardDescription>{t('assets.detail.manual.details.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2'>
            {infoRows.map((row) => (
              <div key={`${row.label}-${row.value}`}>
                <p className='text-sm text-muted-foreground'>{row.label}</p>
                <p className='font-medium'>{row.value}</p>
              </div>
            ))}
            <div>
              <p className='text-sm text-muted-foreground'>ID</p>
              <p className='font-medium'>{asset.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {asset.initialExpenses && asset.initialExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('assets.detail.manual.expenses.title')}</CardTitle>
            <CardDescription>{t('assets.detail.manual.expenses.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            {asset.initialExpenses.map((expense, index) => (
              <div key={`${expense.label}-${index}`} className='flex items-center justify-between'>
                <span>{expense.label || t('assets.detail.manual.expenses.unnamed')}</span>
                <span className='font-medium'>
                  {formatCurrency(expense.amount, metrics.currency)}
                </span>
              </div>
            ))}
            <Separator className='my-2' />
            <div className='flex items-center justify-between font-semibold'>
              <span>{t('assets.detail.manual.expenses.total')}</span>
              <span>{formatCurrency(metrics.expensesTotal, metrics.currency)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm text-muted-foreground'>
          {t('assets.detail.manual.exportHelper')}
        </p>
        <Button variant='outline' onClick={handleExport}>
          <Download className='mr-2 h-4 w-4' />
          {t('assets.detail.manual.export')}
        </Button>
      </div>
    </div>
  )
}

export type { ManualAsset }


