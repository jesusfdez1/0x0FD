/**
 * Modal de configuración de la aplicación
 * Permite al usuario modificar su cuenta, apariencia y notificaciones
 * Se superpone sobre el contenido como un Dialog
 */

import { useState } from 'react'
import { Settings, User, Palette, Bell, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AccountForm } from '@/features/settings/account/account-form'
import { AppearanceForm } from '@/features/settings/appearance/appearance-form'
import { NotificationsForm } from '@/features/settings/notifications/notifications-form'
import { useLanguage } from '@/context/language-provider'

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('account')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-[80vh] p-0 gap-0 bg-background mx-auto my-auto rounded-lg">
        <Tabs value={activeTab || undefined} onValueChange={setActiveTab} className="flex flex-col h-full overflow-hidden min-h-0">
          <div className="flex items-center justify-between p-4 border-b border-border bg-background rounded-lg">
            <DialogTitle className="text-lg font-bold">{t('nav.settings')}</DialogTitle>
          </div>
            <div className="flex flex-col md:flex-row flex-grow overflow-hidden min-h-0">
            <div className="md:w-1/4 md:min-w-[200px] md:max-w-[200px] border-b md:border-b-0 md:border-r border-border bg-muted/30 relative">
              <ScrollArea className="h-full relative">
                <div className="p-2 md:p-4">
                  <div className="pt-6 mb-4 hidden md:block"></div>
                  <TabsList className="flex flex-row md:flex-col w-full bg-transparent space-y-0 space-x-1 md:space-x-0 md:space-y-2 p-1 md:p-2">
                    {[
                      { value: 'account', label: t('nav.account'), icon: User },
                      { value: 'appearance', label: t('nav.appearance'), icon: Palette },
                      { value: 'notifications', label: t('nav.notifications'), icon: Bell },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex-1 md:w-full h-9 justify-center md:justify-start items-center px-3 py-1.5 text-sm font-medium rounded-md border border-input hover:bg-primary hover:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-primary dark:data-[state=active]:border-2 transition-colors bg-white dark:bg-gray-800 dark:text-white"
                        onClick={() => setActiveTab(tab.value)}
                      >
                        <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 w-full">
                          <tab.icon className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="hidden md:block truncate">{tab.label}</span>
                        </div>
                        <ChevronRight className="hidden md:ml-auto h-4 w-4 opacity-50 flex-shrink-0" />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </ScrollArea>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 md:p-6">
                <TabsContent value="account" className="mt-0 space-y-6 min-h-0">
                  <AccountForm />
                </TabsContent>
                <TabsContent value="appearance" className="mt-0 space-y-6 min-h-0">
                  <AppearanceForm />
                </TabsContent>
                <TabsContent value="notifications" className="mt-0 space-y-6 min-h-0">
                  <NotificationsForm />
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


