'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import HorizontalNav, { Menu, MenuItem, SubMenu } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='tabler-chevron-right' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = () => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const { settings } = useSettings()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role)
  }, [])

  // Vars
  const { skin } = settings
  const { transitionDuration } = verticalNavOptions

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor:
          skin === 'bordered' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-default)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        menuItemStyles={menuItemStyles(settings, theme)}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme, settings),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        {/* Common Menu Items */}
        <MenuItem href='/home' icon={<i className='tabler-smart-home' />}>
          Home
        </MenuItem>
        <MenuItem href='/about' icon={<i className='tabler-info-circle' />}>
          About
        </MenuItem>

        {userRole === 'Admin' && (
          <>
            <MenuItem href='/departments' icon={<i className='tabler-building' />}>
              Organizations
            </MenuItem>
            <MenuItem href='/signup' icon={<i className='tabler-users-plus' />}>
              Register
            </MenuItem>
            <SubMenu label="Roles & Permissions" icon={<i className='tabler-lock' />}>
              <MenuItem href='/roles' icon={<i className='tabler-user' />}>
                Role
              </MenuItem>
              <MenuItem href='/permissions' icon={<i className='tabler-shield-check' />}>
                Permissions
              </MenuItem>
            </SubMenu>
          </>
        )}

        {userRole === 'Manager' && (
          <SubMenu label="Management" icon={<i className='tabler-lock' style={{ fontSize: '24px' }} />}>
            <MenuItem href='/management/projects' icon={<i className='tabler-briefcase' style={{ fontSize: '24px' }} />}>
              Projects
            </MenuItem>
            <MenuItem href='/management/tasks' icon={<i className='tabler-clipboard-list' style={{ fontSize: '24px' }} />}>
              Tasks
            </MenuItem>
            <MenuItem href='/management/timesheet/' icon={<i className='tabler-calendar' style={{ fontSize: '24px' }} />}>
              Work Logs
            </MenuItem>
            <MenuItem href='/management/resources' icon={<i className='tabler-tools' style={{ fontSize: '24px' }} />}>
              Resources
            </MenuItem>
          </SubMenu>
        )}

        {userRole === 'Employee' && (
          <MenuItem href='/tasks' icon={<i className='tabler-clipboard-list' />}>
            Tasks
          </MenuItem>
        )}

        {/* Common Menu Items */}
        <MenuItem href='/calendar' icon={<i className='tabler-calendar' />}>
          Calendar
        </MenuItem>
        <MenuItem href='/timesheet' icon={<i className='tabler-clock' />} className='menu-item-timesheet'>
          Timesheet
        </MenuItem>
        <MenuItem className='attendance-tab' href='/attendance' icon={<i className='tabler-clipboard' />}>
          Attendance
        </MenuItem>
        <MenuItem className='workhours-menu-item' href='/attendance/timetracker' icon={<i className='tabler-briefcase' />}>
          Time Tracker
        </MenuItem>
        <MenuItem className='workhours-menu-item' href='/attendance/leavetracker' icon={<i className='tabler-calendar-event' />}>
          Leave Tracker
        </MenuItem>
        <MenuItem href='/equipments' icon={<i className='tabler-hammer' />}>
          Equipments
        </MenuItem>
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu
