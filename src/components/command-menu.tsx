import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import { useLanguage } from '@/context/language-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { getSidebarData } from './layout/data/sidebar-data'
import { type NavGroup, type NavItem } from './layout/types'
import { ScrollArea } from './ui/scroll-area'

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const { t } = useLanguage()
  
  const sidebarData = React.useMemo(() => getSidebarData(t), [t])

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      // Try to run the command first (this often triggers navigation),
      // then close the Command Dialog after a short delay to ensure the
      // navigation is handled while the dialog is still mounted.
      try {
        command()
      } catch (err) {
        console.error('Command execution error', err)
      }
      // Close the dialog after a small delay so UX feels snappy, but the
      // navigation occurs before unmounting relevant components.
      setTimeout(() => setOpen(false), 50)
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('common.searchPlaceholder')} />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>{t('common.noResults')}</CommandEmpty>
          {sidebarData.navGroups.map((group: NavGroup) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem: NavItem, i: number) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                          runCommand(() => {
                            const to = navItem.url
                            console.debug('CommandMenu: navigating to', to)
                            try {
                              navigate({ to })
                            } catch (err) {
                              console.error('CommandMenu: navigate error', err)
                            }
                            // fallback after short delay if router doesn't navigate
                            setTimeout(() => {
                              if (typeof window !== 'undefined' && to && window.location.pathname !== to) {
                                console.warn('CommandMenu: router did not navigate, fallback to full page navigation', to)
                                window.location.href = to
                              }
                            }, 200)
                          })
                        }}
                    >
                      <div className='flex size-4 items-center justify-center'>
                        <ArrowRight className='text-muted-foreground/80 size-2' />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  )

                return navItem.items?.map((subItem, i: number) => (
                  <CommandItem
                    key={`${navItem.title}-${subItem.url}-${i}`}
                    value={`${navItem.title}-${subItem.url}`}
                    onSelect={() => {
                      runCommand(() => {
                        const to = subItem.url
                        console.debug('CommandMenu: navigating to', to)
                        try {
                          navigate({ to })
                        } catch (err) {
                          console.error('CommandMenu: navigate error', err)
                        }
                        setTimeout(() => {
                          if (typeof window !== 'undefined' && to && window.location.pathname !== to) {
                            console.warn('CommandMenu: router did not navigate, fallback to full page navigation', to)
                            window.location.href = to
                          }
                        }, 200)
                      })
                    }}
                  >
                    <div className='flex size-4 items-center justify-center'>
                      <ArrowRight className='text-muted-foreground/80 size-2' />
                    </div>
                    {navItem.title} <ChevronRight /> {subItem.title}
                  </CommandItem>
                ))
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading={t('nav.theme')}>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun /> <span>{t('nav.light')}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className='scale-90' />
              <span>{t('nav.dark')}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop />
              <span>{t('nav.system')}</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
