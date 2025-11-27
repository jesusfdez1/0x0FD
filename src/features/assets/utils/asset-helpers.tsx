import { Badge } from '@/components/ui/badge'
import { AssetType, type Asset } from '../types'
import { 
  TrendingUp, 
  Package, 
  Shield, 
  Lock, 
  DollarSign, 
  FileText, 
  PiggyBank, 
  Calendar,
  Award,
  Home,
  Coins,
  Wheat,
  TrendingDown,
  Wallet,
  CreditCard,
  Gem
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-provider'

// Función para obtener el label del tipo de activo (ahora usa traducciones)
export const getAssetTypeLabel = (type: AssetType, t?: (key: string) => string): string => {
  const defaultLabels: Record<AssetType, string> = {
    [AssetType.STOCK]: 'Acción',
    [AssetType.ETF]: 'ETF',
    [AssetType.FIXED_INCOME]: 'Renta fija',
    [AssetType.GUARANTEED]: 'Garantizado',
    [AssetType.CURRENCY]: 'Divisa',
    [AssetType.OPTION]: 'Opción',
    [AssetType.MUTUAL_FUND]: 'Fondo',
    [AssetType.PENSION_PLAN]: 'Plan de pensiones',
    [AssetType.WARRANT]: 'Warrant',
    [AssetType.REAL_ESTATE]: 'Propiedad',
    [AssetType.CRYPTO]: 'Criptomoneda',
    [AssetType.COMMODITY]: 'Materia prima',
    [AssetType.FUTURES]: 'Futuro',
    [AssetType.STRUCTURED_PRODUCT]: 'Producto estructurado',
    [AssetType.SAVINGS_ACCOUNT]: 'Cuenta remunerada',
    [AssetType.TERM_DEPOSIT]: 'Depósito a plazo',
    [AssetType.CHECKING_ACCOUNT]: 'Cuenta corriente',
    [AssetType.PRECIOUS_METAL]: 'Metal precioso',
  }
  
  if (t) {
    // El enum ya tiene los valores en el formato correcto (stock, etf, etc.)
    const translationKey = `assets.types.${type}`
    const translated = t(translationKey)
    // Si la traducción existe y no es igual a la clave, usarla
    if (translated && translated !== translationKey) {
      return translated
    }
  }
  
  return defaultLabels[type] || type
}

// Función para obtener el icono del tipo de activo
export const getAssetTypeIcon = (type: AssetType) => {
  const icons: Record<AssetType, typeof TrendingUp> = {
    [AssetType.STOCK]: TrendingUp,
    [AssetType.ETF]: Package,
    [AssetType.FIXED_INCOME]: Shield,
    [AssetType.GUARANTEED]: Lock,
    [AssetType.CURRENCY]: DollarSign,
    [AssetType.OPTION]: FileText,
    [AssetType.MUTUAL_FUND]: PiggyBank,
    [AssetType.PENSION_PLAN]: Calendar,
    [AssetType.WARRANT]: Award,
    [AssetType.REAL_ESTATE]: Home,
    [AssetType.CRYPTO]: Coins,
    [AssetType.COMMODITY]: Wheat,
    [AssetType.FUTURES]: TrendingDown,
    [AssetType.STRUCTURED_PRODUCT]: Package,
    [AssetType.SAVINGS_ACCOUNT]: PiggyBank,
    [AssetType.TERM_DEPOSIT]: Wallet,
    [AssetType.CHECKING_ACCOUNT]: CreditCard,
    [AssetType.PRECIOUS_METAL]: Gem,
  }
  return icons[type]
}

// Función para obtener el color/variante del badge según el tipo
export const getAssetTypeBadgeVariant = (type: AssetType): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
} => {
  const variants: Record<AssetType, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className?: string }> = {
    [AssetType.STOCK]: { 
      variant: 'default', 
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' 
    },
    [AssetType.ETF]: { 
      variant: 'secondary', 
      className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' 
    },
    [AssetType.FIXED_INCOME]: { 
      variant: 'outline', 
      className: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20' 
    },
    [AssetType.GUARANTEED]: { 
      variant: 'outline', 
      className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' 
    },
    [AssetType.CURRENCY]: { 
      variant: 'outline', 
      className: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20' 
    },
    [AssetType.OPTION]: { 
      variant: 'outline', 
      className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' 
    },
    [AssetType.MUTUAL_FUND]: { 
      variant: 'secondary', 
      className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' 
    },
    [AssetType.PENSION_PLAN]: { 
      variant: 'outline', 
      className: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20' 
    },
    [AssetType.WARRANT]: { 
      variant: 'outline', 
      className: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20' 
    },
    [AssetType.REAL_ESTATE]: { 
      variant: 'outline', 
      className: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20' 
    },
    [AssetType.CRYPTO]: { 
      variant: 'outline', 
      className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20' 
    },
    [AssetType.COMMODITY]: { 
      variant: 'outline', 
      className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' 
    },
    [AssetType.FUTURES]: { 
      variant: 'outline', 
      className: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20' 
    },
    [AssetType.STRUCTURED_PRODUCT]: { 
      variant: 'outline', 
      className: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20' 
    },
    [AssetType.SAVINGS_ACCOUNT]: { 
      variant: 'outline', 
      className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' 
    },
    [AssetType.TERM_DEPOSIT]: { 
      variant: 'outline', 
      className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' 
    },
    [AssetType.CHECKING_ACCOUNT]: { 
      variant: 'outline', 
      className: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20' 
    },
    [AssetType.PRECIOUS_METAL]: { 
      variant: 'outline', 
      className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20' 
    },
  }
  return variants[type] || { variant: 'outline' }
}

// Componente Badge para tipo de activo - simplificado, solo un badge
export function AssetTypeBadge({ type, className }: { type: AssetType; className?: string }) {
  const { t } = useLanguage()
  const Icon = getAssetTypeIcon(type)
  const { className: badgeClassName } = getAssetTypeBadgeVariant(type)
  
  return (
    <Badge 
      variant='outline' 
      className={cn(
        'gap-1.5',
        badgeClassName || 'bg-muted/50 text-muted-foreground border-border',
        className
      )}
      style={{
        // Asegurar que los colores se apliquen incluso si hay conflictos
        ...(badgeClassName?.includes('bg-') ? {} : {}),
      }}
    >
      <Icon className='size-3' />
      {getAssetTypeLabel(type, t)}
    </Badge>
  )
}

// Función para obtener el símbolo/ticker según el tipo
export const getAssetSymbol = (asset: Asset): string => {
  switch (asset.type) {
    case AssetType.STOCK:
      return asset.ticker
    case AssetType.ETF:
      return asset.ticker
    case AssetType.CURRENCY:
      return asset.pair
    case AssetType.OPTION:
      return `${asset.optionType.toUpperCase()} ${asset.underlyingAsset} ${asset.strikePrice}`
    case AssetType.WARRANT:
      return `${asset.warrantType.toUpperCase()} ${asset.underlyingAsset} ${asset.strikePrice}`
    case AssetType.CRYPTO:
      return asset.symbol
    case AssetType.FUTURES:
      return `${asset.underlyingAsset} ${asset.expirationDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}`
    case AssetType.SAVINGS_ACCOUNT:
    case AssetType.CHECKING_ACCOUNT:
      return asset.bankName || asset.name
    case AssetType.TERM_DEPOSIT:
      return `${asset.bankName} - ${asset.maturityDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}`
    case AssetType.PRECIOUS_METAL:
      return `${asset.metalType} ${asset.weight}${asset.unit}`
    default:
      return asset.symbol || asset.name
  }
}

// Función para obtener la categoría del activo (Renta Variable, Renta Fija, Derivados, etc.)
export const getAssetCategory = (type: AssetType): string => {
  const categories: Record<AssetType, string> = {
    [AssetType.STOCK]: 'Renta variable',
    [AssetType.ETF]: 'Renta variable',
    [AssetType.FIXED_INCOME]: 'Renta fija',
    [AssetType.GUARANTEED]: 'Productos estructurados',
    [AssetType.CURRENCY]: 'Divisas',
    [AssetType.OPTION]: 'Derivados',
    [AssetType.MUTUAL_FUND]: 'Fondos',
    [AssetType.PENSION_PLAN]: 'Planes de pensiones',
    [AssetType.WARRANT]: 'Derivados',
    [AssetType.REAL_ESTATE]: 'Inmobiliario',
    [AssetType.CRYPTO]: 'Criptoactivos',
    [AssetType.COMMODITY]: 'Materias primas',
    [AssetType.FUTURES]: 'Derivados',
    [AssetType.STRUCTURED_PRODUCT]: 'Productos estructurados',
    [AssetType.SAVINGS_ACCOUNT]: 'Efectivo y depósitos',
    [AssetType.TERM_DEPOSIT]: 'Efectivo y depósitos',
    [AssetType.CHECKING_ACCOUNT]: 'Efectivo y depósitos',
    [AssetType.PRECIOUS_METAL]: 'Materias primas',
  }
  return categories[type]
}

// Badge para categoría
export function AssetCategoryBadge({ type }: { type: AssetType }) {
  const category = getAssetCategory(type)
  const categoryColors: Record<string, string> = {
    'Renta Variable': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    'Renta Fija': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    'Derivados': 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    'Productos Estructurados': 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    'Divisas': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
    'Fondos': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    'Planes de Pensiones': 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20',
  }
  
  return (
    <Badge variant='outline' className={cn('text-xs', categoryColors[category] || '')}>
      {category}
    </Badge>
  )
}

