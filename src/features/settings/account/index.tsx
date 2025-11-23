import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Account'
      desc='Manage your account information, username, email and language preferences.'
    >
      <AccountForm />
    </ContentSection>
  )
}
