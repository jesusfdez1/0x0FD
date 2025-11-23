import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'
import { useLanguage } from '@/context/language-provider'

export function SettingsAccount() {
  const { t } = useLanguage()
  return (
    <ContentSection
      title={t('nav.account')}
      desc={t('settings.accountDescription')}
    >
      <AccountForm />
    </ContentSection>
  )
}
