import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'
import { useLanguage } from '@/context/language-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  const { t } = useLanguage()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>{t('users.buttons.invite')}</span> <MailPlus size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>{t('users.buttons.add')}</span> <UserPlus size={18} />
      </Button>
    </div>
  )
}
