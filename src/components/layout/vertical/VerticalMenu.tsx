// MUI Imports
import { useEffect, useState } from 'react'

import Chip from '@mui/material/Chip'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTheme } from '@mui/material/styles'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
// Third-party Imports
import DoneIcon from '@mui/icons-material/Done';
import CreditScoreOutlinedIcon from '@mui/icons-material/CreditScoreOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PerfectScrollbar from 'react-perfect-scrollbar'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ApartmentIcon from '@mui/icons-material/Apartment';
// Type Imports
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage'

// Component Imports

// Hook Imports

// Styled Component Imports
import EventIcon from '@mui/icons-material/Event'
import WalletIcon from '@mui/icons-material/Wallet';
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { colors } from '@mui/material';

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
          {/* {userRole === '1' && (
            <MenuItem href={`/organization`} icon={<ApartmentIcon />}>
              Organization profile
            </MenuItem>
          )} */}

          {userRole === '1' && <MenuItem href={`/employees`} icon={<i className='ri-user-3-line' />}>
            Employees
          </MenuItem>}
          {userRole === '1' && <MenuItem href={`/salary-component`} icon={<DriveFileRenameOutlineOutlinedIcon />}>
            Salary Component
          </MenuItem>}
          {userRole === '1' && <MenuItem href={`/statutory-components`} icon={<EditNoteOutlinedIcon />}>
            Statutory Components
          </MenuItem>}
          {userRole === '1' && <MenuItem href={`/salary-template`} icon={<FileCopyOutlinedIcon />}>
            Salary Template
          </MenuItem>}
          {userRole === '1' && <MenuItem href={`/payroll`} icon={<CreditScoreOutlinedIcon />}>
            Payroll
          </MenuItem>}

          <MenuItem href={`/payroll-generator`} icon={<CurrencyRupeeIcon />}>
            Payslip-Generator
          </MenuItem>
          <MenuItem href={`/loan`} icon={< RequestQuoteIcon />}>
            loan
          </MenuItem>
          <MenuItem href={`/declaration`} icon={< DescriptionOutlinedIcon />}>
            Declaration
          </MenuItem>
          <MenuItem href={`/fbp`}>
            FBP plans
          </MenuItem>
          {/* Approvals Dropdown */}
          {userRole === '1' && (
            <SubMenu label="Approvals" icon={<DoneIcon />}>
              <MenuItem href={`/approvals/reimbursements`}>Reimbursements</MenuItem>
              <MenuItem href={`/approvals/proof-of-investments`}>Proof Of Investments</MenuItem>
              <MenuItem href={`/approvals/salary-revision`}>Salary Revision</MenuItem>
            </SubMenu>
          )}
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
