import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Edit, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-provider'
import { type Asset } from '../types'
import { MANUAL_ASSET_TYPES } from '../constants/asset-type-groups'
import { ManualAssetEditDialog } from './manual-asset-edit-dialog'

interface DataTableRowActionsProps {
  row: Row<Asset>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const asset = row.original
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const isManualAsset = MANUAL_ASSET_TYPES.includes(asset.type)

  const handleViewDetails = () => {
    navigate({ 
      to: '/assets/$assetId', 
      params: { assetId: asset.id } 
    })
  }

  const handleDelete = () => {
    const message = `${t('assets.table.deleteConfirmPrefix')} 1 ${t('assets.table.assetSingular')}?`
    if (!confirm(message)) return

    queryClient.setQueryData<Asset[]>(['assets'], (old = []) =>
      old.filter((item) => item.id !== asset.id)
    )

    toast.success(`1 ${t('assets.table.assetSingular')} ${t('assets.table.deletedSingular')}`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'>
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className='mr-2 h-4 w-4' />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (isManualAsset) {
                setEditingAsset(asset)
              } else {
                handleViewDetails()
              }
            }}
          >
            <Edit className='mr-2 h-4 w-4' />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigate({ to: '/portfolios' })
              // Aquí se podría abrir un diálogo para seleccionar la cartera
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            Agregar a cartera
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className='text-destructive'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManualAssetEditDialog
        asset={editingAsset}
        open={!!editingAsset}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAsset(null)
          }
        }}
      />
    </>
  )
}

