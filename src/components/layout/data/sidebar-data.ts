import {
  LayoutDashboard,
  Monitor,
  ListTodo,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  MessagesSquare,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const getSidebarData = (t: (key: string) => string): SidebarData => ({
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: t('nav.general'),
      items: [
        {
          title: t('nav.dashboard'),
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: t('nav.tasks'),
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: t('nav.apps'),
          url: '/apps',
          icon: Package,
        },
        {
          title: t('nav.companies'),
          url: '/companies',
          icon: Monitor,
        },
        {
          title: t('nav.portfolios'),
          url: '/portfolios',
          icon: Wrench,
        },
        {
          title: t('nav.chats'),
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: t('nav.users'),
          url: '/users',
          icon: Users,
        },
      ],
    },
    {
      title: t('nav.other'),
      items: [
        {
          title: t('nav.settings'),
          icon: Settings,
          items: [
            {
              title: t('nav.account'),
              url: '/settings',
              icon: UserCog,
            },
            {
              title: t('nav.appearance'),
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: t('nav.notifications'),
              url: '/settings/notifications',
              icon: Bell,
            },
          ],
        },
        {
          title: t('nav.helpCenter'),
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
})
