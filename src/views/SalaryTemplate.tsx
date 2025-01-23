'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Box,
  Button,
  Typography,
  Grid,
  IconButton,
  TextField,
  Dialog,
  FormControl,
  Autocomplete,
  DialogContent,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import AddSalaryTemplateForm from '@/components/salary-template/SalaryTemplateForm'
import type { AppDispatch, RootState } from '@/redux/store';
import { fetchSalaryTemplates } from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import { fetchSalaryComponents } from '@/redux/features/salaryComponent/salaryComponentSlice';
import 'react-toastify/dist/ReactToastify.css';

const SalaryTemplate = () => {
  const dispatch: AppDispatch = useDispatch();
  const { salaryTemplates, loading, error, filteredSalaryTemplate, total } = useSelector((state: RootState) => state.salaryTemplates);
  const { salaryComponents } = useSelector((state: RootState) => state.salaryComponents);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userRole = user?.role;

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchSalaryTemplates({ page, limit, keyword: selectedKeyword }));
    }, 300),
    [page, limit, selectedKeyword]
  );

  useEffect(() => {
    debouncedFetch();
    return debouncedFetch.cancel;
  }, [page, limit, selectedKeyword, debouncedFetch]);

  useEffect(() => {
    dispatch(fetchSalaryComponents({ page, limit, keyword: selectedKeyword }));
  }, [dispatch, page, limit, selectedKeyword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedKeyword(e.target.value);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setLimit(newPageSize);
  };

  const handlePaginationModelChange = (params: { page: number; pageSize: number }) => {
    handlePageChange(params.page, params.pageSize);
    debouncedFetch();
  };


  const handleTemplateAddClick = () => {
    setSelectedTemplate(null);
    setShowForm(true);
  };

  const handleTemplateEditClick = (id: string) => {
    setSelectedTemplate(id);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'baseSalary',
      headerName: 'Base Salary',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'netSalary',
      headerName: 'Net Salary',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'earningType',
      headerName: 'EarningType',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const count = params.row.earningTypes.length

        return (
          <>
            <Typography>
              {count}
            </Typography>
          </>
        )
      }
    },
    {
      field: 'deductionType',
      headerName: 'DeductionType',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const count = params.row.deductionTypes.length
        return (
          <>
            <Typography>
              {count}
            </Typography>
          </>
        )
      }
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
        <Button sx={{ background: '#2e7d32' }} variant="contained" onClick={() => handleTemplateEditClick(_id)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <ToastContainer position='top-center' />
      <Dialog open={showForm} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <AddSalaryTemplateForm
            id={selectedTemplate}
            handleClose={handleClose}
            debouncedFetch={debouncedFetch}


          />
        </DialogContent>
      </Dialog>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Box>
          <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
            Salary Template
          </Typography>
          <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant='subtitle1' gutterBottom>
            Dashboard / Salary Template
          </Typography>
        </Box>
        {userRole === '1' && <Box display='flex' alignItems='center'>
          <Button
            style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
            variant='contained'
            color='warning'
            startIcon={<AddIcon />}
            onClick={handleTemplateAddClick}
          >
            Add Salary Template
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
          rows={salaryTemplates}
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

export default SalaryTemplate;
