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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  Avatar
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import html2pdf from 'html2pdf.js'

import { useDispatch, useSelector } from 'react-redux'
import { fetchPayrolls, fetchPayrollsByEmployeeId } from '../redux/features/payroll/payrollSlice' // Adjust the path to your slice file
import { RootState } from '@/redux/store'

const companyName = 'F2 FINTECH'
const companyAddress = 'A-25, M-1 Arv Park, A-Block, Sector 63, Noida, Uttar Pradesh - 201301'

const EmsCond = process.env.NEXT_PUBLIC_APP_EMS

const user = JSON.parse(localStorage.getItem('user') || '{}')

export const PayrollGenerator = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const contentRef = useRef()
  const dispatch = useDispatch()

  const { payrolls, total, filteredByEmployee } = useSelector((state: RootState) => state.payrolls)

  const rows = user.role === '1' ? payrolls : filteredByEmployee

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
            month: selectedMonth,
            year: new Date().getFullYear()
          })
        )
      } else if (employeeId) {
        dispatch(
          fetchPayrollsByEmployeeId({
            employeeId,
            page,
            limit,
            month: selectedMonth,
            year: new Date().getFullYear()
          })
        )
      }
    }, 300),
    [selectedKeyword, selectedMonth, page, limit]
  )

  useEffect(() => {
    debouncedFetch()
    return debouncedFetch.cancel // Cleanup on component unmount
  }, [selectedKeyword, selectedMonth, debouncedFetch])

  const handleMonthChange = event => {
    setSelectedMonth(event.target.value)
    setSelectedEmployee(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeyword(e.target.value) // Update search keyword
  }

  const handleGeneratePrint = async employee => {
    console.log('Rows data:', rows) // Check available rows
    console.log('Employee clicked:', employee) // Check employee passed to the function

    // Match `id` from `employee` with `_id` in `rows`
    const fullEmployee = rows.find(payroll => payroll._id === employee.id)

    if (!fullEmployee) {
      console.error('Employee not found in rows for payroll generation')
      return
    }

    // Check if fullEmployee and fullEmployee.employeeId exist, and email is available
    if (!fullEmployee.employee || !fullEmployee.employee.email) {
      console.error('Employee email is missing')
      return
    }

    try {
      const month = selectedMonth
      const year = new Date().getFullYear()

      const attendanceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_EMS_URL}/attendence/fetch-by-email?email=${fullEmployee.employee.email}&month=${month}&year=${year}`
      )

      if (!attendanceResponse.ok) {
        throw new Error('Failed to fetch attendance data')
      }

      const { lopDays, paidDays } = await attendanceResponse.json()

      setSelectedEmployee({
        ...fullEmployee,
        lopDays,
        paidDays
      })
    } catch (error) {
      console.error('Error fetching LOP and Paid Days:', error)
    }
  }

  const handleDownloadPdf = () => {
    if (contentRef.current) {
      const options = {
        margin: 1,
        filename: `${selectedEmployee?.employee?.first_name}_${selectedEmployee?.employee?.last_name}_Payslip.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      html2pdf().from(contentRef.current).set(options).save()
    }
  }

  const InvoiceLayout = React.forwardRef((props, ref) => {
    const { employee } = props

    const earnings = employee?.salaryTemplate?.earningTypes.map(earning => ({
      type: earning?.type || 'N/A',
      salaryType: earning?.salarytype || 'N/A',
      amount: earning?.amount || 0
    }))

    const deductions = employee?.salaryTemplate?.deductionTypes.map(deduction => ({
      type: deduction?.type || 'N/A',
      salaryType: deduction?.salarytype || 'N/A',
      amount: deduction?.amount || 0
    }))

    // Calculate total earnings, deductions, and net payable
    const totalEarnings = earnings.reduce((acc, curr) => acc + curr.amount, 0)
    const totalDeductions = deductions.reduce((acc, curr) => acc + curr.amount, 0)
    const netPayable = totalEarnings - totalDeductions

    // Function to convert amount to words
    const numberToWords = num => {
      const a = [
        '',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen'
      ]
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
      const toWords = num => {
        if (num === 0) return 'Zero'
        if (num < 20) return a[num]
        if (num < 100) return `${b[Math.floor(num / 10)]} ${a[num % 10]}`
        if (num < 1000) return `${a[Math.floor(num / 100)]} Hundred ${toWords(num % 100)}`
        return `${toWords(Math.floor(num / 1000))} Thousand ${toWords(num % 1000)}`
      }
      return toWords(num).trim()
    }

    const amountInWords = `Indian Rupee ${numberToWords(Math.floor(netPayable))} Only`

    return (
      <div ref={ref}>
        <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
          {/* Invoice Header */}
          {/* Invoice Header */}
          <Box sx={{ borderBottom: '1px solid #ccc', paddingBottom: 1 }}>
            <Grid container spacing={2}>
              {/* Company Logo and Address */}
              <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src='/images/avatars/f2logo.jpg'
                  alt='Company Logo'
                  style={{ width: '100px', marginRight: '1rem' }} // Adjust as needed
                />
                <Box>
                  <Typography
                    style={{
                      fontWeight: 'bold',
                      fontSize: '1.5rem'
                    }}
                    variant='h6'
                  >
                    {companyName}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 'medium',
                      lineHeight: '1.5' // For better readability
                    }}
                  >
                    {companyAddress}
                  </Typography>
                </Box>
              </Grid>

              {/* Payslip for the Month */}
              <Grid
                item
                xs={6}
                sx={{
                  textAlign: 'right',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center'
                }}
              >
                <Typography variant='h5'>Payslip For the Month</Typography>
                <Typography
                  style={{
                    fontWeight: 'bold',
                    color: 'black'
                  }}
                  variant='h6'
                >
                  {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
                    new Date(new Date().getFullYear(), selectedMonth - 1)
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Employee Summary */}
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Employee Summary
              </Typography>

              {/* Employee Name */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Employee Name:</Typography>
                <Typography sx={{ color: 'black' }}>
                  {employee?.employee?.first_name} {employee?.employee?.last_name}
                </Typography>
              </Box>

              {/* Employee ID */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Employee ID:</Typography>
                <Typography sx={{ color: 'black' }}>{employee?.employee?.code}</Typography>
              </Box>

              {/* Pay Date */}
              {/* Pay Date */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Pay Date:</Typography>
                <Typography sx={{ color: 'black' }}>
                  {
                    // Get the last day of the selected month
                    (() => {
                      const date = new Date(new Date().getFullYear(), selectedMonth, 0); // Get last date of the selected month
                      return `${date.getDate()}/${selectedMonth}/${date.getFullYear()}`;
                    })()
                  }
                </Typography>
              </Box>


              {/* Pay Period */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Pay Period:</Typography>
                <Typography sx={{ color: 'black' }}>
                  {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
                    new Date(new Date().getFullYear(), selectedMonth - 1)
                  )}
                </Typography>
              </Box>


            </Grid>

            <Grid sx={{ margin: '0 auto' }} item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto',
                  overflow: 'hidden' // Ensure the border-radius applies properly
                }}
              >
                {/* Employee Net Pay Section with Light Green Background and Left-Aligned Content */}
                <Box
                  sx={{
                    backgroundColor: '#d3f8e2', // Light green background
                    padding: '16px 12px', // Adjusted padding for proper height and alignment
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {/* Green Vertical Line */}
                  <Box
                    sx={{
                      width: '4px',
                      height: '100%',
                      backgroundColor: 'green',
                      marginRight: 1
                    }}
                  />
                  <Box>
                    <Typography
                      variant='h5'
                      sx={{
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: '1.4rem' // Adjusted font size
                      }}
                    >
                      ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#6a6a6a',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      Employee Net Pay
                    </Typography>
                  </Box>
                </Box>

                {/* Dotted Line Separator */}
                <hr style={{ border: '1px dotted #ccc', margin: 0 }} />

                {/* Paid Days and LOP Days Section with Aligned Labels */}
                {EmsCond === 'true' && (
                  <Box sx={{ padding: '12px' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sx={{ textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'lighter', color: '#6a6a6a' }}>Paid Days:</Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#000' }}>{employee?.paidDays}</Typography>
                      </Grid>

                      <Grid item xs={6} sx={{ textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 'lighter', color: '#6a6a6a' }}>LOP Days:</Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 'bold', color: '#000' }}>{employee?.lopDays}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Earnings and Deductions Tables with Border and Dotted Line under Heading */}
          {/* Earnings and Deductions Tables with Border and Dotted Line under Heading */}
          <Grid container spacing={2} sx={{ marginTop: 3, border: '1px solid #ccc', borderRadius: '8px', padding: 2 }}>
            {/* Earnings Section */}
            <Grid item xs={6} sx={{ paddingBottom: '20px' }}>
              <Typography
                variant='h6'
                sx={{ borderBottom: '2px dotted #000', fontWeight: 'bold', color: 'black', textAlign: 'center' }}
              >
                Earnings
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Type</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>{earning.type}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: 'black', fontWeight: 'bold' }}>
                        ₹{earning.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Grid>

            {/* Deductions Section */}
            <Grid item xs={6} sx={{ paddingBottom: '20px' }}>
              <Typography
                variant='h6'
                sx={{ borderBottom: '2px dotted #000', fontWeight: 'bold', color: 'black', textAlign: 'center' }}
              >
                Deductions
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Type</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.map((deduction, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>{deduction.type}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: 'black', fontWeight: 'bold' }}>
                        ₹{deduction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Grid>

            {/* Grid for Gross Earnings and Total Deductions */}
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
              <Grid item xs={6}>
                {/* Gross Earnings */}
                <Box
                  sx={{
                    backgroundColor: '#f5f5f5',
                    padding: '8px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>Gross Earnings:</Typography>
                  <Typography sx={{ color: 'black', fontWeight: 'bold' }}>₹{totalEarnings.toFixed(2)}</Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                {/* Total Deductions */}
                <Box
                  sx={{
                    backgroundColor: '#f5f5f5',
                    padding: '8px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>Total Deductions:</Typography>
                  <Typography sx={{ color: 'black', fontWeight: 'bold' }}>₹{totalDeductions.toFixed(2)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>


          {/* Total Net Pay */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Paper
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 2,
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#f0f8f4' // Light green background similar to the image
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                TOTAL NET PAYABLE
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 'bold',
                  color: '#000',
                  backgroundColor: '#d3f8e2', // Light green background for the value
                  padding: '5px 10px',
                  borderRadius: '5px'
                }}
              >
                ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px' }}>
            <Typography sx={{ color: '#6a6a6a', marginRight: '4px' }}>Amount In Words:</Typography>
            <Typography sx={{ fontWeight: 'bold', color: '#000' }}>{amountInWords}</Typography>
          </Box>
          <Typography
            sx={{
              textAlign: 'center',
              // fontStyle: 'italic',
              color: '#6a6a6a',
              marginTop: 4,
              fontSize: '14px', // Slightly smaller font size for a subtle effect
            }}
          >
            -- This document is system-generated and does not require a physical signature.
            It is valid for all official purposes.
          </Typography>

        </Paper>
      </div>
    )
  })

  const columns: GridColDef[] = [
    {
      field: 'employee',
      headerName: 'Employee',
      width: 250,
      renderCell: (params) => {
        const { first_name, last_name, image } = params.row; // Access employee data

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={image} alt={`${first_name} ${last_name}`} sx={{ marginRight: 2 }} />
            <Typography variant="body2">
              {first_name} {last_name}
            </Typography>
          </Box>
        );
      },
    },

    { field: 'code', headerName: 'Employee Code', width: 150 },
    { field: 'baseSalary', headerName: 'Base Salary', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'processedBy', headerName: 'Processed By', width: 150 },
    {
      field: 'generate',
      headerName: 'Generate PaySlip',
      width: 150,
      renderCell: params => (
        <Button variant='contained' color='primary' onClick={() => handleGeneratePrint(params.row)}>
          Generate
        </Button>
      )
    }
  ]

  console.log('rows', rows)

  // Transform payroll data to match the expected structure for the DataGrid
  const transformedPayrolls = rows.map(payroll => ({
    id: payroll._id, // Unique identifier for the row
    first_name: payroll.employee?.first_name, // Access first name of the employee
    last_name: payroll.employee?.last_name, // Access last name of the employee
    image: payroll.employee?.image,
    code: payroll.employee?.code, // Access employee code
    baseSalary: payroll.salaryTemplate.baseSalary, // Base salary from the salary template
    earningTypes: payroll.salaryTemplate.earningTypes, // Include earnings
    deductionTypes: payroll.salaryTemplate.deductionTypes, // Include deductions
    status: payroll.status, // Payroll status
    processedBy: payroll.processedBy // Processed by field
  }))

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '250px', marginLeft: 'auto' }}
      >
        {/* Select Month Dropdown */}
        <FormControl sx={{ marginBottom: 2, width: '100%' }}>
          <InputLabel id='month-select-label'>Select Month</InputLabel>
          <Select
            labelId='month-select-label'
            value={selectedMonth}
            onChange={handleMonthChange}
            label='Select Month'
            fullWidth
          >
            <MenuItem value={1}>January</MenuItem>
            <MenuItem value={2}>February</MenuItem>
            <MenuItem value={3}>March</MenuItem>
            <MenuItem value={4}>April</MenuItem>
            <MenuItem value={5}>May</MenuItem>
            <MenuItem value={6}>June</MenuItem>
            <MenuItem value={7}>July</MenuItem>
            <MenuItem value={8}>August</MenuItem>
            <MenuItem value={9}>September</MenuItem>
            <MenuItem value={10}>October</MenuItem>
            <MenuItem value={11}>November</MenuItem>
            <MenuItem value={12}>December</MenuItem>
          </Select>
        </FormControl>

        {/* Download Payslip Button */}
        <Button
          variant='contained'
          color='secondary'
          onClick={handleDownloadPdf}
          disabled={!selectedEmployee}
          sx={{ width: '100%' }}
        >
          Download Payslip (PDF)
        </Button>
      </Box>

      <Typography variant='h4' gutterBottom>
        Employee Payslip
      </Typography>
      <Grid container spacing={2} alignItems='center' mb={2}>
        <Grid item xs={12} md={6}>
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
      </Grid>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={transformedPayrolls}
          sx={{
            '& .mui-yrdy0g-MuiDataGrid-columnHeaderRow ': {
              background: '#2e7d32 !important',
              color: 'white'
            }
          }}
          columns={columns}
          pageSize={5}
          getRowId={row => row.id} // Use the transformed id
        />
      </div>
      {selectedEmployee && (
        <div>
          <div ref={contentRef}>
            <InvoiceLayout employee={selectedEmployee} />
          </div>
        </div>
      )}
    </Box>
  )
}

export default PayrollGenerator
