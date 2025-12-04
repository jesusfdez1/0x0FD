'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLanguage } from '@/context/language-provider'
import { type User } from '../data/schema'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { t } = useLanguage()
  const roleLabel = t(`users.roles.${currentRow.role}`)
  const descriptionTemplate = t('users.dialogs.delete.description')
  const [beforeUsername, afterUsernamePlaceholder = ''] = descriptionTemplate.split('{username}')
  const [betweenUsernameAndRole, afterRolePlaceholder = ''] = afterUsernamePlaceholder.split('{role}')

  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return

    onOpenChange(false)
    showSubmittedData(
      currentRow,
      t('users.dialogs.delete.toastMessage')
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('users.dialogs.delete.title')}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {beforeUsername}
            <span className='font-bold'>{currentRow.username}</span>
            {betweenUsernameAndRole}
            <span className='font-bold'>{roleLabel}</span>
            {afterRolePlaceholder}
          </p>

          <Label className='my-2'>
            {t('users.dialogs.delete.usernameLabel')}
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('users.dialogs.delete.usernamePlaceholder')}
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
