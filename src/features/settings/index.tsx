import { ContentSection } from './components/content-section'
import { AccountForm } from './account/account-form'

export function Settings() {
  return (
    <ContentSection
      title='Account'
      desc='Update your account settings. Set your preferred language and
          timezone.'
    >
      <AccountForm />
    </ContentSection>
  )
}
