import { useMemo } from 'react'

export type PricePoint = { date: string; price: number }

export type SyntheticPriceData = {
  currentPrice: number
  history30d: PricePoint[]
  change30dPercent: number
  marketCap: number
  volume: number
  lastUpdated: string
  earnings?: number
  revenue?: number
  employees?: number
  peRatio?: number
  dividendYield?: number
  marketCapGain?: number
  marketCapLoss?: number
  operatingMargin?: number
  costToBorrow?: number
  totalAssets?: number
  netAssets?: number
  totalLiabilities?: number
  totalDebt?: number
  cashOnHand?: number
  priceToBook?: number
}

// Deterministic PRNG using mulberry32
function mulberry32(a: number) {
  return function () {
    a |= 0
    a = a + 0x6d2b79f5 | 0
    let t = Math.imul(a ^ a >>> 15, 1 | a)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function seedFromString(s: string) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function generateSyntheticPrices(ticker: string): SyntheticPriceData {
  const seed = seedFromString(ticker.toUpperCase())
  const rand = mulberry32(seed)

  // Base price between 5 and 500
  const base = Math.round(5 + rand() * 495)

  // Create 30 days of prices with small random walk
  const history: PricePoint[] = []
  let price = base
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // random drift +-2%
    const drift = (rand() - 0.5) * 0.04
    price = Math.max(0.01, +(price * (1 + drift)).toFixed(2))
    history.push({ date: date.toISOString().slice(0, 10), price })
  }

  const first = history[0].price
  const last = history[history.length - 1].price
  const change30dPercent = +(((last - first) / first) * 100).toFixed(2)

  // Market cap synthetic: price * shares (shares between 10M and 200B)
  const shares = Math.round(1e7 + rand() * 2e11)
  const marketCap = Math.round(last * shares)

  // Volume synthetic between 100k and 50M
  const volume = Math.round(1e5 + rand() * 5e7)

  // Additional synthetic financials
  const earnings = Math.round((last * shares) / (20 + rand() * 40))
  const revenue = Math.round(earnings * (5 + rand() * 10))
  const employees = Math.round(50 + rand() * 200000)
  const peRatio = +(rand() * 30 + 5).toFixed(2)
  const dividendYield = +(rand() * 5).toFixed(2)
  const marketCapGain = Math.round(rand() * marketCap * 0.2)
  const marketCapLoss = Math.round(rand() * marketCap * 0.15)
  const operatingMargin = +(rand() * 40 - 5).toFixed(2) // -5% to 35%
  const costToBorrow = +(rand() * 3).toFixed(2)
  const totalAssets = Math.round(marketCap * (0.5 + rand() * 3))
  const totalLiabilities = Math.round(totalAssets * (0.2 + rand() * 0.8))
  const totalDebt = Math.round(totalLiabilities * (0.1 + rand() * 0.6))
  const cashOnHand = Math.round(totalAssets * (0.01 + rand() * 0.3))
  const netAssets = totalAssets - totalLiabilities
  const priceToBook = +(last / Math.max(1, netAssets / shares)).toFixed(2)

  const lastUpdated = new Date(Date.now() - Math.round(rand() * 1000 * 60 * 60)).toISOString()

  return {
    currentPrice: last,
    history30d: history,
    change30dPercent,
    marketCap,
    volume,
    lastUpdated,
    earnings,
    revenue,
    employees,
    peRatio,
    dividendYield,
    marketCapGain,
    marketCapLoss,
    operatingMargin,
    costToBorrow,
    totalAssets,
    netAssets,
    totalLiabilities,
    totalDebt,
    cashOnHand,
    priceToBook,
  }
}

export function useSyntheticPrices(ticker: string): SyntheticPriceData {
  return useMemo(() => generateSyntheticPrices(ticker), [ticker])
}
