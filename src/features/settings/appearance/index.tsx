import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'
import { useLanguage } from '@/context/language-provider'

export function SettingsAppearance() {
  const { t } = useLanguage()
  return (
    <ContentSection
      title={t('settings.appearance') || 'Appearance'}
      desc={t('settings.appearanceDescription') || 'Customize the theme, colors, font, sidebar, layout and visual appearance of the application.'}
    >
      <AppearanceForm />
    </ContentSection>
  )
}
