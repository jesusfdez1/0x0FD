// Tipos de activos basados en la sección de ayuda
export enum AssetType {
  STOCK = 'stock',
  ETF = 'etf',
  FIXED_INCOME = 'fixed_income',
  GUARANTEED = 'guaranteed',
  CURRENCY = 'currency',
  OPTION = 'option',
  MUTUAL_FUND = 'mutual_fund',
  PENSION_PLAN = 'pension_plan',
  WARRANT = 'warrant',
  REAL_ESTATE = 'real_estate', // Propiedades
  CRYPTO = 'crypto', // Criptomonedas/Blockchain
  COMMODITY = 'commodity', // Materias primas
  FUTURES = 'futures', // Futuros
  STRUCTURED_PRODUCT = 'structured_product', // Productos estructurados
  SAVINGS_ACCOUNT = 'savings_account', // Cuentas remuneradas
  TERM_DEPOSIT = 'term_deposit', // Depósitos a plazo
  CHECKING_ACCOUNT = 'checking_account', // Cuentas corrientes
  PRECIOUS_METAL = 'precious_metal', // Metales preciosos físicos
}

// Estructura normalizada pensando en BBDD
// Base común para todos los activos
export interface BaseAsset {
  id: string
  name: string
  type: AssetType
  description?: string
  
  // Campos comunes que pueden aplicarse a varios tipos
  symbol?: string // Ticker, ISIN, o identificador
  region?: string
  sector?: string
  market?: string
  currency?: string
  price?: number // Precio actual de mercado
  
  // Campos de inversión (opcionales, para tracking de cartera)
  quantity?: number // Cantidad de activos que posees
  purchasePrice?: number // Precio al que compraste
  
  // Metadatos
  createdAt?: Date
  updatedAt?: Date
}

// Campos específicos por tipo (en BBDD serían tablas relacionadas)
export interface StockSpecific {
  companyName: string
  dividendYield?: number
}

export interface ETFSpecific {
  theme?: string
  assetClass?: string
  expenseRatio?: number
}

export interface FixedIncomeSpecific {
  issuer: string
  coupon?: number
  couponType?: 'fixed' | 'floating'
  maturityDate?: Date
  yield?: number
  rating?: string
}

export interface GuaranteedSpecific {
  issuer: string
  guaranteeLevel: number
  maturityDate?: Date
  underlyingAsset?: string
}

export interface CurrencySpecific {
  pair: string
  baseCurrency: string
  quoteCurrency: string
  exchangeRate?: number
  usage?: 'transactional' | 'investment' | 'hedge' | 'refuge'
}

export interface OptionSpecific {
  underlyingAsset: string
  optionType: 'call' | 'put'
  position: 'buy' | 'sell'
  strikePrice: number
  expirationDate: Date
  premium?: number
  volatility?: number
}

export interface MutualFundSpecific {
  isin?: string
  managementCompany: string
  assetClass?: string
  riskLevel?: number
  fees?: number
}

export interface PensionPlanSpecific {
  planType: 'individual' | 'employment' | 'associated'
  riskProfile?: string
  annualContribution?: number
}

export interface WarrantSpecific {
  underlyingAsset: string
  warrantType: 'call' | 'put'
  strikePrice: number
  expirationDate: Date
  premium?: number
  issuer: string
}

// Tipos unidos (en runtime, no en BBDD)
export interface StockAsset extends BaseAsset {
  type: AssetType.STOCK
  ticker: string
  companyName: string
  dividendYield?: number
}

export interface ETFAsset extends BaseAsset {
  type: AssetType.ETF
  ticker: string
  theme?: string
  assetClass?: string
  expenseRatio?: number
}

export interface FixedIncomeAsset extends BaseAsset {
  type: AssetType.FIXED_INCOME
  issuer: string
  coupon?: number
  couponType?: 'fixed' | 'floating'
  maturityDate?: Date
  yield?: number
  rating?: string
}

export interface GuaranteedAsset extends BaseAsset {
  type: AssetType.GUARANTEED
  issuer: string
  guaranteeLevel: number
  maturityDate?: Date
  underlyingAsset?: string
}

export interface CurrencyAsset extends BaseAsset {
  type: AssetType.CURRENCY
  pair: string
  baseCurrency: string
  quoteCurrency: string
  exchangeRate?: number
  usage?: 'transactional' | 'investment' | 'hedge' | 'refuge'
}

export interface OptionAsset extends BaseAsset {
  type: AssetType.OPTION
  underlyingAsset: string
  optionType: 'call' | 'put'
  position: 'buy' | 'sell'
  strikePrice: number
  expirationDate: Date
  premium?: number
  volatility?: number
}

export interface MutualFundAsset extends BaseAsset {
  type: AssetType.MUTUAL_FUND
  isin?: string
  managementCompany: string
  assetClass?: string
  riskLevel?: number
  fees?: number
}

export interface PensionPlanAsset extends BaseAsset {
  type: AssetType.PENSION_PLAN
  planType: 'individual' | 'employment' | 'associated'
  riskProfile?: string
  annualContribution?: number
  provider?: string
  expectedReturn?: number
}

export interface WarrantAsset extends BaseAsset {
  type: AssetType.WARRANT
  underlyingAsset: string
  warrantType: 'call' | 'put'
  strikePrice: number
  expirationDate: Date
  premium?: number
  issuer: string
}

// Propiedades (Real Estate)
export interface RealEstateAsset extends BaseAsset {
  type: AssetType.REAL_ESTATE
  propertyType?: 'residential' | 'commercial' | 'industrial' | 'land'
  location?: string
  squareMeters?: number
  rentalYield?: number
  purchasePrice?: number
}

// Criptomonedas/Blockchain
export interface CryptoAsset extends BaseAsset {
  type: AssetType.CRYPTO
  symbol: string
  blockchain?: string
  marketCap?: number
  circulatingSupply?: number
  maxSupply?: number
}

// Materias Primas (Commodities)
export interface CommodityAsset extends BaseAsset {
  type: AssetType.COMMODITY
  commodityType?: 'precious_metals' | 'energy' | 'agricultural' | 'industrial_metals'
  unit?: string
  contractSize?: number
  storageLocation?: string
}

// Futuros
export interface FuturesAsset extends BaseAsset {
  type: AssetType.FUTURES
  underlyingAsset: string
  contractSize: number
  expirationDate: Date
  margin?: number
  settlementType?: 'physical' | 'cash'
}

// Productos Estructurados
export interface StructuredProductAsset extends BaseAsset {
  type: AssetType.STRUCTURED_PRODUCT
  issuer: string
  underlyingAsset?: string
  participationRate?: number
  barrierLevel?: number
  maturityDate?: Date
}

// Cuentas Remuneradas
export interface SavingsAccountAsset extends BaseAsset {
  type: AssetType.SAVINGS_ACCOUNT
  bankName: string
  interestRate?: number
  accountNumber?: string
  minimumBalance?: number
}

// Depósitos a Plazo
export interface TermDepositAsset extends BaseAsset {
  type: AssetType.TERM_DEPOSIT
  bankName: string
  interestRate: number
  maturityDate: Date
  initialAmount: number
  depositType?: 'fixed' | 'variable'
}

// Cuentas Corrientes
export interface CheckingAccountAsset extends BaseAsset {
  type: AssetType.CHECKING_ACCOUNT
  bankName: string
  accountNumber?: string
  balance?: number
}

// Metales Preciosos Físicos
export interface PreciousMetalAsset extends BaseAsset {
  type: AssetType.PRECIOUS_METAL
  metalType: 'gold' | 'silver' | 'platinum' | 'palladium'
  weight: number
  unit: 'grams' | 'ounces' | 'kilograms'
  purity?: number
  form?: 'bar' | 'coin' | 'jewelry'
  storageLocation?: string
}

// Tipo unión para todos los activos
export type Asset =
  | StockAsset
  | ETFAsset
  | FixedIncomeAsset
  | GuaranteedAsset
  | CurrencyAsset
  | OptionAsset
  | MutualFundAsset
  | PensionPlanAsset
  | WarrantAsset
  | RealEstateAsset
  | CryptoAsset
  | CommodityAsset
  | FuturesAsset
  | StructuredProductAsset
  | SavingsAccountAsset
  | TermDepositAsset
  | CheckingAccountAsset
  | PreciousMetalAsset
