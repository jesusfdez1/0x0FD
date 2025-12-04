import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language-provider'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type User } from '../data/schema'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useLanguage()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading: t('common.changingStatusLoading'),
      success: () => {
        table.resetRowSelection()
        return t('common.changedStatusSuccess').replace('{count}', `${selectedUsers.length}`)
      },
      error: t('common.changingStatusError'),
    })
    table.resetRowSelection()
  }

  const handleBulkInvite = () => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading: t('common.invitingUsersLoading'),
      success: () => {
        table.resetRowSelection()
        return t('common.invitedUsers').replace('{count}', `${selectedUsers.length}`)
      },
      error: t('common.inviteUsersError'),
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar
        table={table}
        entityName='user'
        entityLabel={{
          singular: t('users.entity.singular'),
          plural: t('users.entity.plural'),
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkInvite}
              className='size-8'
              aria-label={t('common.inviteSelected')}
              title={t('common.inviteSelected')}
            >
              <Mail />
              <span className='sr-only'>{t('common.inviteSelected')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.inviteSelected')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label={t('common.activateSelected')}
              title={t('common.activateSelected')}
            >
              <UserCheck />
              <span className='sr-only'>{t('common.activateSelected')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.activateSelected')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label={t('common.deactivateSelected')}
              title={t('common.deactivateSelected')}
            >
              <UserX />
              <span className='sr-only'>{t('common.deactivateSelected')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.deactivateSelected')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label={t('common.deleteSelectedUsers')}
              title={t('common.deleteSelectedUsers')}
            >
              <Trash2 />
              <span className='sr-only'>{t('common.deleteSelectedUsers')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.deleteSelectedUsers')}</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
