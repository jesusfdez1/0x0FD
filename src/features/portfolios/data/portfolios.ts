// Tipo de activo en una cartera
export type PortfolioAsset = {
  assetId: string // ID del activo (puede ser de companies o de assets)
  assetType: 'company' | 'asset' // Tipo: compañía o activo de inversión
  quantity?: number // Cantidad de activos
  purchasePrice?: number // Precio de compra
  purchaseDate?: Date // Fecha de compra
}

export type Portfolio = {
  id: string
  name: string
  description?: string
  companies: string[] // Mantener para compatibilidad
  assets?: PortfolioAsset[] // Nuevos activos de inversión
  createdAt?: Date
  updatedAt?: Date
}

export const portfolios: Portfolio[] = [
  { 
    id: 'p1', 
    name: 'Cartera de Crecimiento', 
    description: 'Acciones de tecnología de alto crecimiento', 
    companies: ['AAPL', 'MSFT', 'TSLA'],
    assets: [
      { assetId: 'a1', assetType: 'asset', quantity: 10, purchasePrice: 175.50 },
      { assetId: 'e1', assetType: 'asset', quantity: 5, purchasePrice: 450.25 },
    ],
  },
  { 
    id: 'p2', 
    name: 'Renta por Dividendos', 
    description: 'Activos con dividendos estables', 
    companies: ['BHP', 'HSBA', 'PBR'],
    assets: [
      { assetId: 'a2', assetType: 'asset', quantity: 20, purchasePrice: 28.50 },
      { assetId: 'f1', assetType: 'asset', quantity: 1, purchasePrice: 1000 },
    ],
  },
]
