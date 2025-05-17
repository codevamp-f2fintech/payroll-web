'use client'

import React, { useCallback, useEffect, useState } from 'react';

import { debounce } from 'lodash';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  TextField,
  Dialog,
  FormControl,
  Select,
  InputAdornment,
  MenuItem,
  DialogContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search'
import { DriveFileRenameOutlineOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import type { AppDispatch, RootState } from '@/redux/store';
import { fetchComponentTypes } from "@/redux/features/componentType/componentTypeSlice";
import ComponentsForm from '@/components/component-type/ComponentTypeForm';
import 'react-toastify/dist/ReactToastify.css';

const ComponentType = () => {
  const dispatch: AppDispatch = useDispatch();
  const { componentTypes, loading, error, filteredComponentTypes, total } =
    useSelector((state: RootState) => state.componentTypes);
  const [showForm, setShowForm] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedFetch = useCallback(
    debounce(() => {
      dispatch(fetchComponentTypes({ page, limit, keyword: selectedKeyword }));
    }, 300),
    [page, limit, selectedKeyword]
  );

  useEffect(() => {
    debouncedFetch();

    return debouncedFetch.cancel;
  }, [page, limit, selectedKeyword, debouncedFetch]);

  const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    setUserRole(user.role);
  }, [])

  const handleDesignationAddClick = () => {
    setSelectedComponent(null);
    setShowForm(true);
  };

  const handleDesignationEditClick = (id: React.SetStateAction<null>) => {
    setSelectedComponent(id);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  // Add GridColDef type import or define it
  const columns = [
    { field: 'name', headerName: 'Name', headerClassName: 'super-app-theme--header', flex: 2, headerAlign: 'center', align: 'center', sortable: false },
    { field: 'type', headerName: 'Type', headerClassName: 'super-app-theme--header', flex: 2, headerAlign: 'center', align: 'center', sortable: false },
    ...(userRole === '1'
      ? [
        {
          field: 'edit',
          headerName: 'Edit',
          sortable: false,
          headerAlign: 'center',
          width: 160,
          headerClassName: 'super-app-theme--header',
          renderCell: ({ row: { _id } }) => (
            <Box width="85%" m="0 auto" p="5px" display="flex" justifyContent="space-around">
              <Button color="info" variant="contained" sx={{ minWidth: '50px', backgroundColor: '#2e7d32' }} onClick={() => handleDesignationEditClick(_id)}>
                <DriveFileRenameOutlineOutlined />
              </Button>
            </Box>
          ),
        },
      ]
      : []),
  ];

  return (
    <Box>
      <ToastContainer />
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Dialog open={showForm} onClose={handleClose} fullWidth maxWidth="md">
          <DialogContent>
            <ComponentsForm
              id={selectedComponent}
              handleClose={handleClose}
              componentTypes={componentTypes}
              debouncedFetch={debouncedFetch}
            />
          </DialogContent>
        </Dialog>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography style={{ fontSize: '2em' }} variant="h5" gutterBottom>
              Component Type
            </Typography>
            <Typography style={{ fontSize: '1em', fontWeight: 'bold' }} variant="subtitle1" gutterBottom>
              Dashboard / Component Type
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Button
              style={{ borderRadius: 50, backgroundColor: '#2e7d32' }}
              variant="contained"
              color="warning"
              startIcon={<AddIcon />}
              onClick={handleDesignationAddClick}
            >
              Add Component
            </Button>
          </Box>

        </Box>
        <Grid container spacing={6} alignItems="center" mb={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="search"
              variant="outlined"
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
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          sx={{
            '& .super-app-theme--header': {
              fontSize: 17,
              fontWeight: 600,
              alignItems: 'center',
            },
            '& .mui-yrdy0g-MuiDataGrid-columnHeaderRow ': {
              background: '#2e7d32 !important',
              color: 'white',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '10',
              align: 'center',
            },
            '& .MuiDataGrid-row': {
              '&:nth-of-type(odd)': {
                backgroundColor: 'rgb(46 38 61 / 12%)',
              },
              '&:nth-of-type(even)': {
                backgroundColor: '#fffff',
              },
              fontWeight: '600',
              fontSize: '14px',
              boxSizing: 'border-box',
            },
          }}
          components={{
            Toolbar: GridToolbar,
          }}
          rows={filteredComponentTypes.length > 0 ? filteredComponentTypes : componentTypes}
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
    </Box>
  )
}

export default ComponentType;
