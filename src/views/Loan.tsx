'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import { DataGrid } from '@mui/x-data-grid'
import {
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  InputAdornment,
  Tab,
  Tabs
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useDispatch, useSelector } from 'react-redux'
import LoanForm from '@/components/loan/LoanForm'
import { fetchLoans } from '@/redux/features/loan/loanSlice'
import { RootState } from '@/redux/store'
const LoanComponent = () => {
  const dispatch = useDispatch()
  const { loans, loading, total } = useSelector((state: RootState) => state.loans)
  console.log('loan', loans)
  const [showForm, setShowForm] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchLoans({ page, limit, keyword: selectedKeyword }))
    }, 300),
    [page, limit, selectedKeyword]
  )

  useEffect(() => {
    debouncedFetch()
    return debouncedFetch.cancel
  }, [page, limit, selectedKeyword, debouncedFetch])

  const handleInputChange = e => {
    setSelectedKeyword(e.target.value)
  }

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage + 1)
    setLimit(newPageSize)
  }

  const handlePaginationModelChange = params => {
    handlePageChange(params.page, params.pageSize)
    debouncedFetch()
  }

  const handleComponentAddClick = () => {
    setSelectedComponent(null)
    setShowForm(true)
  }

  const handleComponentEditClick = id => {
    setSelectedComponent(id)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
  }

  const columns = [
    {
      field: 'reimbursements',
      headerName: 'Name',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header'
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header'
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header'
    },
    // {
    //   field: 'salarytype',
    //   headerName: 'Salary Type',
    //   flex: 1,
    //   headerAlign: 'center',
    //   align: 'center',
    //   headerClassName: 'super-app-theme--header'
    // },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header'
    },
    {
      field: 'edit',
      headerName: 'Edit',
      sortable: false,
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      renderCell: ({ row: { _id } }) => (
        <Button sx={{ background: '#2e7d32' }} variant='contained' onClick={() => handleComponentEditClick(_id)}>
          Edit
        </Button>
      )
    }
  ]

  return (
    <>
      <ToastContainer position='top-center' />

      <Dialog open={showForm} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogContent>
          <LoanForm
            id={selectedComponent}
            handleClose={handleClose}
            debouncedFetch={debouncedFetch}
            loans={loans}
            userRole={userRole}
          />
        </DialogContent>
      </Dialog>

      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            Loan Component
          </Typography>
          <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
            Dashboard / Loan Component
          </Typography>
        </Box>
        {/* {userRole === '' && ( */}
        <Box display='flex' alignItems='center'>
          <Button
            style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
            variant='contained'
            color='warning'
            startIcon={<AddIcon />}
            onClick={handleComponentAddClick}
          >
            Loan
          </Button>
        </Box>
        {/* )} */}
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

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          getRowHeight={() => 'auto'}
          sx={{
            height: 600,
            '& .super-app-theme--header': {
              fontSize: 15,
              fontWeight: 600,
              alignItems: 'center'
            },
            '& .mui-yrdy0g-MuiDataGrid-columnHeaderRow ': {
              background: '#2e7d32 !important',
              color: 'white'
            },
            '& .MuiDataGrid-cell': {
              fontSize: '10',
              align: 'center'
            },
            '& .MuiDataGrid-row': {
              fontWeight: '600',
              fontSize: '14px',
              boxSizing: 'border-box'
            }
          }}
          rows={loans}
          columns={columns}
          getRowId={row => row._id}
          paginationMode='server'
          rowCount={total}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 20, 30]}
          paginationModel={{ page: page - 1, pageSize: limit }}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  )
}

export default LoanComponent
