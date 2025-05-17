'use client'
import React, { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search'
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import type { AppDispatch, RootState } from '@/redux/store';
import { fetchSalaryComponents } from '@/redux/features/salaryComponent/salaryComponentSlice'
import AddSalaryComponentForm from '../components/salary-component/AddSalaryComponentForm';

const SalaryComponent = () => {
  const dispatch: AppDispatch = useDispatch();
  const { salaryComponents, loading, error, total } = useSelector((state: RootState) => state.salaryComponents);
  const [tabValue, setTabValue] = useState(''); // To track the selected tab
  const [showForm, setShowForm] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role;

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchSalaryComponents({ page, limit, keyword: selectedKeyword !== "" ? selectedKeyword : tabValue }));
    }, 300),
    [page, limit, selectedKeyword, tabValue]
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [page, limit, selectedKeyword, debouncedFetch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeyword(e.target.value);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setLimit(newPageSize);
  };

  const handlePaginationModelChange = (params) => {
    handlePageChange(params.page, params.pageSize);
    debouncedFetch();
  };

  const handleComponentAddClick = () => {
    setSelectedComponent(null);
    setShowForm(true);
  };

  const handleComponentEditClick = (id: string) => {
    setSelectedComponent(id);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    // setSelectedKeyword(newValue)
    setPage(1); // Reset pagination when switching tabs
  };

  const columns: GridColDef[] = [
    {
      field: 'type',
      headerName: 'Name',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'calculationtype',
      headerName: 'calculation Type',
      flex: 1.5,
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
      renderCell: (params) => {
        const type = params.row.calculationtype
        const amount = params.row.amount
        return (
          <>
            {type === "Flat Amount" ? (
              <Typography>₹{amount}</Typography>
            ) :
              <Typography>{amount}%</Typography>}
          </>
        )

      }
    },
    {
      field: 'salarytype',
      headerName: 'Salary Type',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
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
        <Button sx={{ background: '#2e7d32' }} variant="contained" onClick={() => handleComponentEditClick(_id)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <>
      <ToastContainer position='top-center' />

      <Dialog open={showForm} onClose={handleClose} fullWidth maxWidth="md">
        <DialogContent>
          <AddSalaryComponentForm
            id={selectedComponent}
            handleClose={handleClose}
            debouncedFetch={debouncedFetch}
          />
        </DialogContent>
      </Dialog>

      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            Salary Component
          </Typography>
          <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
            Dashboard / Salary Component
          </Typography>
        </Box>
        {userRole === '1' && <Box display='flex' alignItems='center'>
          <Button
            style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
            variant='contained'
            color='warning'
            startIcon={<AddIcon />}
            onClick={handleComponentAddClick}
          >
            Add Component
          </Button>
        </Box>}
      </Box>

      <Tabs sx={{ mb: '2vh' }} value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
        <Tab label="All" value="" />
        <Tab label="Earnings" value="Earnings" />
        <Tab label="Deductions" value="Deductions" />
        <Tab label="Benefits" value="Benefit" />
        <Tab label="Reimbursements" value="Reimbursement" />
      </Tabs>

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
              boxSizing: 'border-box',
            },
          }}
          rows={salaryComponents}
          columns={columns}
          getRowId={(row) => row._id}
          paginationMode="server"
          rowCount={total}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 20, 30]}
          paginationModel={{ page: page - 1, pageSize: limit }}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
};

export default SalaryComponent;
