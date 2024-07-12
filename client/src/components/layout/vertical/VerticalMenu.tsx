'use client'

import {useTheme} from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import {Menu, MenuItem, SubMenu} from '@menu/vertical-menu'
import {useSettings} from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import {useEffect, useState} from 'react'
import type {VerticalMenuContextProps} from '@menu/components/vertical-menu/Menu'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({open, transitionDuration}: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right'/>
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({scrollMenu}: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const {settings} = useSettings()
  const {isBreakpointReached} = useVerticalNav()

  // State to store user role
  const [userRole, setUserRole] = useState<string | null>(null)

  // Retrieve user role from local storage on the client side
  useEffect(() => {
    const role = localStorage.getItem('userRole')
    setUserRole(role)
  }, [])

  // Vars
  const {transitionDuration} = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: {wheelPropagation: false, suppressScrollX: true},
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{mainAxis: 23}}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({open}) => <RenderExpandIcon open={open} transitionDuration={transitionDuration}/>}
        renderExpandedMenuItemIcon={{icon: <i className='tabler-circle text-xs'/>}}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* Common Menu Items */}
        <MenuItem href='/home' icon={<i className='tabler-smart-home'/>}>
          Home
        </MenuItem>
        <MenuItem href='/about' icon={<i className='tabler-info-circle'/>}>
          About
        </MenuItem>



        {userRole === 'Admin' && (
          <>
            <MenuItem href='/departments' icon={<i className='tabler-building'/>}>
              Organizations
            </MenuItem>
            <MenuItem href='/signup' icon={<i className='tabler-users-plus'/>}>
              Register
            </MenuItem>
            <SubMenu label="Roles & Permissions" icon={<i className='tabler-lock'/>}>
              <MenuItem href='/roles' icon={<i className='tabler-user'/>}>
                Role
              </MenuItem>
              <MenuItem href='/permissions' icon={<i className='tabler-shield-check'/>}>
                Permissions
              </MenuItem>
            </SubMenu>

          </>
        )}

        {userRole === 'Manager' && (
          <SubMenu label="Management" icon={<i className='tabler-lock' style={{fontSize: '24px'}}/>}>
            <MenuItem href='/management/projects' icon={<i className='tabler-briefcase' style={{fontSize: '24px'}}/>}>
              Projects
            </MenuItem>
            <MenuItem href='/management/tasks' icon={<i className='tabler-clipboard-list' style={{fontSize: '24px'}}/>}>
              Tasks
            </MenuItem>
            <MenuItem href='/management/timesheet/' icon={<i className='tabler-calendar' style={{fontSize: '24px'}}/>}>
              Work Logs
            </MenuItem>
            <MenuItem href='/management/resources' icon={<i className='tabler-tools' style={{fontSize: '24px'}}/>}>
              Resources
            </MenuItem>
          </SubMenu>
        )}

        {userRole === 'Employee' && (
          <MenuItem href='/tasks' icon={<i className='tabler-clipboard-list'/>}>
            Tasks
          </MenuItem>
        )}

        {/* Common Menu Items */}
        <MenuItem href='/calendar' icon={<i className='tabler-calendar'/>}>
          Calendar
        </MenuItem>
        <MenuItem href='/timesheet' icon={<i className='tabler-clock'/>} className='menu-item-timesheet'>
          Timesheet
        </MenuItem>
        <MenuItem className='attendance-tab' href='/attendance' icon={<i className='tabler-clipboard'/>}>
          Attendance
        </MenuItem>
        <MenuItem className='workhours-menu-item' href='/attendance/timetracker'
                  icon={<i className='tabler-briefcase'/>}>
          Time Tracker
        </MenuItem>
        <MenuItem className='workhours-menu-item' href='/attendance/leavetracker'
                  icon={<i className='tabler-calendar-event'/>}>
          Leave Tracker
        </MenuItem>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
