import { useMemo, useEffect, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import {
  Activity,
  Download,
  PiggyBank,
  ReceiptText,
  ShieldHalf,
  TrendingUp,
  Wallet2,
  type LucideIcon,
} from 'lucide-react'
import type { LineData } from 'lightweight-charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/context/language-provider'
import { cn } from '@/lib/utils'
import { AssetTypeBadge } from '../../utils/asset-helpers'
import { ManualAssetPerformanceChart } from './manual-asset-performance-chart'
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

const buildSeries = (metrics: ManualAssetMetrics): { investedSeries: LineData[]; inflationSeries: LineData[] } => {
  // Siempre generar datos válidos, incluso si no hay métricas
  const baseValue = Math.max(
    metrics.baseInvested ?? metrics.invested ?? metrics.currentValue ?? 10000,
    1000
  )
  const currentValue = Math.max(metrics.currentValue ?? baseValue * 1.05, baseValue)
  const investedStart = baseValue
  const investedEnd = currentValue
  
  const inflationStart = investedStart
  const years = Math.max(metrics.years || DEFAULT_YEARS, 1)
  const inflationRate = metrics.inflationRate || DEFAULT_INFLATION
  const inflationEnd = Math.max(
    metrics.inflationTarget ??
    inflationStart * Math.pow(1 + inflationRate, years),
    inflationStart * 1.05 // Mínimo 5% de crecimiento para visualización
  )
  
  // Generar datos mensuales - 24 meses para mayor detalle
  const months = Math.max(Math.ceil(years * 12), 24) // Mínimo 24 meses, o según los años
  const now = new Date()

  const toISODate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Serie de lo invertido/valor actual - datos mensuales
  const investedSeries: LineData[] = Array.from({ length: months }, (_, idx) => {
    const date = new Date(now)
    date.setMonth(date.getMonth() - (months - idx - 1))
    // Asegurar que la fecha sea válida
    if (isNaN(date.getTime())) {
      date.setTime(now.getTime() - (months - idx - 1) * 30 * 24 * 60 * 60 * 1000)
    }
    const progress = idx / Math.max(months - 1, 1)
    // Interpolación lineal con pequeña variación mensual para hacerlo más realista
    const baseProgress = investedStart + (investedEnd - investedStart) * progress
    // Variación más suave para datos mensuales
    const variation = Math.sin(progress * Math.PI * 2) * (investedEnd - investedStart) * 0.01
    const value = Math.max(baseProgress + variation, investedStart * 0.95)
    const timeStr = toISODate(date)
    return {
      time: timeStr,
      value: Number(value.toFixed(2)),
    } as LineData
  })

  // Serie de inflación - datos mensuales
  const inflationSeries: LineData[] = Array.from({ length: months }, (_, idx) => {
    const date = new Date(now)
    date.setMonth(date.getMonth() - (months - idx - 1))
    // Asegurar que la fecha sea válida
    if (isNaN(date.getTime())) {
      date.setTime(now.getTime() - (months - idx - 1) * 30 * 24 * 60 * 60 * 1000)
    }
    const progress = idx / Math.max(months - 1, 1)
    // Crecimiento exponencial mensual de inflación
    const monthlyRate = Math.pow(1 + inflationRate, 1 / 12) - 1
    const value = inflationStart * Math.pow(1 + monthlyRate, idx)
    const timeStr = toISODate(date)
    return {
      time: timeStr,
      value: Number(value.toFixed(2)),
    } as LineData
  })
  
  return { investedSeries, inflationSeries }
}

type StatTone = 'positive' | 'negative' | 'neutral'

const HighlightCard = ({
  label,
  value,
  helper,
  tone = 'neutral',
  icon: Icon,
}: {
  label: string
  value: string
  helper?: string
  tone?: StatTone
  icon: LucideIcon
}) => (
  <div className='rounded-lg border border-border/60 bg-card/40 p-3 shadow-sm transition-colors'>
    <div className='flex items-center justify-between'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground'>{label}</p>
      <span
          className={cn(
          'rounded-full border p-1.5 text-xs',
          tone === 'positive' && 'border-emerald-200/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          tone === 'negative' && 'border-red-200/40 bg-red-500/10 text-red-600 dark:text-red-400',
          tone === 'neutral' && 'border-border/60 bg-muted/20 text-muted-foreground'
        )}
      >
        <Icon className='h-3.5 w-3.5' />
      </span>
    </div>
    <p className='mt-1.5 text-xl font-semibold leading-tight tracking-tight'>{value}</p>
    {helper && <p className='text-xs text-muted-foreground mt-0.5'>{helper}</p>}
  </div>
)

export function ManualAssetDetail({ asset, onExport, onExportReady }: { asset: ManualAsset; onExport?: () => void; onExportReady?: (pdfHandler: () => void, jsonHandler: () => void) => void }) {
  const { t } = useLanguage()
  const metrics = useMemo(() => buildManualAssetMetrics(asset), [asset])
  const infoRows = useMemo(() => buildInfoRows(asset, t), [asset, t])
  const { investedSeries, inflationSeries } = useMemo(() => buildSeries(metrics), [metrics])
  const [chartColors, setChartColors] = useState<{ assetColor: string; inflationColor: string } | null>(null)

  const riskLabels: Record<ManualAssetMetrics['riskLevel'], string> = {
    low: t('assets.detail.manual.risk.low'),
    medium: t('assets.detail.manual.risk.medium'),
    high: t('assets.detail.manual.risk.high'),
  }

  const riskTone: StatTone =
    metrics.riskLevel === 'high' ? 'negative' : metrics.riskLevel === 'low' ? 'positive' : 'neutral'

  const statCards = useMemo(
    () => [
      {
        label: t('assets.detail.manual.summary.currentValue'),
        value: formatCurrency(metrics.currentValue, metrics.currency),
        helper:
          metrics.gainLoss !== undefined
            ? `${formatCurrency(metrics.gainLoss, metrics.currency)} (${formatPercent(metrics.roiPercent)})`
            : undefined,
        tone:
          metrics.gainLoss === undefined
            ? 'neutral'
            : metrics.gainLoss >= 0
              ? 'positive'
              : 'negative',
        icon: TrendingUp,
      },
      {
        label: t('assets.detail.manual.summary.invested'),
        value: formatCurrency(metrics.invested, metrics.currency),
        helper: metrics.invested
          ? t('assets.detail.manual.summary.holdingPeriod', { years: metrics.years.toFixed(1) })
          : undefined,
        tone: 'neutral' as StatTone,
        icon: Wallet2,
      },
      {
        label: t('assets.detail.manual.summary.expenses'),
        value: formatCurrency(metrics.expensesTotal, metrics.currency),
        helper: t('assets.detail.manual.summary.expensesHelper'),
        tone: metrics.expensesTotal ? 'negative' : 'neutral',
        icon: ReceiptText,
      },
      {
        label: t('assets.detail.manual.summary.cashflow'),
        value:
          metrics.monthlyCashflow !== undefined
            ? formatCurrency(metrics.monthlyCashflow, metrics.currency)
            : '―',
        helper:
          metrics.monthlyCashflow && metrics.monthlyCashflow > 0
            ? t('assets.detail.manual.summary.monthly')
            : t('assets.detail.manual.summary.noCashflow'),
        tone: metrics.monthlyCashflow && metrics.monthlyCashflow > 0 ? 'positive' : 'neutral',
        icon: PiggyBank,
      },
      {
        label: t('assets.detail.manual.summary.inflationGap'),
        value: formatPercent(metrics.inflationGapPercent),
        helper: t('assets.detail.manual.summary.inflationHelper'),
        tone:
          metrics.inflationGapPercent === undefined
            ? 'neutral'
            : metrics.inflationGapPercent >= 0
              ? 'positive'
              : 'negative',
        icon: ShieldHalf,
      },
    ],
    [metrics, t]
  )

  const infoColumns = useMemo(() => {
    if (!infoRows.length) {
      return []
    }
    if (infoRows.length <= 6) {
      return [infoRows]
    }
    const midpoint = Math.ceil(infoRows.length / 2)
    return [infoRows.slice(0, midpoint), infoRows.slice(midpoint)]
  }, [infoRows])

  const hasExpenses = Boolean(asset.initialExpenses && asset.initialExpenses.length > 0)

  const contentRef = useRef<HTMLDivElement>(null)

  const handleExportPDF = useMemo(() => async () => {
    if (!contentRef.current) return

    try {
      // Interceptar y reemplazar todas las hojas de estilo con oklch
      const styleSheets = Array.from(document.styleSheets)
      const originalRules: string[] = []
      
      styleSheets.forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || [])
          rules.forEach((rule) => {
            if (rule.cssText.includes('oklch')) {
              originalRules.push(rule.cssText)
            }
          })
        } catch (e) {
          // Ignorar errores de CORS
        }
      })
      
      // Capturar el contenido como imagen con manejo de oklch
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: false,
        onclone: (clonedDoc) => {
          // Reemplazar todas las variables CSS oklch con RGB
          const style = clonedDoc.createElement('style')
          style.textContent = `
            :root {
              --background: rgb(255, 255, 255) !important;
              --foreground: rgb(15, 23, 42) !important;
              --card: rgb(249, 250, 251) !important;
              --card-foreground: rgb(15, 23, 42) !important;
              --popover: rgb(255, 255, 255) !important;
              --popover-foreground: rgb(15, 23, 42) !important;
              --primary: rgb(15, 23, 42) !important;
              --primary-foreground: rgb(255, 255, 255) !important;
              --secondary: rgb(249, 250, 251) !important;
              --secondary-foreground: rgb(15, 23, 42) !important;
              --muted: rgb(249, 250, 251) !important;
              --muted-foreground: rgb(107, 114, 128) !important;
              --accent: rgb(249, 250, 251) !important;
              --accent-foreground: rgb(15, 23, 42) !important;
              --destructive: rgb(239, 68, 68) !important;
              --border: rgb(229, 231, 235) !important;
              --input: rgb(229, 231, 235) !important;
              --ring: rgb(59, 130, 246) !important;
            }
            * {
              color-scheme: light !important;
            }
            /* Convertir colores específicos de Tailwind a RGB */
            .bg-red-50, [class*="bg-red-50"] {
              background-color: rgb(254, 242, 242) !important;
            }
            .bg-red-950, [class*="bg-red-950"] {
              background-color: rgb(30, 0, 0) !important;
            }
            .bg-emerald-500, [class*="bg-emerald-500"] {
              background-color: rgb(16, 185, 129) !important;
            }
            .bg-amber-500, [class*="bg-amber-500"] {
              background-color: rgb(245, 158, 11) !important;
            }
            .text-red-700, [class*="text-red-700"] {
              color: rgb(185, 28, 28) !important;
            }
            .text-red-300, [class*="text-red-300"] {
              color: rgb(252, 165, 165) !important;
            }
            .text-emerald-700, [class*="text-emerald-700"] {
              color: rgb(4, 120, 87) !important;
            }
            .text-muted-foreground, [class*="text-muted"] {
              color: rgb(107, 114, 128) !important;
            }
            .border-red-200, [class*="border-red-200"] {
              border-color: rgb(254, 202, 202) !important;
            }
            .border-red-800, [class*="border-red-800"] {
              border-color: rgb(153, 27, 27) !important;
            }
          `
          clonedDoc.head.insertBefore(style, clonedDoc.head.firstChild)
        },
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Convertir píxeles a mm (1px = 0.264583mm a 96dpi)
      const pxToMm = 0.264583
      const imgWidthMm = imgWidth * pxToMm
      const imgHeightMm = imgHeight * pxToMm
      
      // Calcular ratio para ajustar a la página
      const ratio = Math.min(pdfWidth / imgWidthMm, pdfHeight / imgHeightMm)
      const imgScaledWidth = imgWidthMm * ratio
      const imgScaledHeight = imgHeightMm * ratio
      const marginX = (pdfWidth - imgScaledWidth) / 2
      let marginY = (pdfHeight - imgScaledHeight) / 2

      // Agregar primera página
      pdf.addImage(imgData, 'PNG', marginX, marginY, imgScaledWidth, imgScaledHeight)

      // Si el contenido es más alto que una página, agregar páginas adicionales
      let heightLeft = imgScaledHeight - (pdfHeight - marginY * 2)
      
      while (heightLeft > 0) {
        pdf.addPage()
        marginY = -heightLeft
        pdf.addImage(imgData, 'PNG', marginX, marginY, imgScaledWidth, imgScaledHeight)
        heightLeft -= pdfHeight
      }

      pdf.save(`${asset.name.replace(/\s+/g, '-').toLowerCase()}-detalle.pdf`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert(`Error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta exportar como JSON.`)
    }
  }, [asset, metrics, infoRows])

  const handleExportJSON = useMemo(() => () => {
    const payload = {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      description: asset.description,
      currency: asset.currency,
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
  }, [asset, metrics, infoRows])

  // Exponer handlers al componente padre
  useEffect(() => {
    if (onExportReady) {
      onExportReady(handleExportPDF, handleExportJSON)
    }
  }, [handleExportPDF, handleExportJSON, onExportReady])

  // Mantener compatibilidad con onExport (usará PDF por defecto)
  const exportHandler = onExport || handleExportPDF

  return (
    <div ref={contentRef} className='space-y-6 bg-background'>
      {/* Cards al principio */}
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        {statCards.map((card) => (
          <HighlightCard key={card.label} {...card} />
        ))}
      </div>

      {/* Información General y Técnica - Compacta y Reorganizada */}
      {infoRows.length > 0 && (
        <Card className='border-border/70 shadow-sm'>
          <CardHeader className='pb-2 pt-3 px-4'>
            <div className='flex items-center justify-between gap-3'>
              <CardTitle className='text-base font-semibold'>Información del Activo</CardTitle>
              <div className='flex flex-wrap gap-1.5 shrink-0'>
                <AssetTypeBadge type={asset.type} className='text-xs' />
                <Badge 
                  variant='outline' 
                  className={cn(
                    'text-xs px-1.5 py-0 font-semibold',
                    metrics.riskLevel === 'low' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
                    metrics.riskLevel === 'medium' && 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
                    metrics.riskLevel === 'high' && 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                  )}
                >
                  {riskLabels[metrics.riskLevel]}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0 pb-3 px-4'>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2.5'>
              {infoRows.map((row) => (
                <div key={`${row.label}-${row.value}`} className='min-w-0'>
                  <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground leading-tight truncate'>{row.label}</p>
                  <p className='text-sm font-semibold text-foreground leading-tight mt-0.5 truncate' title={row.value}>{row.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfica con insights a la izquierda */}
      <div className='grid gap-4 lg:grid-cols-12'>
        <Card className='lg:col-span-4 border-border/70 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>{t('assets.detail.manual.insights.title')}</CardTitle>
            <CardDescription className='text-xs'>{t('assets.detail.manual.insights.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-xs uppercase text-muted-foreground tracking-wide'>
                {t('assets.detail.manual.insights.risk')}
              </p>
              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  className={cn(
                    'font-semibold',
                    metrics.riskLevel === 'low' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
                    metrics.riskLevel === 'medium' && 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
                    metrics.riskLevel === 'high' && 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                  )}
                >
                  {riskLabels[metrics.riskLevel]}
                </Badge>
                {metrics.roiPercent !== undefined && (
                  <span className='text-sm text-muted-foreground'>
                    {formatPercent(metrics.roiPercent)} {t('assets.detail.manual.insights.annualised')}
                  </span>
                )}
              </div>
            </div>

            <div className={cn(
              'rounded-lg border p-3 text-sm',
              metrics.inflationGapPercent !== undefined && metrics.inflationGapPercent < 0
                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                : 'bg-muted/20 border-border/70'
            )}>
              <div className='flex items-center justify-between font-medium'>
                <span className='text-sm'>
                  {metrics.inflationGapPercent !== undefined && metrics.inflationGapPercent >= 0
                  ? t('assets.detail.manual.insights.aboveInflation')
                  : t('assets.detail.manual.insights.belowInflation')}
                </span>
                <Badge 
                  variant='outline' 
                  className={cn(
                    'text-sm font-semibold px-2 py-0.5',
                    metrics.inflationGapPercent !== undefined && metrics.inflationGapPercent >= 0
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                  )}
                >
                  {formatPercent(metrics.inflationGapPercent)}
                </Badge>
              </div>
              <p className={cn(
                'mt-2 text-sm',
                metrics.inflationGapPercent !== undefined && metrics.inflationGapPercent < 0
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-muted-foreground'
              )}>
                {t('assets.detail.manual.insights.guidance')}
              </p>
              <div className='mt-3 grid grid-cols-2 gap-3'>
                <div>
                  <p className='text-xs text-muted-foreground mb-1'>
                    {t('assets.detail.manual.chart.legend.asset')}
                  </p>
                  <p className='font-semibold text-base'>
                    {formatCurrency(metrics.currentValue, metrics.currency)}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground mb-1'>
                    {t('assets.detail.manual.chart.legend.inflation')}
                  </p>
                  <p className='font-semibold text-base'>
                    {formatCurrency(metrics.inflationTarget, metrics.currency)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-8 border-border/70 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>Proyección vs Inflación</CardTitle>
            <CardDescription className='text-xs'>
              Comparación entre el valor del activo y la inflación acumulada
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ManualAssetPerformanceChart
              series={investedSeries}
              benchmark={inflationSeries}
              currency={metrics.currency}
              onColorsReady={setChartColors}
            />
            <div className='mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <span 
                  className='h-1.5 w-5 rounded-full' 
                  style={{ 
                    backgroundColor: chartColors?.assetColor || 'rgba(59,130,246,1)' 
                  }} 
                />
                <span>Invertido / Valor actual</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span 
                  className='h-1.5 w-5 rounded-full border border-dashed' 
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: chartColors?.inflationColor || 'rgba(148,163,184,0.8)'
                  }} 
                />
                <span>Inflación</span>
            </div>
              {metrics.roiPercent !== undefined && (
                <span className='flex items-center gap-1'>
                  <Activity className='h-2.5 w-2.5' />
                  {formatPercent(metrics.roiPercent)}
                </span>
              )}
          </div>
        </CardContent>
      </Card>
      </div>

      {hasExpenses && (
        <Card className='border-border/70 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>{t('assets.detail.manual.expenses.title')}</CardTitle>
            <CardDescription className='text-xs'>{t('assets.detail.manual.expenses.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            {asset.initialExpenses?.map((expense, index) => (
              <div
                key={`${expense.label}-${index}`}
                className='flex items-center justify-between rounded-lg border border-border/60 bg-muted/15 px-3 py-2'
              >
                <div>
                  <p className='text-sm font-medium'>
                    {expense.label || t('assets.detail.manual.expenses.unnamed')}
                  </p>
                  <p className='text-[10px] text-muted-foreground'>
                    {t('assets.detail.manual.summary.expenses')}
                  </p>
                </div>
                <p className='text-sm font-semibold'>
                  {formatCurrency(expense.amount, metrics.currency)}
                </p>
              </div>
            ))}
            <Separator />
            <div className='flex items-center justify-between text-sm font-semibold'>
              <span>{t('assets.detail.manual.expenses.total')}</span>
              <span>{formatCurrency(metrics.expensesTotal, metrics.currency)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export type { ManualAsset }


