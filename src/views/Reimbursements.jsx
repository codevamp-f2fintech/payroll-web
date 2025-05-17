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
import ReimbursementsForm from '../components/reimbursements/ReimbursementsForm'
import { fetchReimbursements } from '@/redux/features/reimbursement/reimbursementsSlice'
const ReimbursementsComponent = () => {
  const dispatch = useDispatch()
  const { reimbursements, loading, error, total } = useSelector(state => state.reimbursements)
  const [showForm, setShowForm] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role
  const employeeId = user?.id

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchReimbursements({ page, limit, keyword: selectedKeyword }))
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
    ...(userRole === '1'
      ? [
          {
            field: 'employeeId',
            headerName: 'Employee Name',
            flex: 2,
            headerAlign: 'center',
            headerClassName: 'super-app-theme--header',
            renderCell: params => {
              const employee = params.row.employee
              return employee ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <img
                    src={employee.image}
                    alt={`${employee.first_name} ${employee.last_name}`}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      marginRight: 10
                    }}
                  />
                  <span>
                    {employee.first_name} {employee.last_name}
                  </span>
                </div>
              ) : (
                <div style={{ textAlign: 'center', width: '100%' }}>N/A</div>
              )
            }
          }
        ]
      : []),
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
    {
      field: 'proof',
      headerName: 'Proof',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      renderCell: params => {
        const hasProof = params.value && params.value !== 'No proof uploaded'
        return <Typography color={hasProof ? 'primary' : 'error'}>{hasProof ? 'Yes' : 'No'}</Typography>
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header'
    },
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
          <ReimbursementsForm
            id={selectedComponent}
            handleClose={handleClose}
            debouncedFetch={debouncedFetch}
            reimbursements={reimbursements}
            userRole={userRole}
            employeeId={employeeId}
          />
        </DialogContent>
      </Dialog>

      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            Reimbursement Component
          </Typography>
          <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
            Dashboard / Reimbursement Component
          </Typography>
        </Box>
        {userRole !== '1' && (
          <Box display='flex' alignItems='center'>
            <Button
              style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
              variant='contained'
              color='warning'
              startIcon={<AddIcon />}
              onClick={handleComponentAddClick}
            >
              Claim Reimbursement
            </Button>
          </Box>
        )}
      </Box>
      {userRole === '1' && (
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
      )}

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
          rows={reimbursements}
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

export default ReimbursementsComponent
