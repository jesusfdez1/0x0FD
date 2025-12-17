import { useMemo } from 'react'

export type PricePoint = { date: string; price: number }

export type SyntheticPriceData = {
  currentPrice: number
  history30d: PricePoint[]
  change1dPercent: number
  change30dPercent: number
  change1yPercent: number
  marketCap: number
  sharesOutstanding: number
  volume: number
  lastUpdated: string
  earnings?: number
  revenue?: number
  employees?: number
  peRatio?: number
  eps?: number
  dividendYield?: number
  dividends?: Array<{ date: string; amount: number }>
  stockSplits?: Array<{ date: string; ratio: string }>
  failsToDeliver?: number
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
  const prev = history[Math.max(0, history.length - 2)].price
  const change1dPercent = +(((last - prev) / prev) * 100).toFixed(2)
  const change30dPercent = +(((last - first) / first) * 100).toFixed(2)

  const rand1y = mulberry32(seedFromString(`${ticker.toUpperCase()}:1y`))
  const change1yPercent = +(((rand1y() - 0.35) * 180).toFixed(2))

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
  const eps = +(earnings / Math.max(1, shares)).toFixed(4)
  const dividendYield = +(rand() * 5).toFixed(2)

  // Dividend history (last 8 quarters)
  const dividends: Array<{ date: string; amount: number }> = []
  const annualDividend = (dividendYield / 100) * last
  const quarterlyDividend = +(annualDividend / 4).toFixed(4)
  for (let q = 7; q >= 0; q--) {
    const d = new Date()
    d.setMonth(d.getMonth() - q * 3)
    dividends.push({
      date: d.toISOString().slice(0, 10),
      amount: +(Math.max(0, quarterlyDividend * (0.85 + rand() * 0.3))).toFixed(4),
    })
  }

  // Stock splits (0-3 deterministic events)
  const splitCount = Math.floor(rand() * 4)
  const splitRatios = ['2:1', '3:1', '3:2']
  const stockSplits: Array<{ date: string; ratio: string }> = []
  for (let i = 0; i < splitCount; i++) {
    const year = 2000 + Math.floor(rand() * 26)
    const month = 1 + Math.floor(rand() * 12)
    const day = 1 + Math.floor(rand() * 28)
    const date = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10)
    const ratio = splitRatios[Math.floor(rand() * splitRatios.length)]
    stockSplits.push({ date, ratio })
  }
  stockSplits.sort((a, b) => a.date.localeCompare(b.date))

  const failsToDeliver = Math.round(rand() * 1_500_000)
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
    change1dPercent,
    change30dPercent,
    change1yPercent,
    marketCap,
    sharesOutstanding: shares,
    volume,
    lastUpdated,
    earnings,
    revenue,
    employees,
    peRatio,
    eps,
    dividendYield,
    dividends,
    stockSplits,
    failsToDeliver,
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
