import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { createChart, AreaSeries, LineSeries, LineStyle, ColorType, type LineData } from 'lightweight-charts'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/context/language-provider'
import { cn } from '@/lib/utils'
import { AssetTypeBadge, getAssetTypeLabel } from '../../utils/asset-helpers'
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
      const savingsAsset = asset as SavingsAccountAsset
      const amount: number = ('initialAmount' in savingsAsset && typeof savingsAsset.initialAmount === 'number') 
        ? savingsAsset.initialAmount 
        : (savingsAsset.price ?? 0)
      baseInvested = amount
      currentValue = amount
      if (savingsAsset.interestRate && amount) {
        monthlyCashflow = (amount * savingsAsset.interestRate) / 100 / 12
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
    // maturityDate se muestra como badge en el header, no aquí
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
  <div className='rounded-lg border border-border/60 bg-card/40 p-2 shadow-sm transition-colors'>
    <div className='flex items-center justify-between'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground'>{label}</p>
      <span
          className={cn(
          'rounded-full border p-1 text-xs',
          tone === 'positive' && 'border-emerald-200/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          tone === 'negative' && 'border-red-200/40 bg-red-500/10 text-red-600 dark:text-red-400',
          tone === 'neutral' && 'border-border/60 bg-muted/20 text-muted-foreground'
        )}
      >
        <Icon className='h-3 w-3' />
      </span>
    </div>
    <p className='mt-1 text-sm font-semibold leading-tight tracking-tight'>{value}</p>
    {helper && <p className='text-xs text-muted-foreground mt-0.5'>{helper}</p>}
  </div>
)

export function ManualAssetDetail({ asset, onExport, onExportReady }: { asset: ManualAsset; onExport?: () => void; onExportReady?: (pdfHandler: () => void, jsonHandler: () => void) => void }) {
  const { t } = useLanguage()
  const metrics = useMemo(() => buildManualAssetMetrics(asset), [asset])
  const infoRows = useMemo(() => buildInfoRows(asset, t), [asset, t])
  const { investedSeries, inflationSeries } = useMemo(() => buildSeries(metrics), [metrics])
  const [chartColors, setChartColors] = useState<{ assetColor: string; inflationColor: string } | null>(null)
  
  // Refs para mantener las series actualizadas sin causar re-renders
  const investedSeriesRef = useRef(investedSeries)
  const inflationSeriesRef = useRef(inflationSeries)
  
  useEffect(() => {
    investedSeriesRef.current = investedSeries
    inflationSeriesRef.current = inflationSeries
  }, [investedSeries, inflationSeries])

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
        tone: (
          metrics.gainLoss === undefined
            ? 'neutral'
            : metrics.gainLoss >= 0
              ? 'positive'
              : 'negative'
        ) as StatTone,
        icon: TrendingUp,
      },
      {
        label: t('assets.detail.manual.summary.invested'),
        value: formatCurrency(metrics.invested, metrics.currency),
        helper: metrics.invested
          ? t('assets.detail.manual.summary.holdingPeriod').replace('{years}', metrics.years.toFixed(1))
          : undefined,
        tone: 'neutral' as StatTone,
        icon: Wallet2,
      },
      {
        label: t('assets.detail.manual.summary.expenses'),
        value: formatCurrency(metrics.expensesTotal, metrics.currency),
        helper: t('assets.detail.manual.summary.expensesHelper'),
        tone: (metrics.expensesTotal ? 'negative' : 'neutral') as StatTone,
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
        tone: (metrics.monthlyCashflow && metrics.monthlyCashflow > 0 ? 'positive' : 'neutral') as StatTone,
        icon: PiggyBank,
      },
      {
        label: t('assets.detail.manual.summary.inflationGap'),
        value: metrics.inflationGapPercent !== undefined 
          ? `${formatPercent(metrics.inflationGapPercent)} (${formatPercent(metrics.inflationRate * 100)} objetivo)`
          : formatPercent(metrics.inflationGapPercent),
        helper: t('assets.detail.manual.summary.inflationHelper'),
        tone: (
          metrics.inflationGapPercent === undefined
            ? 'neutral'
            : metrics.inflationGapPercent >= 0
              ? 'positive'
              : 'negative'
        ) as StatTone,
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

  const handleExportPDF = useCallback(() => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Usar tipografía sans serif profesional para informes
      // Intentamos usar 'arial' que es común en informes corporativos
      // Si no está disponible, jsPDF usará helvetica como fallback
      let fontName = 'arial'
      
      // Verificar si la fuente está disponible, si no, usar helvetica
      try {
        pdf.setFont(fontName, 'normal')
        // Si no lanza error, la fuente está disponible
      } catch {
        fontName = 'helvetica' // Fallback a helvetica
      }
      
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - margin * 2
      let yPos = margin
      let sectionNumber = 1
      const fontSize = 10
      const lineHeight = 5

      // Colores elegantes estilo Wall Street
      const colorDark: [number, number, number] = [20, 20, 20]
      const colorMedium: [number, number, number] = [80, 80, 80]
      const colorLight: [number, number, number] = [150, 150, 150]
      const colorAccent: [number, number, number] = [30, 64, 175] // Azul elegante
      const colorBorder: [number, number, number] = [230, 230, 230]

      // Función para agregar encabezado y pie de página (estilo ejecutivo)
      const addHeaderFooter = (pageNum: number, totalPages: number) => {
        // Encabezado elegante
        pdf.setFillColor(248, 249, 250)
        pdf.rect(0, 0, pageWidth, 18, 'F')
        
        pdf.setFont(fontName, 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
        const title = 'Informe financiero'
        pdf.text(title, margin, 12)
        
        pdf.setFont(fontName, 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(colorMedium[0], colorMedium[1], colorMedium[2])
        const dateStr = new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        pdf.text(dateStr, pageWidth - margin - pdf.getTextWidth(dateStr), 12)
        
        // Línea elegante
        pdf.setDrawColor(colorAccent[0], colorAccent[1], colorAccent[2])
        pdf.setLineWidth(0.5)
        pdf.line(margin, 16, pageWidth - margin, 16)
        
        // Pie de página minimalista - número a la derecha
        pdf.setFontSize(8)
        pdf.setTextColor(colorLight[0], colorLight[1], colorLight[2])
        const pageText = `${pageNum}`
        pdf.text(pageText, pageWidth - margin - pdf.getTextWidth(pageText), pageHeight - 10)
        pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
      }

      let pageCount = 1

      // Función para verificar si necesita nueva página
      const checkNewPage = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - 15) {
          addHeaderFooter(pageCount, pageCount)
          pdf.addPage()
          pageCount++
          yPos = margin + 5
          // Restaurar fuente y tamaño después de nueva página
          pdf.setFont(fontName, 'normal')
          pdf.setFontSize(fontSize)
          pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
          return true
        }
        return false
      }

      // Función para agregar sección (estilo ejecutivo)
      const addSection = (title: string, level: 1 | 2 = 1) => {
        checkNewPage(level === 1 ? 15 : 10)
        if (level === 1) {
          // Para la primera sección, usar menos espacio si viene después de la descripción
          const isFirstSection = sectionNumber === 1
          yPos += isFirstSection ? 6 : 12 // Menos espacio para la primera sección
          // Fondo sutil para el título
          pdf.setFillColor(250, 250, 252)
          pdf.rect(margin - 3, yPos - 6, contentWidth + 6, 8, 'F')
          
          pdf.setFont(fontName, 'bold')
          pdf.setFontSize(12)
          pdf.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2])
          pdf.text(`${sectionNumber}. ${title}`, margin, yPos)
          sectionNumber++
          yPos += lineHeight + 1 // Reducir espacio después del subtítulo
          
          // Línea elegante debajo del título
          pdf.setDrawColor(colorAccent[0], colorAccent[1], colorAccent[2])
          pdf.setLineWidth(0.4)
          pdf.line(margin, yPos - 2, margin + 50, yPos - 2)
          yPos += 2 // Reducir espacio después de la línea
        } else {
          yPos += 8 // Aumentar espacio antes del subtítulo nivel 2
          pdf.setFont(fontName, 'bold')
          pdf.setFontSize(10)
          pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
          pdf.text(title, margin, yPos)
          yPos += lineHeight + 1 // Reducir espacio después del subtítulo
        }
        pdf.setFont(fontName, 'normal')
        pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
      }

      // Primera página - Encabezado
      addHeaderFooter(1, 1)
      yPos = margin + 8

      // Título principal del activo con badges a la derecha
      pdf.setFont(fontName, 'bold')
      pdf.setFontSize(16)
      pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
      const titleStartY = yPos
      const titleLines = pdf.splitTextToSize(asset.name, contentWidth * 0.65) // Dejar espacio para badges
      
      // Título a la izquierda
      titleLines.forEach((line: string) => {
        pdf.text(line, margin, yPos)
        yPos += lineHeight + 2
      })
      
      // Badges a la derecha del título (alineados con la primera línea)
      pdf.setFont(fontName, 'normal')
      pdf.setFontSize(9)
      const assetTypeLabel = getAssetTypeLabel(asset.type, t)
      const riskLabel = riskLabels[metrics.riskLevel]
      
      // Calcular posición de badges (a la derecha, alineados con primera línea del título)
      const badgeX = pageWidth - margin - 100
      const badgeY = titleStartY
      
      // Badge para tipo de activo
      pdf.setFillColor(240, 245, 250)
      pdf.roundedRect(badgeX, badgeY - 4, pdf.getTextWidth(assetTypeLabel) + 8, 6, 2, 2, 'F')
      pdf.setTextColor(...colorAccent)
      pdf.setFont(fontName, 'bold')
      pdf.text(assetTypeLabel, badgeX + 4, badgeY)
      
      // Badge para riesgo
      const riskX = badgeX + pdf.getTextWidth(assetTypeLabel) + 12
      pdf.setFillColor(250, 250, 250)
      pdf.roundedRect(riskX, badgeY - 4, pdf.getTextWidth(riskLabel) + 8, 6, 2, 2, 'F')
      pdf.setTextColor(...colorMedium)
      pdf.text(riskLabel, riskX + 4, badgeY)
      
      // Moneda
      const currencyX = riskX + pdf.getTextWidth(riskLabel) + 12
      pdf.setTextColor(...colorLight)
      pdf.setFont(fontName, 'normal')
      pdf.text(metrics.currency, currencyX, badgeY)
      
      // Descripción debajo del título (si existe) - espacio muy reducido
      if (asset.description) {
        yPos += 0.5 // Espacio mínimo después del título
        pdf.setFont(fontName, 'italic')
        pdf.setFontSize(fontSize)
        pdf.setTextColor(60, 60, 60)
        const descriptionLines = pdf.splitTextToSize(asset.description, contentWidth)
        descriptionLines.forEach((line: string) => {
          checkNewPage(lineHeight)
          pdf.text(line, margin, yPos)
          yPos += lineHeight
        })
        yPos += 1 // Espacio mínimo después de la descripción
      }
      
      pdf.setFont(fontName, 'normal')
      pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])

      // Sección 1: Resumen Financiero - reducir espacio antes del primer subtítulo
      yPos += 2 // Reducir distancia entre descripción y primer subtítulo
      addSection('Resumen financiero', 1)

      // Introducción explicativa
      pdf.setFont(fontName, 'normal')
      pdf.setFontSize(fontSize)
      pdf.setTextColor(0, 0, 0)
      const intro1 = `Esta sección presenta un resumen de las métricas financieras clave del activo. El valor actual refleja el estado presente de la inversión, mientras que el monto invertido representa el capital inicial más los gastos asociados. El ROI (Retorno sobre Inversión) indica el rendimiento porcentual obtenido, donde valores positivos representan ganancias y valores negativos pérdidas. La brecha de inflación compara el rendimiento real con la inflación esperada, siendo positivo cuando el activo supera la inflación y negativo cuando no la alcanza.`
      const intro1Lines = pdf.splitTextToSize(intro1, contentWidth)
      intro1Lines.forEach((line: string, index: number) => {
        checkNewPage(lineHeight)
        // Justificar todas las líneas excepto la última
        if (index < intro1Lines.length - 1) {
          const words = line.split(' ')
          if (words.length > 1) {
            const spaceWidth = (contentWidth - pdf.getTextWidth(line.replace(/\s/g, ''))) / (words.length - 1)
            let xPos = margin
            words.forEach((word, i) => {
              pdf.text(word, xPos, yPos)
              xPos += pdf.getTextWidth(word) + (i < words.length - 1 ? spaceWidth : 0)
            })
          } else {
            pdf.text(line, margin, yPos)
          }
        } else {
          pdf.text(line, margin, yPos)
        }
        yPos += lineHeight
      })
      yPos += 2

      const metricsData = [
        [t('assets.detail.manual.summary.currentValue'), formatCurrency(metrics.currentValue, metrics.currency)],
        [t('assets.detail.manual.summary.invested'), formatCurrency(metrics.invested, metrics.currency)],
        [t('assets.detail.manual.summary.expenses'), formatCurrency(metrics.expensesTotal, metrics.currency)],
        [t('assets.detail.manual.summary.cashflow'), metrics.monthlyCashflow !== undefined ? formatCurrency(metrics.monthlyCashflow, metrics.currency) : '―'],
        ['ROI', formatPercent(metrics.roiPercent)],
        [t('assets.detail.manual.summary.inflationGap'), formatPercent(metrics.inflationGapPercent)],
      ]

      // Calcular ancho de tabla para centrarla
      const tableWidth = 120
      const tableMargin = (pageWidth - tableWidth) / 2

      autoTable(pdf, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: metricsData,
        theme: 'striped',
        headStyles: {
          fillColor: [colorAccent[0], colorAccent[1], colorAccent[2]],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: fontSize,
          font: fontName,
          lineColor: [colorAccent[0], colorAccent[1], colorAccent[2]],
          lineWidth: 0.5,
          cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
        },
        bodyStyles: {
          fontSize: fontSize,
          font: fontName,
          textColor: colorDark,
          lineColor: colorBorder,
          lineWidth: 0.3,
          cellPadding: { top: 2, bottom: 2, left: 5, right: 5 },
        },
        alternateRowStyles: {
          fillColor: [252, 252, 253],
        },
        margin: { left: tableMargin, right: tableMargin, top: yPos },
        styles: {
          fontSize: fontSize,
          font: fontName,
        },
        columnStyles: {
          0: { cellWidth: tableWidth * 0.6, halign: 'left' },
          1: { cellWidth: tableWidth * 0.4, halign: 'right', fontStyle: 'bold' },
        },
        tableWidth: tableWidth,
      })

      yPos = (pdf as any).lastAutoTable.finalY + 3

      // Sección 2: Información del Activo
      if (infoRows.length > 0) {
        addSection('Información del activo', 1)

      // Introducción explicativa
      pdf.setFont(fontName, 'normal')
      pdf.setFontSize(fontSize)
      pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
        const intro2 = `A continuación se detallan las características específicas y parámetros técnicos del activo. Esta información permite comprender la naturaleza, ubicación, condiciones y términos específicos que definen la inversión. Los datos presentados son fundamentales para el análisis y seguimiento del activo a lo largo del tiempo.`
        const intro2Lines = pdf.splitTextToSize(intro2, contentWidth)
        intro2Lines.forEach((line: string) => {
          checkNewPage(lineHeight)
          pdf.text(line, margin, yPos)
          yPos += lineHeight
        })
        yPos += 3

        const infoData = infoRows.map(row => [row.label, row.value])

        const infoTableWidth = 130
        const infoTableMargin = (pageWidth - infoTableWidth) / 2

        autoTable(pdf, {
          startY: yPos,
          head: [['Campo', 'Valor']],
          body: infoData,
          theme: 'striped',
          headStyles: {
            fillColor: [colorAccent[0], colorAccent[1], colorAccent[2]],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: fontSize,
            font: fontName,
            lineColor: [colorAccent[0], colorAccent[1], colorAccent[2]],
            lineWidth: 0.5,
            cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
          },
          bodyStyles: {
            fontSize: fontSize,
            font: fontName,
            textColor: [colorDark[0], colorDark[1], colorDark[2]],
            lineColor: [colorBorder[0], colorBorder[1], colorBorder[2]],
            lineWidth: 0.3,
            cellPadding: { top: 2, bottom: 2, left: 5, right: 5 },
          },
          alternateRowStyles: {
            fillColor: [252, 252, 253],
          },
          margin: { left: infoTableMargin, right: infoTableMargin, top: yPos },
          styles: {
            fontSize: fontSize,
            font: fontName,
          },
          columnStyles: {
            0: { cellWidth: infoTableWidth * 0.5, halign: 'left' },
            1: { cellWidth: infoTableWidth * 0.5, halign: 'right' },
          },
          tableWidth: infoTableWidth,
        })

        yPos = (pdf as any).lastAutoTable.finalY + 3
      }

      // Sección 3: Análisis de Proyección
      const currentInvestedSeries = investedSeriesRef.current
      const currentInflationSeries = inflationSeriesRef.current
      if (currentInvestedSeries.length > 0 && currentInflationSeries.length > 0) {
        addSection('Análisis de proyección', 1)

      // Introducción explicativa
      pdf.setFont(fontName, 'normal')
      pdf.setFontSize(fontSize)
      pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
        const currentVal = metrics.currentValue ?? 0
        const inflTarget = metrics.inflationTarget ?? 0
        const isAboveInflation = currentVal >= inflTarget
        const gapPercent = metrics.inflationGapPercent ?? 0
        
        let intro3 = `El siguiente gráfico compara la evolución del valor del activo frente a la inflación acumulada proyectada. `
        if (isAboveInflation) {
          intro3 += `El activo muestra un rendimiento superior a la inflación (${Math.abs(gapPercent).toFixed(1)}% por encima), lo que indica que la inversión está preservando y aumentando el poder adquisitivo del capital. `
        } else {
          intro3 += `El activo muestra un rendimiento inferior a la inflación (${Math.abs(gapPercent).toFixed(1)}% por debajo), lo que sugiere que el poder adquisitivo del capital podría estar disminuyendo. `
        }
        intro3 += `La línea continua representa el valor del activo, mientras que la línea punteada muestra la inflación acumulada. Cuando la línea continua está por encima de la punteada, el activo está superando la inflación.`
        
        const intro3Lines = pdf.splitTextToSize(intro3, contentWidth)
        intro3Lines.forEach((line: string, index: number) => {
          checkNewPage(lineHeight)
          if (index < intro3Lines.length - 1) {
            const words = line.split(' ')
            if (words.length > 1) {
              const spaceWidth = (contentWidth - pdf.getTextWidth(line.replace(/\s/g, ''))) / (words.length - 1)
              let xPos = margin
              words.forEach((word, i) => {
                pdf.text(word, xPos, yPos)
                xPos += pdf.getTextWidth(word) + (i < words.length - 1 ? spaceWidth : 0)
              })
            } else {
              pdf.text(line, margin, yPos)
            }
          } else {
            pdf.text(line, margin, yPos)
          }
          yPos += lineHeight
        })
        yPos += 2

        // Gráfica dibujada manualmente (mejorada)
        const chartWidth = 140
        const chartHeight = 70
        const legendHeight = 8
        const totalChartHeight = chartHeight + legendHeight + 6
        
        checkNewPage(totalChartHeight)
        
        const chartX = (pageWidth - chartWidth) / 2
        const chartY = yPos
        const leftPadding = 30
        const bottomPadding = 20
        const plotX = chartX + leftPadding
        const plotY = chartY + 10
        const plotWidth = chartWidth - leftPadding - 10
        const plotHeight = chartHeight - 10 - bottomPadding

        // Fondo del gráfico
        pdf.setFillColor(255, 255, 255)
        pdf.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2])
        pdf.setLineWidth(0.5)
        pdf.roundedRect(chartX, chartY, chartWidth, chartHeight, 2, 2, 'FD')

        // Calcular valores
        const allValues = [
          ...currentInvestedSeries.map(d => d.value),
          ...currentInflationSeries.map(d => d.value)
        ]
        const minValue = Math.min(...allValues)
        const maxValue = Math.max(...allValues)
        const valueRange = maxValue - minValue || 1

        // Cuadrícula horizontal
        pdf.setDrawColor(240, 240, 240)
        pdf.setLineWidth(0.2)
        const gridLines = 4
        for (let i = 0; i <= gridLines; i++) {
          const y = plotY + (plotHeight / gridLines) * i
          pdf.line(plotX, y, plotX + plotWidth, y)
        }

        // Ejes principales
        pdf.setDrawColor(colorMedium[0], colorMedium[1], colorMedium[2])
        pdf.setLineWidth(0.4)
        pdf.line(plotX, plotY, plotX, plotY + plotHeight) // Eje Y
        pdf.line(plotX, plotY + plotHeight, plotX + plotWidth, plotY + plotHeight) // Eje X

        // Valores en eje Y
        pdf.setFont(fontName, 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(colorMedium[0], colorMedium[1], colorMedium[2])
        const yAxisLabels = 5
        for (let i = 0; i <= yAxisLabels; i++) {
          const value = minValue + (maxValue - minValue) * (i / yAxisLabels)
          const y = plotY + plotHeight - (plotHeight / yAxisLabels) * i
          const valueText = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: metrics.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)
          const textWidth = pdf.getTextWidth(valueText)
          pdf.text(valueText, plotX - textWidth - 3, y + 1.5)
        }

        // Título eje Y
        pdf.setFont(fontName, 'bold')
        pdf.setFontSize(8)
        pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
        pdf.text('Valor', plotX - 25, plotY + plotHeight / 2 - 3)
        pdf.setFont(fontName, 'normal')
        pdf.setFontSize(7)
        pdf.text(`(${metrics.currency})`, plotX - 25, plotY + plotHeight / 2 + 2)

        // Dibujar líneas del gráfico
        const pointCount = currentInvestedSeries.length
        const stepX = plotWidth / Math.max(pointCount - 1, 1)

        // Línea de valor del activo
        pdf.setDrawColor(colorAccent[0], colorAccent[1], colorAccent[2])
        pdf.setLineWidth(0.8)
        for (let i = 0; i < pointCount - 1; i++) {
          const value1 = currentInvestedSeries[i]?.value || 0
          const value2 = currentInvestedSeries[i + 1]?.value || 0
          const y1 = plotY + plotHeight - ((value1 - minValue) / valueRange) * plotHeight
          const y2 = plotY + plotHeight - ((value2 - minValue) / valueRange) * plotHeight
          const x1 = plotX + i * stepX
          const x2 = plotX + (i + 1) * stepX
          pdf.line(x1, y1, x2, y2)
        }

        // Línea de inflación (punteada)
        pdf.setDrawColor(colorMedium[0], colorMedium[1], colorMedium[2])
        pdf.setLineWidth(0.6)
        for (let i = 0; i < pointCount - 1; i++) {
          const value1 = currentInflationSeries[i]?.value || 0
          const value2 = currentInflationSeries[i + 1]?.value || 0
          const y1 = plotY + plotHeight - ((value1 - minValue) / valueRange) * plotHeight
          const y2 = plotY + plotHeight - ((value2 - minValue) / valueRange) * plotHeight
          const x1 = plotX + i * stepX
          const x2 = plotX + (i + 1) * stepX
          // Dibujar línea punteada
          const segments = 8
          for (let s = 0; s < segments; s += 2) {
            const t1 = s / segments
            const t2 = (s + 1) / segments
            const segX1 = x1 + (x2 - x1) * t1
            const segY1 = y1 + (y2 - y1) * t1
            const segX2 = x1 + (x2 - x1) * t2
            const segY2 = y1 + (y2 - y1) * t2
            pdf.line(segX1, segY1, segX2, segY2)
          }
        }

        // Valores en eje X (años)
        pdf.setFont(fontName, 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
        const xAxisLabels = Math.min(6, Math.max(2, pointCount))
        const divisor = xAxisLabels > 1 ? (xAxisLabels - 1) : 1
        for (let i = 0; i < xAxisLabels; i++) {
          const idx = pointCount > 1 ? Math.floor((i / divisor) * (pointCount - 1)) : 0
          const point = currentInvestedSeries[idx]
          if (point) {
            let yearText = ''
            if (typeof point.time === 'number' && point.time > 0) {
              const date = new Date(point.time * 1000)
              yearText = date.getFullYear().toString()
            } else {
              // Si no hay tiempo, usar el índice como año aproximado
              const firstPoint = currentInvestedSeries[0]
              if (firstPoint && typeof firstPoint.time === 'number' && firstPoint.time > 0) {
                const firstDate = new Date(firstPoint.time * 1000)
                const baseYear = firstDate.getFullYear()
                yearText = (baseYear + idx).toString()
              } else {
                yearText = (new Date().getFullYear() + idx).toString()
              }
            }
            if (yearText) {
              const x = plotX + (plotWidth / divisor) * i
              const textWidth = pdf.getTextWidth(yearText)
              pdf.text(yearText, x - textWidth / 2, plotY + plotHeight + 4)
            }
          }
        }

        // Título eje X
        pdf.setFont(fontName, 'bold')
        pdf.setFontSize(8)
        pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
        const xAxisTitle = 'Tiempo (años)'
        const xAxisTitleX = plotX + plotWidth / 2 - pdf.getTextWidth(xAxisTitle) / 2
        pdf.text(xAxisTitle, xAxisTitleX, plotY + plotHeight + 12)

        // Leyenda
        yPos = chartY + chartHeight + 6
        pdf.setFont(fontName, 'normal')
        pdf.setFontSize(fontSize)
        const legendX = chartX + chartWidth / 2 - 40
        
        pdf.setDrawColor(colorAccent[0], colorAccent[1], colorAccent[2])
        pdf.setLineWidth(0.8)
        pdf.line(legendX, yPos, legendX + 12, yPos)
        pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
        pdf.text('Valor del activo', legendX + 15, yPos + 1.5)
        
        pdf.setDrawColor(colorMedium[0], colorMedium[1], colorMedium[2])
        pdf.setLineWidth(0.6)
        for (let i = 0; i < 3; i++) {
          pdf.line(legendX + 50 + i * 4, yPos, legendX + 52 + i * 4, yPos)
        }
        pdf.text('Inflación', legendX + 65, yPos + 1.5)
        yPos += lineHeight + 4
        
        pdf.setFontSize(fontSize)
      }

      // Sección 4: Gastos Iniciales
      if (hasExpenses && asset.initialExpenses) {
        addSection('Gastos iniciales', 1)

      // Introducción explicativa
      pdf.setFont(fontName, 'normal')
      pdf.setFontSize(fontSize)
      pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
        const totalExpenses = metrics.expensesTotal
        const invested = metrics.invested ?? 0
        const expensePercent = invested > 0 ? (totalExpenses / invested) * 100 : 0
        
        let intro4 = `Los gastos iniciales representan todos los costos asociados a la adquisición o establecimiento del activo, incluyendo comisiones, impuestos, honorarios y otros costos de transacción. `
        if (expensePercent > 5) {
          intro4 += `Estos gastos representan un ${expensePercent.toFixed(1)}% del monto total invertido, lo que es significativo y debe considerarse en el análisis de rentabilidad. `
        } else if (expensePercent > 0) {
          intro4 += `Estos gastos representan un ${expensePercent.toFixed(1)}% del monto total invertido, lo que es relativamente bajo. `
        }
        intro4 += `Es importante tener en cuenta estos costos al evaluar el rendimiento real de la inversión, ya que reducen el capital disponible para generar retornos.`
        
        const intro4Lines = pdf.splitTextToSize(intro4, contentWidth)
        intro4Lines.forEach((line: string, index: number) => {
          checkNewPage(lineHeight)
          if (index < intro4Lines.length - 1) {
            const words = line.split(' ')
            if (words.length > 1) {
              const spaceWidth = (contentWidth - pdf.getTextWidth(line.replace(/\s/g, ''))) / (words.length - 1)
              let xPos = margin
              words.forEach((word, i) => {
                pdf.text(word, xPos, yPos)
                xPos += pdf.getTextWidth(word) + (i < words.length - 1 ? spaceWidth : 0)
              })
            } else {
              pdf.text(line, margin, yPos)
            }
          } else {
            pdf.text(line, margin, yPos)
          }
          yPos += lineHeight
        })
        yPos += 2

        const expensesData = asset.initialExpenses.map(expense => [
          expense.label || t('assets.detail.manual.expenses.unnamed'),
          formatCurrency(expense.amount, metrics.currency)
        ])
        expensesData.push([
          t('assets.detail.manual.expenses.total'),
          formatCurrency(metrics.expensesTotal, metrics.currency)
        ])

        const expensesTableWidth = 120
        const expensesTableMargin = (pageWidth - expensesTableWidth) / 2

        autoTable(pdf, {
          startY: yPos,
          head: [['Concepto', 'Importe']],
          body: expensesData,
          theme: 'striped',
          headStyles: {
            fillColor: [colorAccent[0], colorAccent[1], colorAccent[2]],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: fontSize,
            font: fontName,
            lineColor: [colorAccent[0], colorAccent[1], colorAccent[2]],
            lineWidth: 0.5,
            cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
          },
          bodyStyles: {
            fontSize: fontSize,
            font: fontName,
            textColor: [colorDark[0], colorDark[1], colorDark[2]],
            lineColor: [colorBorder[0], colorBorder[1], colorBorder[2]],
            lineWidth: 0.3,
            cellPadding: { top: 2, bottom: 2, left: 5, right: 5 },
          },
          alternateRowStyles: {
            fillColor: [252, 252, 253],
          },
          didParseCell: (data: any) => {
            if (data.row.index === expensesData.length - 1) {
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fillColor = [248, 249, 250]
            }
          },
          margin: { left: expensesTableMargin, right: expensesTableMargin, top: yPos },
          styles: {
            fontSize: fontSize,
            font: fontName,
          },
          columnStyles: {
            0: { cellWidth: expensesTableWidth * 0.6, halign: 'left' },
            1: { cellWidth: expensesTableWidth * 0.4, halign: 'right', fontStyle: 'bold' },
          },
          tableWidth: expensesTableWidth,
        })

        yPos = (pdf as any).lastAutoTable.finalY + 3
      }

      // Notas compactas
      checkNewPage(15)
      yPos += 2
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.2)
      pdf.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 3

      pdf.setFont(fontName, 'normal')
      pdf.setFontSize(fontSize) // Usar el mismo tamaño que el resto
      pdf.setTextColor(colorDark[0], colorDark[1], colorDark[2])
      const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
      const notesText = `Generado: ${dateStr} | Inflación: ${(metrics.inflationRate * 100).toFixed(2)}% | Período: ${metrics.years.toFixed(1)} años | ${metrics.currency}`
      pdf.text(notesText, margin, yPos)
      yPos += lineHeight

      // Agregar encabezado y pie a todas las páginas
      const totalPages = pageCount
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        addHeaderFooter(i, totalPages)
      }

      pdf.save(`${asset.name.replace(/\s+/g, '-').toLowerCase()}-detalle.pdf`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert(`Error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta exportar como JSON.`)
    }
  }, [asset, metrics, infoRows, riskLabels, t])

  const handleExportJSON = useCallback(() => {
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

  // Refs para mantener los handlers estables
  const handleExportPDFRef = useRef(handleExportPDF)
  const handleExportJSONRef = useRef(handleExportJSON)
  
  useEffect(() => {
    handleExportPDFRef.current = handleExportPDF
    handleExportJSONRef.current = handleExportJSON
  }, [handleExportPDF, handleExportJSON])
  
  // Exponer handlers al componente padre (solo cuando cambia onExportReady)
  useEffect(() => {
    if (onExportReady) {
      onExportReady(
        () => handleExportPDFRef.current(),
        () => handleExportJSONRef.current()
      )
    }
  }, [onExportReady])

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

      {/* Información del activo e Indicadores de Sostenibilidad fusionados */}
      <div className='grid gap-4 lg:grid-cols-12'>
        {/* Tarjeta fusionada */}
        {infoRows.length > 0 && (
          <Card className='lg:col-span-6 border-border/70 shadow-sm'>
            <CardHeader className='pb-2'>
              <div className='flex items-start justify-between gap-3'>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>Información del activo</CardTitle>
                  <CardDescription className='text-sm'>Detalles, características e indicadores de sostenibilidad</CardDescription>
                </div>
                {asset.type === AssetType.TERM_DEPOSIT && asset.maturityDate && (
                  <Badge 
                    variant='outline' 
                    className='text-xs px-2 py-1 font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 shrink-0'
                  >
                    Vencimiento: {asset.maturityDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className='pt-0 space-y-4'>
              {/* Badges - Solo una vez */}
              <div className='flex flex-wrap items-center gap-2 -mt-1'>
                <AssetTypeBadge type={asset.type} />
                <Badge 
                  variant='outline' 
                  className={cn(
                    'text-sm px-2 py-0.5 font-semibold',
                    metrics.riskLevel === 'low' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
                    metrics.riskLevel === 'medium' && 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
                    metrics.riskLevel === 'high' && 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                  )}
                >
                  {riskLabels[metrics.riskLevel]}
                </Badge>
                {metrics.roiPercent !== undefined && (
                  <span className='text-sm text-muted-foreground'>
                    ROI: {formatPercent(metrics.roiPercent)} {t('assets.detail.manual.insights.annualised')}
                  </span>
                )}
              </div>

              {/* Información del activo */}
              <div className='grid grid-cols-3 gap-x-4 gap-y-3'>
                {infoRows.map((row) => (
                  <div key={`${row.label}-${row.value}`} className='space-y-1'>
                    <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{row.label}</p>
                    <p className='text-sm font-semibold text-foreground' title={row.value}>{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Indicadores de sostenibilidad */}
              <div className={cn(
                'rounded-lg border p-3',
                metrics.inflationGapPercent !== undefined && metrics.inflationGapPercent < 0
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  : metrics.inflationGapPercent !== undefined && metrics.inflationGapPercent >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-muted/20 border-border/70'
              )}>
                <div className='flex items-center justify-between font-medium mb-2'>
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
                  'text-sm mb-3',
                  metrics.inflationGapPercent !== undefined && metrics.inflationGapPercent < 0
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-muted-foreground'
                )}>
                  {t('assets.detail.manual.insights.guidance')}
                </p>
                <div className='grid grid-cols-2 gap-3'>
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
        )}

        {/* Gráfica de Proyección */}
        <Card className='lg:col-span-6 border-border/70 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardDescription className='text-sm'>
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
            <div className='mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <span 
                  className='h-2 w-6 rounded-full' 
                  style={{ 
                    backgroundColor: chartColors?.assetColor || 'rgba(59,130,246,1)' 
                  }} 
                />
                <span>Invertido / Valor actual</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span 
                  className='h-2 w-6 rounded-full border border-dashed' 
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: chartColors?.inflationColor || 'rgba(148,163,184,0.8)'
                  }} 
                />
                <span>Inflación</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasExpenses && (
        <Card className='border-border/70 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>{t('assets.detail.manual.expenses.title')}</CardTitle>
            <CardDescription className='text-sm'>{t('assets.detail.manual.expenses.description')}</CardDescription>
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


