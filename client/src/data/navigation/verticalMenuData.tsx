// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'tabler-smart-home'
  },
  {
    label: 'About',
    href: '/about',
    icon: 'tabler-info-circle'
  },
  {
    label: 'Sign Up',
    href: '/signup',
    icon: 'tabler-user-plus'
  },
  //for role
  {
    label: 'Role',
    href: '/roles',
    icon: 'tabler-user'
  },
  //for permissions
  {
    label: 'Permissions',
    href: '/permissions',
    icon: 'tabler-shield-check'
  }
]

export default verticalMenuData
