import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Company } from '../data/schema'
import { Eye, Plus } from 'lucide-react'

type DataTableRowActionsProps = {
  row: Row<Company>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { t } = useLanguage()
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
            aria-label={t('common.openMenu')}
            title={t('common.openMenu')}
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>{t('common.openMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem>
            <div className='flex items-center gap-3'>
              <Eye size={16} />
              <span>View</span>
            </div>
            <DropdownMenuShortcut />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className='flex items-center gap-3'>
              <Plus size={16} />
              <span>Add to portfolio</span>
            </div>
            <DropdownMenuShortcut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
