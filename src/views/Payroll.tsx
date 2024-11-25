"use client"
import AddPayrollForm from "@/components/payroll/Payroll.Form"
import { Box, Button, Dialog, DialogContent, Grid, InputAdornment, TextField, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import { DataGrid } from "@mui/x-data-grid"
import { ToastContainer } from "react-toastify"
import { fetchPayrolls } from "@/redux/features/payroll/payrollSlice"
import { fetchSalaryTemplates } from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { debounce } from "lodash"


const PayrollGrid = () => {
  const dispatch: AppDispatch = useDispatch();
  const { payrolls, total } = useSelector((state: RootState) => state.payrolls);
  const { salaryTemplates } = useSelector((state: RootState) => state.salaryTemplates);
  const [selectedPayrolls, setSelectedPayrolls] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role;


  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchPayrolls({ page, limit, keyword: selectedKeyword }));
    }, 300),
    [page, limit, selectedKeyword]
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [page, limit, selectedKeyword, debouncedFetch]);

  useEffect(() => {
    dispatch(fetchSalaryTemplates({ page, limit, keyword: selectedKeyword }));
  }, [dispatch, page, limit, selectedKeyword]);

  const handleInputChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSelectedKeyword(e.target.value)
  }
  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setLimit(newPageSize);
  };

  const handlePaginationModelChange = (params: { page: number; pageSize: number }) => {
    handlePageChange(params.page, params.pageSize);
    debouncedFetch();
  };

  const handleAddClick = () => {
    setSelectedPayrolls(null)
    setShowForm(true)
  }
  const handleEditClick = (id: SetStateAction<null>) => {
    setSelectedPayrolls(id);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false)
  }

  const getTemplateName = (salaryTemplate: any) => {
    const template = salaryTemplates.find(template => template.id === salaryTemplate);
    return template ? template.name : '';
  };

  const generateColumns = useMemo(() => {
    // Conditionally render the Edit column based on userRole
    const columns = [
      {
        field: 'employeeId',
        headerName: 'Employee Name',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
        renderCell: (params) => {
          const employee = params.row.employee;
          return employee
            ? (
              <div>
                <img
                  src={employee.image}
                  alt={`${employee.first_name} ${employee.last_name}`}
                  style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 10 }}
                />
                {employee.first_name} {employee.last_name}
              </div>
            )
            : 'N/A';
        },
      },
      {
        field: 'salaryTemplate',
        headerName: 'Salary Template',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
        valueGetter: (params) => getTemplateName(params.value),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'processedBy',
        headerName: 'ProcessedBy',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
      },
    ];

    // Only add the Edit column if the user role is '1'
    if (userRole === '1') {
      columns.push({
        field: 'edit',
        headerName: 'Edit',
        sortable: false,
        width: 150,
        renderCell: ({ row: { _id } }) => (
          <Button color="info" variant="contained" onClick={() => handleEditClick(_id)}>
            Edit
          </Button>
        ),
      });
    }

    return columns;
  }, [salaryTemplates, userRole]);

  return (
    <>
      <ToastContainer
        position="top-center"

      />
      <Dialog open={showForm} onClose={handleCloseForm} fullWidth maxWidth='md'>
        <DialogContent>
          <AddPayrollForm
            payrolls={payrolls}
            payroll={selectedPayrolls}
            handleClose={handleCloseForm}
            debouncedFetch={debouncedFetch}
            page={page}
            limit={limit}
            selectedKeyword={selectedKeyword}
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
        {userRole === '1' && <Box display='flex' alignItems='center'>
          <Button
            style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
            variant='contained'
            color='warning'
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Add Payroll
          </Button>

        </Box>}
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

          rows={payrolls}
          columns={generateColumns}
          getRowId={(row) => row._id}
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

export default PayrollGrid



