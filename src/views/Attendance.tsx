'use client'

import React, { useEffect, useState } from 'react'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DataGrid, GridToolbar, type GridColDef } from '@mui/x-data-grid'

import WeekendIcon from '@mui/icons-material/Weekend'
import {
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Avatar,
  useTheme,
  useMediaQuery,
  Backdrop
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SearchIcon from '@mui/icons-material/Search'
import InputAdornment from '@mui/material/InputAdornment'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import HomeIcon from '@mui/icons-material/Home'
import { Download as DownloadIcon } from '@mui/icons-material'
import ContrastIcon from '@mui/icons-material/Contrast'

import { useDispatch, useSelector } from 'react-redux'
import type { Dayjs } from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs' // For managing and formatting dates

import { Pagination } from '@mui/material';  // If not already imported

import type { AppDispatch, RootState } from '@/redux/store'
import { fetchAttendances } from '@/redux/features/attendance/attendanceslice'
import AttendanceSummary from '@/utility/attendancesummry/AttendanceSummary'
import EmployeeStatsWithBlinkingStatus from '@/utility/totalempattendancesummary/EmployeeStatsWithBlinkingStatus'
import { AttendanceSummaryColumns } from '@/utility/attendancesummry/AttendanceSummaryColumns'

import Loader from '../components/loader/loader'
import AddAttendanceForm from '@/components/attendance/Attendance'
import DateCalendarServerRequest from '@/components/attendance/DateCalendarServerRequest'
import Legend from '@/components/attendance/Legend'
import AttendanceStatusList from '@/components/attendance/AttendanceStatusList'
import LocationDropdown from '@/utility/locationdropdown/LocationDropdown'
import { fetchMonthlyAttendanceSummary } from '@/utility/apiResponse/employeesResponse'
import useDebounce from '@/utility/debounce/useDebounce'
import AttendanceCard from '@/components/attendance/AttendanceCard'
import { cleanupGlobalStyle } from '@iconify/tools/lib/index.js'
import { useRouter } from 'next/navigation'

export default function AttendanceGrid() {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch()
  const theme = useTheme()
  const { attendances, loading, count, filteredAttendance } = useSelector((state: RootState) => state.attendances)

  const [showForm, setShowForm] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [viewAttendanceData, setViewAttendanceData] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [userRole, setUserRole] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [searchName, setSearchName] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchLocation, setSearchLocation] = useState('')

  console.log('attendances', attendances)

  const [prefillEmployee, setPrefillEmployee] = useState('')
  const [prefillEmployeeName, setPrefillEmployeeName] = useState('')
  const [prefillDate, setPrefillDate] = useState('')

  const [statusCounts, setStatusCounts] = useState([])

  const [allEmployees, setAllEmployees] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    const fetchEmployees = async () => {
      setError(null)

      try {
        const employeesData = await fetchMonthlyAttendanceSummary(month, year)

        setAllEmployees(employeesData)
      } catch (error: any) {
        setError(error.message || 'Failed to fetch employee data')
      } finally {
      }
    }

    fetchEmployees()
  }, [month, year])

  const handleExportAttendance = () => {
    // Month names array
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]

    // Get the selected month and year
    const formattedMonth = monthNames[month - 1] // Convert month number to name
    const fileName = `${formattedMonth} ${year} attendance_summary.csv`

    // Define the CSV header
    const csvContent = [
      ['Employee Name', 'Present', 'Absent', 'On Half', 'On Leave', 'On WFH', 'On Field'],

      // Map attendance data to rows
      ...allEmployees.map(emp => [
        emp.employeeName,
        emp.statuses.Present,
        emp.statuses.Absent,
        emp.statuses['On Half'],
        emp.statuses['On Leave'],
        emp.statuses['On Wfh'],
        emp.statuses['On Field']
      ])
    ]
      .map(e => e.join(',')) // Join each row by commas
      .join('\n') // Join rows with newline characters

    // Create a blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      // Create a download link
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', fileName) // Set the dynamic file name
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const debouncedSearchName = useDebounce(searchName, 500)
  const debouncedSearchLocation = useDebounce(searchLocation, 500)

  useEffect(() => {
    if (userRole === '1' && debouncedSearchName.trim() === '' && debouncedSearchLocation.trim() === '') {

      dispatch(
        fetchAttendances({
          month,
          year, // Added year
          page, // Reset to first page
          limit,
          keyword: '',
          location: ''
        })
      )
    } else {
      dispatch(
        fetchAttendances({
          month,
          year, // Added year

          page, // Reset to first page when searching
          limit,
          keyword: debouncedSearchName.trim(),
          location: debouncedSearchLocation.trim()
        })
      )
    }
  }, [page, limit, month, year, debouncedSearchName, debouncedSearchLocation])

  const handleInputChange = e => {
    const newName = e.target.value

    setSearchName(newName)
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    setUserRole(user.role)
    setUserId(user.id)
  }, [])

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1)
    setLimit(newPageSize)
  }

  const handlePaginationModelChange = (params: { page: number; pageSize: number }) => {
    handlePageChange(params.page, params.pageSize)
  }

  const handleAttendanceAddClick = (employeeId = '', employeeName = '', day) => {
    const date = dayjs(new Date(new Date().getFullYear(), month - 1, day)).format('YYYY-MM-DD')

    setSelectedAttendance(null)
    setShowForm(true)
    setPrefillEmployee(employeeId)
    setPrefillEmployeeName(employeeName)
    setPrefillDate(date)
  }

  const handleAttendanceEditClick = (id: React.SetStateAction<null>) => {
    router.push(`/attendance-form?attendanceId=${id}`)

  }

  const handleClose = () => {
    router.push('/attendance')
  }
  const attendanceData = filteredAttendance.reduce(
    (acc, { date, status }) => {
      acc[date] = status

      return acc
    },
    {} as Record<string, string>
  )


  const transformData = () => {

    const groupedData = attendances.reduce((acc, curr) => {
      const { employeeId, date, status, timeComplete, _id } = curr

      if (!employeeId || !employeeId._id) return acc

      const attendanceDate = new Date(date)
      const day = attendanceDate.getDate()
      const attendanceMonth = attendanceDate.getMonth() + 1
      const attendanceYear = attendanceDate.getFullYear() // Added year

      if (attendanceMonth !== month || attendanceYear !== year) return acc // Consider year

      if (!acc[employeeId._id]) {
        acc[employeeId._id] = {
          _id: employeeId._id,
          employee_id: employeeId._id,
          name: `${employeeId.first_name} ${employeeId.last_name}`,
          image: employeeId.image || '',
          days: {}
        }

      }

      acc[employeeId._id].days[`day_${day}`] = { status, _id, timeComplete }

      return acc
    }, {})

    console.log("group>>>>>", groupedData);

    const sortedData = Object.values(groupedData).sort((a, b) => a.name.localeCompare(b.name))

    return sortedData
  }
  const rows = React.useMemo(() => transformData(), [attendances, statusCounts, month, year])

  console.log("rows", rows)

  const handleMonthChange = (date: Dayjs) => {
    const newMonth = date.month() + 1
    const newYear = date.year()

    setMonth(newMonth)
    setYear(newYear)
  }

  console.log('attendances', attendances)
  return (
    <Box>
      <ToastContainer />
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Dialog open={showForm} onClose={handleClose} fullWidth maxWidth='md'>
          <DialogContent>
            <AddAttendanceForm
              attendance={selectedAttendance}
              prefillDate={prefillDate}
              attendances={attendances}
            />
          </DialogContent>
        </Dialog>

        {/* Attendance Summary View */}
        <Dialog open={!!viewAttendanceData} onClose={handleClose} fullWidth maxWidth='md'>
          <DialogContent>
            {viewAttendanceData && (
              <AttendanceSummary attendanceData={viewAttendanceData} selectedMonth={month} onClose={handleClose} />
            )}
          </DialogContent>
        </Dialog>

        {userRole === '1' && <EmployeeStatsWithBlinkingStatus />}

        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Box>
            <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
              Attendance
            </Typography>
            <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
              Dashboard / Attendance
            </Typography>
          </Box>
          {userRole === '1' && (
            <Box display='flex' alignItems='center'>
              <Button
                style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
                variant='contained'
                color='warning'
                startIcon={<AddIcon />}
                onClick={() => router.push('/attendance-form')}
              >
                Add Attendance
              </Button>
            </Box>
          )}
        </Box>
        {userRole === '1' && (
          <Grid container spacing={6} alignItems='center' mb={2}>
            {/* Employee Name Text Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Employee Name'
                variant='outlined'
                value={searchName}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  views={['month', 'year']} // Allows selecting both month and year
                  label='Select Month and Year'
                  value={dayjs(new Date(year, month - 1))} // Bind current month and year
                  onChange={newDate => {
                    if (newDate) {
                      setMonth(newDate.month() + 1) // Update month state
                      setYear(newDate.year()) // Update year state
                    }
                  }}
                  sx={{
                    width: '100%'
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        )}
      </Box>
      <Box sx={{ display: 'flex' }}>
        {loading && (
          <Backdrop
            sx={{
              color: '#fff',
              zIndex: theme => theme.zIndex.drawer + 1,
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            open={loading}
          >
            <Loader />
          </Backdrop>
        )}
        {userRole === '1' ? (
          <Box sx={{ width: '100%', padding: 2 }}>
            {loading ? (
              <Backdrop
                sx={{
                  color: '#fff',
                  zIndex: theme => theme.zIndex.drawer + 1
                }}
                open={loading}
              >
                <Loader />
              </Backdrop>
            ) : (
              <>
                {rows.map((employeeData) => (
                  <AttendanceCard
                    key={employeeData._id}
                    employeeData={employeeData}
                    handleAttendanceAddClick={handleAttendanceAddClick}
                    handleAttendanceEditClick={handleAttendanceEditClick}
                    selectedMonth={month}
                    selectedYear={year}
                  />
                ))}

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={Math.ceil(count / limit)}
                    page={page}
                    onChange={(_, newPage) => handlePaginationModelChange({ page: newPage - 1, pageSize: limit })}
                    color="primary"
                    size="large"
                  />
                </Box>
              </>
            )}
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} lg={3}>
              <Grid container direction='column' spacing={2}>
                <Grid item>
                  <DateCalendarServerRequest
                    attendanceData={attendanceData}
                    month={month}
                    year={year}
                    onMonthChange={handleMonthChange}
                  />
                </Grid>
                <Grid item>
                  <Legend />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={8} lg={9} style={{ minWidth: isMediumScreen ? '100%' : 'auto' }}>
              <AttendanceStatusList attendanceData={attendanceData} selectedMonth={month} />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  )
}
