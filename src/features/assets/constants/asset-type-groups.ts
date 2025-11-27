import { AssetType } from '../types'

export const QUOTED_ASSET_TYPES: AssetType[] = [
  AssetType.STOCK,
  AssetType.ETF,
  AssetType.FIXED_INCOME,
  AssetType.GUARANTEED,
  AssetType.CURRENCY,
  AssetType.OPTION,
  AssetType.MUTUAL_FUND,
  AssetType.WARRANT,
  AssetType.CRYPTO,
  AssetType.FUTURES,
  AssetType.STRUCTURED_PRODUCT,
]

export const MANUAL_ASSET_TYPES: AssetType[] = [
  AssetType.REAL_ESTATE,
  AssetType.SAVINGS_ACCOUNT,
  AssetType.TERM_DEPOSIT,
  AssetType.CHECKING_ACCOUNT,
  AssetType.PRECIOUS_METAL,
  AssetType.COMMODITY,
  AssetType.PENSION_PLAN,
]

export const ASSET_TYPE_GROUPS = {
  quoted: QUOTED_ASSET_TYPES,
  manual: MANUAL_ASSET_TYPES,
}

export type AssetTypeGroup = keyof typeof ASSET_TYPE_GROUPS

