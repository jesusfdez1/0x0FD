import { ContentSection } from '../components/content-section'
import { DisplayForm } from './display-form'

export function SettingsDisplay() {
  return (
    <ContentSection
      title='Display'
      desc='Customize theme, sidebar style, layout mode and text direction.'
    >
      <DisplayForm />
    </ContentSection>
  )
}
