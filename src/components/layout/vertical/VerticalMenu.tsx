// MUI Imports
import { useCallback, useEffect, useState } from 'react'

import Chip from '@mui/material/Chip'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useTheme } from '@mui/material/styles'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
// Third-party Imports
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DoneIcon from '@mui/icons-material/Done';
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CreditScoreOutlinedIcon from '@mui/icons-material/CreditScoreOutlined';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PerfectScrollbar from 'react-perfect-scrollbar'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SchoolIcon from '@mui/icons-material/School'
import FileOpenIcon from '@mui/icons-material/FileOpen';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
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
import { fetchConfiguration } from '@/redux/features/configuration/configurationSlice';

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

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
  const dispatch = useDispatch();
  const { configration, error } = useSelector((state: RootState) => state.configration);

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const [userRole, setUserRole] = useState<string>('')
  const declarationEnable = configration?.data?.[0]?.declarationEnabled

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchConfiguration());
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [debouncedFetch]);

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

          {userRole === "0" &&
            <><MenuItem href={`/company`} icon={<i className='ri-user-3-line' />}>
              company
            </MenuItem><MenuItem href={`/employees`} icon={<i className='ri-user-3-line' />}>
                Employees
              </MenuItem></>
          }

          {userRole === '1' &&
            <><MenuItem href={`/employees`} icon={<i className='ri-user-3-line' />}>
              Employees
            </MenuItem>
              <MenuItem href={`/attendance`} icon={<AccessTimeIcon />}>
                Attendance
              </MenuItem>
              <MenuItem href={`/component-type`} icon={<DriveFileRenameOutlineOutlinedIcon />}>
                Component Type
              </MenuItem>
              <MenuItem href={`/salary-component`} icon={<FileOpenIcon />}>
                Salary Component
              </MenuItem>
              {/* <MenuItem href={`/statutory-components`} icon={<EditNoteOutlinedIcon />}>
                Statutory Components
              </MenuItem> */}
              <MenuItem href={`/salary-template`} icon={<FileCopyOutlinedIcon />}>
                Salary Template
              </MenuItem><MenuItem href={`/payroll`} icon={<CreditScoreOutlinedIcon />}>
                Payroll
              </MenuItem>
              <MenuItem href={`/payroll-generator`} icon={<CurrencyRupeeIcon />}>
                Payslip-Generator
              </MenuItem>
              <MenuItem href={`/designation`} icon={<SchoolIcon />}>
                Designations
              </MenuItem>

              <SubMenu label="Approvals" icon={<DoneIcon />}>
                <MenuItem href={declarationEnable ? `/declaration` : '#'}
                  style={{ pointerEvents: declarationEnable ? 'auto' : 'none', opacity: declarationEnable ? 1 : 0.5 }}
                >
                  Declaration</MenuItem>
                <MenuItem href={`/reimbursements`}>Reimbursements</MenuItem>
                <MenuItem href={`/loan`}>Loan</MenuItem>
                {/* <MenuItem href={`/fbp`}>FBP plans</MenuItem> */}
              </SubMenu>
              <MenuItem href={`/configuration`} icon={<ToggleOnIcon />}>
                Configuration
              </MenuItem>
            </>
          }
          {userRole !== '0' && userRole !== '1' &&
            <>
              <MenuItem href={`/payroll-generator`} icon={<CurrencyRupeeIcon />}>
                Payslip-Generator
              </MenuItem>
              <MenuItem href={`/attendance`} icon={<AccessTimeIcon />}>
                Attendance
              </MenuItem>
              <MenuItem href={`/tax-calculator`} icon={<AssuredWorkloadIcon />}>
                Tax-Calculator
              </MenuItem>
              <MenuItem href={declarationEnable ? `/declaration` : '#'} icon={< DescriptionOutlinedIcon />}
                style={{ pointerEvents: declarationEnable ? 'auto' : 'none', opacity: declarationEnable ? 1 : 0.5 }}
              >
                Declaration
              </MenuItem>
              <MenuItem href={`/reimbursements`} icon={<NoteAddIcon />}>Reimbursements</MenuItem>
              <MenuItem href={`/loan`} icon={< RequestQuoteIcon />}>
                Loan
              </MenuItem>
            </>
          }

        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
