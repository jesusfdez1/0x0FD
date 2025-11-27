import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { AssetDetailHeader } from './asset-detail-header'
import { AssetDetailContent } from './asset-detail-content'
import { assets } from '../../data/assets'
import type { Asset } from '../../types'

export function AssetDetail() {
  const { assetId } = useParams({ from: '/assets/$assetId' })
  
  const { data: asset, isLoading, isError } = useQuery<Asset | undefined>({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return assets.find(a => a.id === assetId)
    },
  })

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-24 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    )
  }

  if (isError || !asset) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No se pudo cargar el activo o no existe.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-6'>
      <AssetDetailHeader asset={asset} />
      <AssetDetailContent asset={asset} />
    </div>
  )
}

