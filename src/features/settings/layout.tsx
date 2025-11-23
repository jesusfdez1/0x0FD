import { Outlet } from '@tanstack/react-router'
import { 
  UserCog, 
  Palette, 
  Bell
} from 'lucide-react'
import { useLanguage } from '@/context/language-provider'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { SidebarNav } from './components/sidebar-nav'

export function Settings() {
  const { t } = useLanguage()

  const sidebarNavItems = [
    {
      title: t('nav.account'),
      icon: <UserCog />,
      href: '/settings',
    },
    {
      title: t('nav.appearance'),
      icon: <Palette />,
      href: '/settings/appearance',
    },
    {
      title: t('nav.notifications'),
      icon: <Bell />,
      href: '/settings/notifications',
    },
  ]

  return (
    <>
      <Header fixed>
        <Search />
      </Header>
      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('nav.settings')}
          </h1>
          <p className='text-muted-foreground'>
            {t('settings.description')}
          </p>
        </div>
        <div className='flex flex-1 flex-col space-y-8 md:space-y-2 md:overflow-hidden lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full p-1 pr-4 md:overflow-y-hidden'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}

