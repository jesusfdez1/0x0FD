import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type ETFAsset } from '../../types'
import { Package, DollarSign, Percent, Globe, Building2 } from 'lucide-react'

interface ETFDetailProps {
  asset: ETFAsset
}

export function ETFDetail({ asset }: ETFDetailProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Información del ETF
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-muted-foreground'>Ticker</p>
            <Badge variant='secondary' className='mt-1 text-base px-3 py-1'>{asset.ticker}</Badge>
          </div>
          {asset.theme && (
            <div>
              <p className='text-sm text-muted-foreground'>Tema/Enfoque</p>
              <Badge variant='outline' className='mt-1'>{asset.theme}</Badge>
            </div>
          )}
          {asset.assetClass && (
            <div>
              <p className='text-sm text-muted-foreground'>Clase de Activo</p>
              <div className='flex items-center gap-2 mt-1'>
                <Building2 className='h-4 w-4 text-muted-foreground' />
                <span className='font-medium'>{asset.assetClass}</span>
              </div>
            </div>
          )}
          {asset.region && (
            <div>
              <p className='text-sm text-muted-foreground'>Región</p>
              <div className='flex items-center gap-2 mt-1'>
                <Globe className='h-4 w-4 text-muted-foreground' />
                <span className='font-medium'>{asset.region}</span>
              </div>
            </div>
          )}
          {asset.sector && (
            <div>
              <p className='text-sm text-muted-foreground'>Sector</p>
              <Badge variant='outline' className='mt-1'>{asset.sector}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Datos Financieros
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {asset.price !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground'>Precio Actual</p>
              <p className='text-2xl font-bold mt-1'>
                {asset.price.toLocaleString('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} {asset.currency || 'EUR'}
              </p>
            </div>
          )}
          {asset.expenseRatio !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground flex items-center gap-2'>
                <Percent className='h-4 w-4' />
                Ratio de Gastos (TER)
              </p>
              <p className='text-xl font-semibold mt-1'>
                {asset.expenseRatio}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle>Características del ETF</CardTitle>
          <CardDescription>
            Los ETFs permiten invertir en una cesta diversificada de activos de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>• Gestión pasiva que replica un índice</p>
            <p>• Comisiones generalmente más bajas que fondos de gestión activa</p>
            <p>• Cotiza en mercado, compra y venta en cualquier momento</p>
            <p>• Diversificación automática en una sola operación</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


