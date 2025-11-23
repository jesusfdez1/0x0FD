import { ContentSection } from '../components/content-section'
import { DisplayForm } from './display-form'

export function SettingsDisplay() {
  return (
    <ContentSection
      title='Display'
      desc='Customize the theme, colors, and visual appearance of the application.'
    >
      <DisplayForm />
    </ContentSection>
  )
}
