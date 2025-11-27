import { useState, useCallback } from 'react'
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
  const { assetId } = useParams({ from: '/_authenticated/assets/$assetId' })
  const [exportPDFHandler, setExportPDFHandler] = useState<(() => void) | null>(null)
  const [exportJSONHandler, setExportJSONHandler] = useState<(() => void) | null>(null)
  
  const { data: asset, isLoading, isError } = useQuery<Asset | undefined>({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return assets.find(a => a.id === assetId)
    },
  })

  const handleExportReady = useCallback((pdfHandler: () => void, jsonHandler: () => void) => {
    setExportPDFHandler(() => pdfHandler)
    setExportJSONHandler(() => jsonHandler)
  }, [])

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
    <>
      <AssetDetailHeader 
        asset={asset} 
        onExportPDF={exportPDFHandler || undefined}
        onExportJSON={exportJSONHandler || undefined}
      />
      <AssetDetailContent asset={asset} onExportReady={handleExportReady} />
    </>
  )
}

