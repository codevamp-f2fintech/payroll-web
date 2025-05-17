'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'

import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
  Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

import { useDispatch, useSelector } from 'react-redux'
import { fetchPayrolls, fetchPayrollsByEmployeeId } from '../redux/features/payroll/payrollSlice' // Adjust the path to your slice file
import { RootState } from '@/redux/store'
import { usePayslip } from '@/utility/payslipGenerater/PayslipGenerater'

const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}

export const PayrollGenerator = () => {
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const contentRef = useRef()
  const dispatch = useDispatch()


  const { payrolls, total, filteredByEmployee } = useSelector((state: RootState) => state.payrolls)

  const rows = user.role === '1' ? payrolls : filteredByEmployee

  // Properly use the hook at the component level
  const {
    selectedEmployee,
    setSelectedEmployee,
    month,
    year,
    setPayPeriod,
    PayslipLayout,
    downloadPayslip,
    generatePayslip
  } = typeof window !== 'undefined' ? usePayslip() : {
    selectedEmployee: null,
    setSelectedEmployee: () => { },
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    setPayPeriod: () => { },
    PayslipLayout: () => null,
    downloadPayslip: () => { },
    generatePayslip: async () => { }
  }


  const debouncedFetch = useCallback(
    debounce(() => {
      const userRole = user?.role
      const employeeId = userRole !== '1' ? user?.id : null

      if (userRole === '1') {
        dispatch(
          fetchPayrolls({
            page,
            limit,
            keyword: selectedKeyword,
            month,
            year,
          })
        )
      } else if (employeeId) {
        dispatch(
          fetchPayrollsByEmployeeId({
            employeeId,
            page,
            limit,
            month,
            year,
          })
        )
      }
    }, 300),
    [selectedKeyword, month, year, page, limit]
  )

  useEffect(() => {
    debouncedFetch()
    return debouncedFetch.cancel // Cleanup on component unmount
  }, [selectedKeyword, month, year, debouncedFetch])

  const handlePaginationModelChange = (params: { page: number; pageSize: number }) => {
    setPage(params.page + 1) // Adjust for 0-based indexing in DataGrid
    setLimit(params.pageSize)
  }

  const handlePayPeriodChange = e => {
    const { value } = e.target
    const [selectedYear, selectedMonth] = value.split('-')
    setPayPeriod(parseInt(selectedMonth), parseInt(selectedYear))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeyword(e.target.value) // Update search keyword
  }

  // Now use the properly accessed hook methods
  const handleGeneratePrint = async (employee) => {
    // Find the full employee data
    const fullEmployee = rows.find(payroll => payroll._id === employee.id)

    if (!fullEmployee) {
      console.error('Employee not found in rows for payroll generation')
      return
    }

    try {
      const employeeWithPayslip = await generatePayslip(fullEmployee)
      setSelectedEmployee(employeeWithPayslip)
    } catch (error) {
      console.error('Error generating payslip:', error)
    }
  }

  const handleDownloadPdf = () => {
    if (selectedEmployee) {
      downloadPayslip(contentRef, selectedEmployee)
    }
  }

  const columns: GridColDef[] = [
    ...(user.role === '1'
      ? [
        {
          field: 'employee',
          headerName: 'Employee',
          flex: 1,
          headerAlign: 'center',
          align: 'center',
          renderCell: params => {
            const { first_name, last_name, image } = params.row
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar
                  src={image}
                  alt={`${first_name} ${last_name}`}
                  style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10, objectFit: 'cover' }}
                />
                <Typography variant='body2'>
                  {first_name} {last_name}
                </Typography>
              </Box>
            )
          },
          width: 200 // Fixed width for this column
        }
      ]
      : []),

    {
      field: 'createdAt',
      headerName: 'PayRoll Period',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => {
        const formattedDate = new Date(params.row.createdAt).toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric'
        })
        return (
          <Typography
            variant='body2'
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              px: 1.5,
              py: 0.5,
              borderRadius: 2
            }}
          >
            {formattedDate}
          </Typography>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => {
        const statusColors = {
          pending: {
            bg: 'warning.light',
            color: 'white'
          },
          paid: {
            bg: 'success.light',
            color: 'white'
          },
          processed: {
            bg: 'info.light',
            color: 'white'
          },
          default: {
            bg: 'grey.200',
            color: 'grey.800'
          }
        }

        const statusValue = params.value.toLowerCase()
        const { bg, color } = statusColors[statusValue] || statusColors.default

        return (
          <Typography
            variant='body2'
            sx={{
              backgroundColor: bg,
              color: color,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              textTransform: 'capitalize',
              fontWeight: 'medium'
            }}
          >
            {params.value}
          </Typography>
        )
      }
    },
    {
      field: 'netSalary',
      headerName: 'Net Salary',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: params => (
        <Typography
          variant='body2'
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <span style={{ fontSize: '1rem' }}>₹</span>
          {params.value.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </Typography>
      )
    },
    {
      field: 'processedBy',
      headerName: 'Processed By',
      flex: 1,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'generate',
      headerName: 'Generate PaySlip',
      headerAlign: 'center',
      align: 'center',
      renderCell: params => (
        <Button sx={{ background: '#2e7d32' }} variant='contained' onClick={() => handleGeneratePrint(params.row)}>
          Generate
        </Button>
      ),
      width: 180 // Set fixed width for button column
    }
  ]

  // Transform payroll data to match the expected structure for the DataGrid
  const transformedPayrolls = rows.map(payroll => ({
    id: payroll._id, // Unique identifier for the row
    first_name: payroll.employee?.first_name, // Access first name of the employee
    last_name: payroll.employee?.last_name, // Access last name of the employee
    image: payroll.employee?.image,
    code: payroll.employee?.code, // Access employee code
    netSalary: payroll.netSalary, // Base salary from the salary template
    earningTypes: payroll.salaryTemplate.earningTypes, // Include earnings
    deductionTypes: payroll.salaryTemplate.deductionTypes, // Include deductions
    status: payroll.status, // Payroll status
    processedBy: payroll.processedBy, // Processed by field
    createdAt: payroll.createdAt
  }))

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '250px', marginLeft: 'auto' }}
      >
        {/* Download Payslip Button */}
        <Button
          variant='contained'
          color='secondary'
          onClick={handleDownloadPdf}
          disabled={!selectedEmployee}
          sx={{ width: '100%', background: '#2e7d32' }}
        >
          Download Payslip (PDF)
        </Button>
      </Box>

      <Typography variant='h4' gutterBottom>
        Employee Payslip
      </Typography>
      <Grid display={'flex'} container spacing={2} alignItems='center' mb={2}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label='search'
            variant='outlined'
            value={selectedKeyword}
            onChange={handleInputChange}
            InputProps={{
              sx: {
                borderRadius: '50px'
              },
              endAdornment: (
                <InputAdornment position='end'>
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label='Pay Period'
            name='payPeriod'
            type='month'
            value={`${year}-${month.toString().padStart(2, '0')}`}
            onChange={handlePayPeriodChange}
            InputLabelProps={{
              shrink: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>
      </Grid>
      <div>
        <DataGrid
          getRowHeight={() => 'auto'}
          sx={{
            height: 560,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'secondary',
              color: 'blue',
              fontWeight: 'bold'
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            },
            '& .MuiDataGrid-row': {
              '&:nth-of-type(even)': {
                backgroundColor: 'action.hover'
              },
              '&:hover': {
                backgroundColor: 'action.selected'
              }
            }
          }}
          rows={transformedPayrolls}
          columns={columns}
          getRowId={row => row.id} // Ensure unique row identification
          pageSize={limit} // Set page size dynamically from state
          paginationMode='server' // Enable server-side pagination
          rowCount={total} // Total number of rows for pagination
          onPaginationModelChange={params => {
            setPage(params.page + 1) // Update page number
            setLimit(params.pageSize) // Update page size
          }}
          paginationModel={{ page: page - 1, pageSize: limit }}
          pageSizeOptions={[5, 10, 20, 50]} // Provide page size options
        />
      </div>
      {selectedEmployee && (
        <div>
          <div ref={contentRef}>
            <PayslipLayout employee={selectedEmployee} />
          </div>
        </div>
      )}

      <Button
        variant='contained'
        color='secondary'
        onClick={handleDownloadPdf}
        disabled={!selectedEmployee}
        sx={{ width: '100%', background: '#2e7d32', marginTop: 5 }}
      >
        Download Payslip (PDF)
      </Button>
    </>
  )
}

export default PayrollGenerator
