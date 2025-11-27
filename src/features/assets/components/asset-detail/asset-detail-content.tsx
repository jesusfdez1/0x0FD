import { type Asset, AssetType } from '../../types'
import { StockDetail } from './stock-detail'
import { ETFDetail } from './etf-detail'
import { FixedIncomeDetail } from './fixed-income-detail'
import { CurrencyDetail } from './currency-detail'
import { OptionDetail } from './option-detail'
import { ManualAssetDetail, type ManualAsset } from './manual-asset-detail'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AssetDetailContentProps {
  asset: Asset
  onExport?: () => void
  onExportReady?: (pdfHandler: () => void, jsonHandler: () => void) => void
}

export function AssetDetailContent({ asset, onExport, onExportReady }: AssetDetailContentProps) {
  switch (asset.type) {
    case AssetType.STOCK:
      return <StockDetail asset={asset} />
    
    case AssetType.ETF:
      return <ETFDetail asset={asset} />
    
    case AssetType.FIXED_INCOME:
      return <FixedIncomeDetail asset={asset} />
    
    case AssetType.CURRENCY:
      return <CurrencyDetail asset={asset} />
    
    case AssetType.OPTION:
      return <OptionDetail asset={asset} />
    
    case AssetType.REAL_ESTATE:
    case AssetType.SAVINGS_ACCOUNT:
    case AssetType.TERM_DEPOSIT:
    case AssetType.CHECKING_ACCOUNT:
    case AssetType.PRECIOUS_METAL:
    case AssetType.COMMODITY:
    case AssetType.PENSION_PLAN:
      return <ManualAssetDetail asset={asset as ManualAsset} onExport={onExport} onExportReady={onExportReady} />
    
    case AssetType.GUARANTEED:
    case AssetType.MUTUAL_FUND:
    case AssetType.WARRANT:
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>Información del Activo</CardTitle>
            <CardDescription>
              Vista detallada del activo seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>ID</p>
                <p className='font-medium'>{asset.id}</p>
              </div>
              {asset.description && (
                <div>
                  <p className='text-sm text-muted-foreground'>Descripción</p>
                  <p>{asset.description}</p>
                </div>
              )}
              <div>
                <p className='text-sm text-muted-foreground'>Tipo</p>
                <p className='font-medium'>{asset.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
  }
}

