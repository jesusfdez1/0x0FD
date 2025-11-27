import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type CurrencyAsset } from '../../types'
import { DollarSign, TrendingUp, Globe } from 'lucide-react'

interface CurrencyDetailProps {
  asset: CurrencyAsset
}

const usageLabels: Record<string, string> = {
  transactional: 'Transaccional',
  investment: 'Inversión',
  hedge: 'Cobertura',
  refuge: 'Refugio',
}

export function CurrencyDetail({ asset }: CurrencyDetailProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Par de Divisas
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-muted-foreground'>Par</p>
            <Badge variant='secondary' className='mt-1 text-base px-3 py-1'>{asset.pair}</Badge>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Divisa Base</p>
              <p className='font-medium text-lg'>{asset.baseCurrency}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Divisa Cotizada</p>
              <p className='font-medium text-lg'>{asset.quoteCurrency}</p>
            </div>
          </div>
          {asset.exchangeRate !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground'>Tipo de Cambio</p>
              <p className='text-2xl font-bold mt-1'>
                1 {asset.baseCurrency} = {asset.exchangeRate} {asset.quoteCurrency}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Uso y Características
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {asset.usage && (
            <div>
              <p className='text-sm text-muted-foreground'>Uso Principal</p>
              <Badge variant='outline' className='mt-1'>
                {usageLabels[asset.usage] || asset.usage}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Globe className='h-5 w-5' />
            Información sobre Divisas
          </CardTitle>
          <CardDescription>
            El mercado de divisas (Forex) es el mercado financiero más grande del mundo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>• Mercado abierto 24 horas al día</p>
            <p>• Alta liquidez y volumen de operaciones</p>
            <p>• Permite inversión, cobertura y uso transaccional</p>
            <p>• Algunas divisas son consideradas "valor refugio"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

