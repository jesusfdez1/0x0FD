import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Appearance'
      desc='Customize the theme, colors, font, sidebar, layout and visual appearance of the application.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
