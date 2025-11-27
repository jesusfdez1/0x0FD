import { z } from 'zod'
import { AssetType } from '../types'

// Esquema base normalizado - campos comunes a todos los activos
const baseAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(AssetType),
  description: z.string().optional(),
  // Campos comunes normalizados
  symbol: z.string().optional(),
  region: z.string().optional(),
  sector: z.string().optional(),
  market: z.string().optional(),
  currency: z.string().optional(),
  price: z.number().optional(),
  // Metadatos
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Esquema para Acciones
export const stockAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.STOCK),
  ticker: z.string(),
  companyName: z.string(),
  dividendYield: z.number().min(0).max(100).optional(),
})

// Esquema para ETFs
export const etfAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.ETF),
  ticker: z.string(),
  theme: z.string().optional(),
  assetClass: z.string().optional(),
  expenseRatio: z.number().min(0).max(10).optional(),
})

// Esquema para Renta Fija
export const fixedIncomeAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.FIXED_INCOME),
  issuer: z.string(),
  coupon: z.number().min(0).max(100).optional(),
  couponType: z.enum(['fixed', 'floating']).optional(),
  maturityDate: z.date().optional(),
  yield: z.number().min(0).max(100).optional(),
  rating: z.string().optional(),
})

// Esquema para Garantizados
export const guaranteedAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.GUARANTEED),
  issuer: z.string(),
  guaranteeLevel: z.number().min(0).max(100),
  maturityDate: z.date().optional(),
  underlyingAsset: z.string().optional(),
})

// Esquema para Divisa
export const currencyAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.CURRENCY),
  pair: z.string(),
  baseCurrency: z.string(),
  quoteCurrency: z.string(),
  exchangeRate: z.number().optional(),
  usage: z.enum(['transactional', 'investment', 'hedge', 'refuge']).optional(),
})

// Esquema para Opciones
export const optionAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.OPTION),
  underlyingAsset: z.string(),
  optionType: z.enum(['call', 'put']),
  position: z.enum(['buy', 'sell']),
  strikePrice: z.number(),
  expirationDate: z.date(),
  premium: z.number().optional(),
  volatility: z.number().min(0).max(100).optional(),
})

// Esquema para Fondos de Inversión
export const mutualFundAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.MUTUAL_FUND),
  isin: z.string().optional(),
  managementCompany: z.string(),
  assetClass: z.string().optional(),
  riskLevel: z.number().optional(),
  fees: z.number().optional(),
})

// Esquema para Planes de Pensiones
export const pensionPlanAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.PENSION_PLAN),
  planType: z.enum(['individual', 'employment', 'associated']),
  riskProfile: z.string().optional(),
  annualContribution: z.number().optional(),
})

// Esquema para Warrants
export const warrantAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.WARRANT),
  underlyingAsset: z.string(),
  warrantType: z.enum(['call', 'put']),
  strikePrice: z.number(),
  expirationDate: z.date(),
  premium: z.number().optional(),
  issuer: z.string(),
})

// Esquema para Propiedades
export const realEstateAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.REAL_ESTATE),
  propertyType: z.enum(['residential', 'commercial', 'industrial', 'land']).optional(),
  location: z.string().optional(),
  squareMeters: z.number().optional(),
  rentalYield: z.number().optional(),
  purchasePrice: z.number().optional(),
})

// Esquema para Criptomonedas
export const cryptoAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.CRYPTO),
  symbol: z.string(),
  blockchain: z.string().optional(),
  marketCap: z.number().optional(),
  circulatingSupply: z.number().optional(),
  maxSupply: z.number().optional(),
})

// Esquema para Materias Primas
export const commodityAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.COMMODITY),
  commodityType: z.enum(['precious_metals', 'energy', 'agricultural', 'industrial_metals']).optional(),
  unit: z.string().optional(),
  contractSize: z.number().optional(),
})

// Esquema para Futuros
export const futuresAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.FUTURES),
  underlyingAsset: z.string(),
  contractSize: z.number(),
  expirationDate: z.date(),
  margin: z.number().optional(),
  settlementType: z.enum(['physical', 'cash']).optional(),
})

// Esquema para Productos Estructurados
export const structuredProductAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.STRUCTURED_PRODUCT),
  issuer: z.string(),
  underlyingAsset: z.string().optional(),
  participationRate: z.number().optional(),
  barrierLevel: z.number().optional(),
  maturityDate: z.date().optional(),
})

// Esquema para Cuentas Remuneradas
export const savingsAccountAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.SAVINGS_ACCOUNT),
  bankName: z.string(),
  interestRate: z.number().optional(),
  accountNumber: z.string().optional(),
  minimumBalance: z.number().optional(),
})

// Esquema para Depósitos a Plazo
export const termDepositAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.TERM_DEPOSIT),
  bankName: z.string(),
  interestRate: z.number(),
  maturityDate: z.date(),
  initialAmount: z.number(),
  depositType: z.enum(['fixed', 'variable']).optional(),
})

// Esquema para Cuentas Corrientes
export const checkingAccountAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.CHECKING_ACCOUNT),
  bankName: z.string(),
  accountNumber: z.string().optional(),
  balance: z.number().optional(),
})

// Esquema para Metales Preciosos
export const preciousMetalAssetSchema = baseAssetSchema.extend({
  type: z.literal(AssetType.PRECIOUS_METAL),
  metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']),
  weight: z.number(),
  unit: z.enum(['grams', 'ounces', 'kilograms']),
  purity: z.number().optional(),
  form: z.enum(['bar', 'coin', 'jewelry']).optional(),
})

// Esquema unión para todos los activos
export const assetSchema = z.discriminatedUnion('type', [
  stockAssetSchema,
  etfAssetSchema,
  fixedIncomeAssetSchema,
  guaranteedAssetSchema,
  currencyAssetSchema,
  optionAssetSchema,
  mutualFundAssetSchema,
  pensionPlanAssetSchema,
  warrantAssetSchema,
  realEstateAssetSchema,
  cryptoAssetSchema,
  commodityAssetSchema,
  futuresAssetSchema,
  structuredProductAssetSchema,
  savingsAccountAssetSchema,
  termDepositAssetSchema,
  checkingAccountAssetSchema,
  preciousMetalAssetSchema,
])

export type Asset = z.infer<typeof assetSchema>
export const assetListSchema = z.array(assetSchema)
