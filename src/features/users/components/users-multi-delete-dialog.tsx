'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLanguage } from '@/context/language-provider'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const { t } = useLanguage()

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const count = selectedRows.length
  const entityName =
    count === 1 ? t('users.entity.singular') : t('users.entity.plural')
  const confirmWord = t('users.dialogs.multiDelete.confirmWord')

  const handleDelete = () => {
    if (value.trim() !== confirmWord) {
      toast.error(
        t('users.dialogs.multiDelete.confirmError').replace(
          '{word}',
          confirmWord
        )
      )
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: t('common.deletingUsersLoading'),
      success: () => {
        table.resetRowSelection()
        return t('users.dialogs.multiDelete.toastSuccess')
          .replace('{count}', `${count}`)
          .replace('{entityName}', entityName)
      },
      error: t('common.deleteUsersError'),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== confirmWord}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('users.dialogs.multiDelete.title')
            .replace('{count}', `${count}`)
            .replace('{entityName}', entityName)}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>{t('users.dialogs.multiDelete.description')}</p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>
              {t('users.dialogs.multiDelete.inputLabel').replace(
                '{word}',
                confirmWord
              )}
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('users.dialogs.multiDelete.inputPlaceholder').replace(
                '{word}',
                confirmWord
              )}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('common.warning')}</AlertTitle>
            <AlertDescription>
              {t('users.dialogs.delete.warningDescription')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('common.delete')}
      destructive
    />
  )
}
