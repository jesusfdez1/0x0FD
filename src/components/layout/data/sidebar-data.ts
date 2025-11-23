import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
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
      title: t('nav.pages'),
      items: [
        {
          title: t('nav.errors'),
          icon: Bug,
          items: [
            {
              title: t('nav.unauthorized'),
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: t('nav.forbidden'),
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: t('nav.notFound'),
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: t('nav.internalServerError'),
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: t('nav.maintenanceError'),
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
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
              title: t('nav.profile'),
              url: '/settings',
              icon: UserCog,
            },
            {
              title: t('nav.account'),
              url: '/settings/account',
              icon: Wrench,
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
            {
              title: t('nav.display'),
              url: '/settings/display',
              icon: Monitor,
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
