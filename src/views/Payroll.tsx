"use client"
import AddPayrollForm from "@/components/payroll/Payroll.Form"
import { Box, Button, Dialog, DialogContent, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import { DataGrid } from "@mui/x-data-grid"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchPayrollByEmployeeIdAndYear, fetchPayrolls } from "@/redux/features/payroll/payrollSlice"
import { fetchSalaryTemplates } from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { debounce, template } from "lodash"


const PayrollGrid = () => {
  const dispatch: AppDispatch = useDispatch();
  const { payrolls, total, employeePayrollsByYear } = useSelector((state: RootState) => state.payrolls);
  const [selectedPayrolls, setSelectedPayrolls] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role;
  const userId = user?.id;

  const rows = user.role === '1' ? payrolls : employeePayrollsByYear


  const debouncedFetch = useCallback(
    debounce(() => {
      const params = {
        page,
        limit,
        keyword: selectedKeyword,
        year: selectedYear,
        month: selectedMonth, // Ensure selectedMonth is passed as well
      };

      console.log("Fetching payrolls with params:", params);

      if (userRole === '1') {
        dispatch(fetchPayrolls(params)); // Fetch for admin
      } else {
        dispatch(fetchPayrollByEmployeeIdAndYear({ employeeId: userId, year: selectedYear, month: selectedMonth, page, limit, keyword: selectedKeyword })); // Fetch for employee
      }
    }, 300),
    [page, limit, selectedKeyword, userRole, userId, selectedYear, selectedMonth] // Include selectedMonth here
  );


  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [page, limit, selectedKeyword, debouncedFetch]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    // You can trigger a fetch for payrolls based on the selected year
    debouncedFetch(); // Assuming the year is included in the debounced fetch
  };
  const handleMonthChange = event => {
    setSelectedMonth(event.target.value)

  }


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

  const generateColumns = useMemo(() => {
    // Conditionally render the Edit column based on userRole
    const columns = [
      ...(user.role === '1' ? [
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
      ] : []),

      {
        field: 'salaryTemplate',
        headerName: 'Salary Template',
        flex: 1,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
          const name = params.row.salaryTemplate.name
          return (
            <Typography>
              {name}
            </Typography>
          )
        }
      },
      {
        field: 'createdAt',
        headerName: 'PayRoll',
        flex: 1,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
          const formattedDate = new Date(params.row.createdAt).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric',
          });
          return <Typography style={{ fontWeight: 'bold', color: 'rgb(46 38 61 / 90%)', }} variant="body2">{formattedDate}</Typography>;
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
        align: 'center',
      },
      {
        field: 'netSalary',
        headerName: 'Net Salary',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
        align: 'center',
      },
      {
        field: 'processedBy',
        headerName: 'ProcessedBy',
        flex: 1,
        headerAlign: 'center',
        headerClassName: 'super-app-theme--header',
        align: 'center',
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
  }, [payrolls, userRole]);

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

        {userRole === '1' && <Grid item xs={12} md={3}>
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
        </Grid>
        }
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={handleYearChange}
            >
              <MenuItem value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</MenuItem>
              <MenuItem value={new Date().getFullYear()}>{new Date().getFullYear()}</MenuItem>
              <MenuItem value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</MenuItem>
            </Select>
          </FormControl>
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

          rows={rows}
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



