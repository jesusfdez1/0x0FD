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
import { type Asset } from '../types'

interface DataTableRowActionsProps {
  row: Row<Asset>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const asset = row.original
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate({ 
      to: '/assets/$assetId', 
      params: { assetId: asset.id } 
    })
  }

  return (
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
        <DropdownMenuItem onClick={() => console.log('Editar', asset.id)}>
          <Edit className='mr-2 h-4 w-4' />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          navigate({ to: '/portfolios' })
          // Aquí se podría abrir un diálogo para seleccionar la cartera
        }}>
          <Plus className='mr-2 h-4 w-4' />
          Agregar a cartera
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => console.log('Eliminar', asset.id)}
          className='text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

