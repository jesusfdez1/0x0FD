import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { AssetTypeBadge, getAssetSymbol } from '../../utils/asset-helpers'
import { type Asset } from '../../types'
import { AddToPortfolioDialog } from '../add-to-portfolio-dialog'

interface AssetDetailHeaderProps {
  asset: Asset
}

export function AssetDetailHeader({ asset }: AssetDetailHeaderProps) {
  const navigate = useNavigate()
  const symbol = getAssetSymbol(asset)

  return (
    <div className='space-y-4'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => navigate({ to: '/assets' })}
        className='-ml-2'
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        Volver a activos
      </Button>

      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-muted/40 text-2xl font-bold'>
              {asset.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>{asset.name}</h1>
              <p className='text-muted-foreground mt-1'>{symbol}</p>
            </div>
          </div>
          <AssetTypeBadge type={asset.type} />
          {asset.description && (
            <p className='text-muted-foreground max-w-2xl mt-2'>{asset.description}</p>
          )}
        </div>
        <div className='flex gap-2'>
          <AddToPortfolioDialog asset={asset} />
        </div>
      </div>
    </div>
  )
}

