"use client"
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search'
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import { DataGrid } from "@mui/x-data-grid"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { fetchDeclarations } from "@/redux/features/declaration/declarationSlice"
import DeclarationView from '@/components/declaration/DeclarationView';
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { debounce } from "lodash"
import DeclarationForm from "@/components/declaration/declarationForm"
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

import CloseIcon from '@mui/icons-material/Close';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
interface Declaration {
  _id: string;
  basicInfo?: {
    name?: string;
    financialYear?: string;
  };
  hra?: {
    houseRent?: string;
    proof?: string;
    status?: string;
  };
  lta?: {
    travelAmount?: string;
    proof?: string;
    status?: string;
  };
  deductions?: {
    interestPayable?: string;
    proof?: string;
    status?: string;
  };
  Section80C?: {
    amount?: string;
    proof?: string;
    status?: string;
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

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role

  console.log('declarations', declarations)
  // Transform the nested declaration data into flattened rows
  const transformedDeclarations = useMemo(() => {
    if (!Array.isArray(declarations)) return [];

    return declarations.flatMap((declaration) => {
      const rows = [];
      if (declaration.hra) {
        rows.push({
          id: `${declaration._id}`,
          declarationId: declaration.hra._id,
          type: "HRA",
          amount: declaration.hra.houseRent || "N/A",
          proof: declaration.hra.proof || "No proof uploaded",
          status: declaration.hra.status || "Pending"
        });
      }
      if (declaration.lta) {
        rows.push({
          id: `${declaration._id}`,
          declarationId: declaration.lta._id,
          type: "LTA",
          amount: declaration.lta.travelAmount || "N/A",
          proof: declaration.lta.proof || "No proof uploaded",
          status: declaration.lta.status || "Pending"
        });
      }
      if (declaration.HouseLoanInterest) {
        rows.push({
          id: `${declaration._id}`,
          declarationId: declaration.HouseLoanInterest._id,
          type: "Housing Loan  Interest",
          amount: declaration.HouseLoanInterest.interestPayable || "N/A",
          proof: declaration.HouseLoanInterest.proof || "No proof uploaded",
          status: declaration.HouseLoanInterest.status || "Pending"
        });
      }
      if (declaration.Section80C && Array.isArray(declaration.Section80C)) {
        declaration.Section80C.forEach((section) => {
          rows.push({
            id: `${declaration._id}`,
            declarationId: section._id,
            type: `Section 80C - ${section.name}`,
            amount: section.amount || "N/A",
            proof: Array.isArray(section.proof) ? section.proof[0] || "No proof uploaded" : section.proof || "No proof uploaded",
            status: section.status || "Pending"
          });
        });
      }
      if (declaration.Section80D && Array.isArray(declaration.Section80D)) {
        declaration.Section80D.forEach((section) => {
          rows.push({
            id: `${declaration._id}`,
            declarationId: section._id,
            type: `Section 80D - ${section.name}`,
            amount: section.amount || "N/A",
            proof: Array.isArray(section.proof) ? section.proof[0] || "No proof uploaded" : section.proof || "No proof uploaded",
            status: section.status || "Pending"
          });
        });
      }
      if (declaration.Section80G) {
        rows.push({
          id: `${declaration._id}`,
          declarationId: declaration.Section80G._id,
          type: "Section80G",
          amount: declaration.Section80G.amount || "N/A",
          proof: declaration.Section80G.proof || "No proof uploaded",
          status: declaration.Section80G.status || "Pending"
        });
      }
      return rows;
    });
  }, [declarations.length]);


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

  const handleEditClick = (id: string) => {
    setSelecteddeclarations(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false)
  }

  const generateColumns = useMemo(() => {
    return [
      ...(userRole === '1' ?
        [
          {
            field: 'employeeId',
            headerName: 'Employee Name',
            flex: 1,
            headerAlign: 'center',
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
              const employee = params.row.employee;
              return employee ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  <img
                    src={employee.image}
                    alt={`${employee.first_name} ${employee.last_name}`}
                    style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 10 }}
                  />
                  <span>{employee.first_name} {employee.last_name}</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center', width: '100%' }}>N/A</div>
              );
            },
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
            field: 'view',
            headerName: 'View Declaration',
            flex: 1,
            headerAlign: 'center',
            headerClassName: 'super-app-theme--header',
            align: 'center',
            renderCell: (params) => {
              const [open, setOpen] = useState(false);

              const rowData = declarations.find((declaration) => declaration?._id === params.row._id);

              const handleClickOpen = () => {
                setOpen(true);
                debouncedFetch();

              };

              const handleClose = () => {
                setOpen(false);
              };

              return (
                <>
                  <Button variant="outlined" onClick={handleClickOpen}>
                    View
                  </Button>
                  <DeclarationView
                    open={open}
                    onClose={handleClose}
                    data={rowData}


                  />
                </>
              );
            }
          },
          {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
              return (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditClick(params.row._id)}
                >
                  Edit
                </Button>
              );
            }
          }
        ] : [
          {
            field: 'type',
            headerName: 'type',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'super-app-theme--header',
          },
          {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'super-app-theme--header',
          },
          {
            field: 'status',
            headerName: 'Status',
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
            align: 'center',
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
              const hasProof = params.value && params.value !== 'No proof uploaded';
              return (
                <Typography color={hasProof ? 'primary' : 'error'}>
                  {hasProof ? 'Yes' : 'No'}
                </Typography>
              );
            },
          },
          {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            headerClassName: 'super-app-theme--header',
            renderCell: (params) => {
              return (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditClick(params.row.id)}
                >
                  Edit
                </Button>
              );
            }
          }
        ])
    ]
  }, [userRole, declarations,])

  const getRowId = userRole === '1' ?
    (row: any) => row._id :
    (row: any) => row.declarationId;

  // Add error boundary for data rendering
  if (!Array.isArray(declarations)) {
    return <Typography color="error">Error: Invalid declarations data</Typography>
  }
  return (
    <>
      <ToastContainer position="top-center" />
      <Dialog open={showForm} onClose={handleCloseForm} fullWidth maxWidth='md'>
        <DialogContent>
          <DeclarationForm
            handleClose={handleCloseForm}
            declaration={selecteddeclarations}
            declarations={declarations}
            debouncedFetch={debouncedFetch}
            userRole={userRole}

          />
        </DialogContent>
      </Dialog>

      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            Declaration
          </Typography>
          <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
            Dashboard / Declaration
          </Typography>
        </Box>
        {userRole !== '1' && (
          <Box display='flex' alignItems='center'>
            <Button
              style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
              variant='contained'
              color='warning'
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Declaration
            </Button>
          </Box>
        )}

      </Box>

      <Box height={'20vh'} marginLeft={'5vw'}>
        <Typography variant="h5" marginLeft={'-2vw'}> ⚠️ Important!</Typography>
        <Typography variant="h6" marginTop={'2vh'}> • You can declare investment between your declaration configuration date </Typography>
        <Typography variant="h6" marginTop={'2vh'}>• You can submit investment proof between  </Typography>
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
          rows={userRole === '1' ? (declarations) : (transformedDeclarations)}
          columns={generateColumns}
          getRowId={getRowId}
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
