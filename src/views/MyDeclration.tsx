"use client"
import { Box, Button, Dialog, DialogContent, Grid, InputAdornment, TextField, Typography } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search'
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import { DataGrid } from "@mui/x-data-grid"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { fetchDeclarations } from "@/redux/features/declaration/declarationSlice"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { debounce } from "lodash"
import DeclarationForm from "@/components/declaration/declarationForm"

interface Declaration {
  _id: string;
  basicInfo?: {
    name?: string;
    financialYear?: string;
  };
  hra?: {
    houseRent?: string;
    proof?: string;
  };
  lta?: {
    travelAmount?: string;
    proof?: string;
  };
}

const Declarationgrid = () => {
  const dispatch: AppDispatch = useDispatch()
  const { declarations, loading, total } = useSelector((state: RootState) => state.declaration)
  const [selecteddeclarations, setSelecteddeclarations] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  console.log('declaration', declarations)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role

  // Transform the nested declaration data into flattened rows
  const transformedDeclarations = useMemo(() => {
    if (!Array.isArray(declarations)) {
      console.error('declarations is not an array:', declarations)
      return []
    }

    return declarations.map((declaration: Declaration) => {
      if (!declaration._id) {
        console.error('Declaration missing _id:', declaration)
        return null
      }

      return {
        id: declaration._id, // This is crucial - must be named 'id'
        employeeId: declaration.basicInfo?.name || 'N/A',
        financialYear: declaration.basicInfo?.financialYear || 'N/A',
        proof: declaration.hra?.proof || declaration.lta?.proof || 'No proof uploaded',
      }
    }).filter(row => row !== null) // Remove any null entries
  }, [declarations])

  useEffect(() => {
    console.log('Transformed Declarations:', transformedDeclarations)
  }, [transformedDeclarations])

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchDeclarations({ page, limit, keyword: selectedKeyword }))
    }, 300),
    [page, limit, selectedKeyword]
  )

  useEffect(() => {
    debouncedFetch()
    return debouncedFetch.cancel
  }, [page, limit, selectedKeyword, debouncedFetch])

  const handleInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSelectedKeyword(e.target.value)
  }

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1)
    setLimit(newPageSize)
  }

  const handlePaginationModelChange = (params: { page: number; pageSize: number }) => {
    handlePageChange(params.page, params.pageSize)
    debouncedFetch()
  }

  const handleAddClick = () => {
    setSelecteddeclarations(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
  }

  const generateColumns = useMemo(() => {
    return [
      {
        field: 'employeeId',
        headerName: 'Employee Name',
        flex: 1,
        headerAlign: 'center',
        align: 'center',
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'financialYear',
        headerName: 'Financial Year',
        flex: 1,
        headerAlign: 'center',
        align: 'center',
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'proof',
        headerName: 'Proof',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
        align: 'center',
      },
      {
        field: 'declaration',
        headerName: 'Declaration',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
        align: 'center',
      },
    ]
  }, [])

  // Add error boundary for data rendering
  if (!Array.isArray(declarations)) {
    return <Typography color="error">Error: Invalid declarations data</Typography>
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <Dialog open={showForm} onClose={handleCloseForm} fullWidth maxWidth='md'>
        <DialogContent>
          <DeclarationForm handleClose={handleCloseForm} />
        </DialogContent>
      </Dialog>

      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            My Declaration
          </Typography>
          <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
            Dashboard / My Declaration
          </Typography>
        </Box>
        <Box display='flex' alignItems='center'>
          <Button
            style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
            variant='contained'
            color='warning'
            onClick={handleAddClick}
          >
            My Declaration
          </Button>
        </Box>

      </Box>

      <Box height={'20vh'} marginLeft={'5vw'}>
        <Typography variant="h5" marginLeft={'-2vw'}> ⚠️ Important!</Typography>
        <Typography variant="h6" marginTop={'2vh'}> • You can declare investment form march till april </Typography>
        <Typography variant="h6" marginTop={'2vh'}>• Last date for submiting your proof feb 22 2025</Typography>
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
                sx: { borderRadius: '50px' },
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


      <Box sx={{ width: '100%', position: 'relative' }}>
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
              boxSizing: 'border-box',
            },
          }}
          rows={transformedDeclarations}
          columns={generateColumns}
          paginationMode='server'
          rowCount={total}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 20, 30]}
          paginationModel={{ page: page - 1, pageSize: limit }}
        />
      </Box>


    </>
  )
}

export default Declarationgrid
