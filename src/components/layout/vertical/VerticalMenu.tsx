// MUI Imports
import { useEffect, useState } from 'react'

import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage'

// Component Imports

// Hook Imports

// Styled Component Imports
import EventIcon from '@mui/icons-material/Event'

import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    setUserRole(user.role || null)
  }, [])

  const EmsCond = process.env.NEXT_PUBLIC_APP_EMS
  console.log("EmsCond", EmsCond);

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuItem
          href={`/`}
          icon={<i className='ri-dashboard-line' />}
        >
          Dashboard
        </MenuItem>
        <MenuSection label='Apps & Pages'>
          {EmsCond !== 'true' &&
            <MenuItem href={`/employees`} icon={<i className='ri-user-3-line' />}>
              Employees
            </MenuItem>
          }
          <MenuItem href={`/payroll`} icon={<EventIcon />}>
            Payroll
          </MenuItem>
          <MenuItem href={`/salary-template`} icon={<EventIcon />}>
            Salary Template
          </MenuItem>
          <MenuItem href={`/salary-component`} icon={<EventIcon />}>
            Salary Component
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
