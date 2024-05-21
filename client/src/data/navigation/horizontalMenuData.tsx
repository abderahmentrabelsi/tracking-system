// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
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
  }
]

export default horizontalMenuData
