"use client"
import AddPayrollForm from "@/components/payroll/Payroll.Form"
import { Box, Button, Dialog, DialogContent, Grid, InputAdornment, TextField, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { SetStateAction, useMemo, useState } from "react"
import { DataGrid } from "@mui/x-data-grid"
const PayrollGrid = () => {
  const [selectedFines, setSelectedFines] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState('');



  const handleAddClick = () => {
    setSelectedFines(null)
    setShowForm(true)
  }
  const handleCloseForm = () => {
    setShowForm(false)
  }
  const handleInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSelectedKeyword(e.target.value)
  }



  const generateColumns = useMemo(() => {
    return [
      // ...(userRole === '1' ? [
      {
        field: 'employee_id',
        headerName: 'Employee_id',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'salary',
        headerName: 'Salary_Template',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'processed',
        headerName: 'ProcessedBy',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
      },

      // ]:[
      // {
      //   field: 'type',
      //   headerName: 'Type',
      //   flex: 1,
      //   headerAlign: 'center',
      //   headerClassName: 'super-app-theme--header',
      // },
      // {
      //   field: 'application',
      //   headerName: 'Application',
      //   flex: 2,
      //   headerAlign: 'center',
      //   align: 'center',
      //   headerClassName: 'super-app-theme--header',
      // },

      // {
      //   field: 'status',
      //   headerName: 'Status',
      //   flex: 1,
      //   headerAlign: 'center',
      //   headerClassName: 'super-app-theme--header',
      // },
      // {
      //   field: 'reason',
      //   headerName: 'Decision',
      //   flex: 1,
      //   headerAlign: 'center',
      //   headerClassName: 'super-app-theme--header',
      // }
      // ])
    ]
  }, [])

  // const rows = useMemo(() => {
  //   return leaves
  //     .filter(leave => leave && leave.day && leave.start_date) // Filter out invalid leaves
  //     .map(leave => ({
  //       _id: leave._id,
  //       start_date: leave.start_date,
  //       end_date: leave.end_date,
  //       type: leave.type,
  //       status: leave.status,
  //       day: leave.day,
  //       application: leave.application,
  //       half_day_period: leave.half_day_period,
  //       reason: leave.reason || ''
  //     }))
  // }, [leaves])
  return (
    <>
      <Dialog open={showForm} onClose={handleCloseForm} fullWidth maxWidth='md'>
        <DialogContent>
          <AddPayrollForm
            payroll={undefined}
            handleClose={handleCloseForm}

          />
        </DialogContent>
      </Dialog>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            Payroll
          </Typography>
          <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
            Dashboard / Payroll
          </Typography>
        </Box>
        <Box display='flex' alignItems='center'>
          <Button
            style={{ borderRadius: 50, backgroundColor: '#ff902f' }}
            variant='contained'
            color='warning'
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Payroll
          </Button>

        </Box>
      </Box>
      <Grid container spacing={6} alignItems='center' mb={2}>

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

      <Box sx={{ width: '100%', position: 'relative' }}>

        <DataGrid
          getRowHeight={() => 'auto'}
          sx={{
            height: 600,
            '& .super-app-theme--header': {
              fontSize: 17,
              fontWeight: 600,
              alignItems: 'center'
            },
            '& .mui-yrdy0g-MuiDataGrid-columnHeaderRow ': {
              background: '#2c3ce3 !important',
              color: 'white'
            },
            '& .MuiDataGrid-cell': {
              fontSize: '10',
              align: 'center'
            },
            '& .MuiDataGrid-row': {
              fontWeight: '600',
              fontSize: '14px',
              boxSizing: 'border-box',
            },
          }}
          // rows={userRole === '1' ? leaves : rows}
          columns={generateColumns}
        // getRowId={row => {
        //   if (userRole === '1') {
        //     return row._id && row._id._id ? row._id._id : row._id
        //   } else {
        //     return row._id
        //   }
        // }}
        // paginationMode='server'
        // rowCount={total}
        // onPaginationModelChange={handlePaginationModelChange}
        // pageSizeOptions={[10, 20, 30]}
        // paginationModel={{ page: page - 1, pageSize: limit }}
        />
      </Box>
    </>
  )
}

export default PayrollGrid
