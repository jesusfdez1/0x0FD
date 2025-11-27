import { ArrowLeft, Download, FileJson, FileText, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { type Asset } from '../../types'
import { useLanguage } from '@/context/language-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AssetDetailHeaderProps {
  asset: Asset
  onExportPDF?: () => void
  onExportJSON?: () => void
}

export function AssetDetailHeader({ asset, onExportPDF, onExportJSON }: AssetDetailHeaderProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className='flex flex-wrap items-end justify-between gap-2'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/assets' })}
            className='-ml-2 h-8'
          >
            <ArrowLeft className='mr-2 h-3.5 w-3.5' />
            {t('common.back') || 'Volver'}
          </Button>
        </div>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>{asset.name}</h2>
        </div>
        {asset.description && (
          <p className='text-sm text-muted-foreground max-w-2xl mt-2'>{asset.description}</p>
        )}
      </div>
      {(onExportPDF || onExportJSON) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-8'>
              <Download className='mr-2 h-3.5 w-3.5' />
              {t('assets.detail.manual.export') || 'Exportar'}
              <ChevronDown className='ml-2 h-3.5 w-3.5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {onExportPDF && (
              <DropdownMenuItem onClick={onExportPDF}>
                <FileText className='mr-2 h-4 w-4' />
                Exportar como PDF
              </DropdownMenuItem>
            )}
            {onExportJSON && (
              <DropdownMenuItem onClick={onExportJSON}>
                <FileJson className='mr-2 h-4 w-4' />
                Exportar como JSON
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

