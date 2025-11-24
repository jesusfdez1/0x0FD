export type Portfolio = {
  id: string
  name: string
  description?: string
  companies: string[]
}

export const portfolios: Portfolio[] = [
  { id: 'p1', name: 'Growth Portfolio', description: 'High-growth tech stocks', companies: ['AAPL', 'MSFT', 'TSLA'] },
  { id: 'p2', name: 'Dividend Income', description: 'Stable dividend payers', companies: ['BHP', 'HSBA', 'PBR'] },
]
