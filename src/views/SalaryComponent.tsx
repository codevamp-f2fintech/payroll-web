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
    DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import type { AppDispatch, RootState } from '@/redux/store';
import { fetchSalaryComponents } from '@/redux/features/salaryComponent/salaryComponentSlice';
import AddSalaryComponentForm from '../components/salary-component/AddSalaryComponentForm';

const SalaryComponent = () => {
    const dispatch: AppDispatch = useDispatch();
    const { salaryComponents, loading, error, total } = useSelector(
        (state: RootState) => state.salaryComponents
    );

    const [showForm, setShowForm] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const debouncedFetch = useCallback(
        debounce(() => {
            dispatch(fetchSalaryComponents({ page, limit, keyword: selectedKeyword }));
        }, 300),
        [page, limit, selectedKeyword]
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

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'amount', headerName: 'Amount', flex: 1 },
        { field: 'type', headerName: 'Type', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        {
            field: 'edit',
            headerName: 'Edit',
            sortable: false,
            width: 150,
            renderCell: ({ row: { _id } }) => (
                <Button color="info" variant="contained" onClick={() => handleComponentEditClick(_id)}>
                    Edit
                </Button>
            )
        }
    ];

    return (
        <Box>
            <ToastContainer />
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                <Dialog open={showForm} onClose={handleClose} fullWidth maxWidth="md">
                    <DialogTitle>
                        {selectedComponent ? 'Edit Salary Component' : 'Add Salary Component'}
                    </DialogTitle>
                    <DialogContent>
                        <AddSalaryComponentForm
                            id={selectedComponent}
                            handleClose={handleClose}
                            debouncedFetch={debouncedFetch}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                    </DialogActions>
                </Dialog>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" gutterBottom>
                        Salary Component
                    </Typography>
                    <Button variant="contained" color="warning" onClick={handleComponentAddClick}>
                        <AddIcon /> Add Component
                    </Button>
                </Box>
                <Grid container spacing={2} alignItems="center" mb={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Search"
                            variant="outlined"
                            value={selectedKeyword}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={salaryComponents}
                    sx={{
                        '& .mui-yrdy0g-MuiDataGrid-columnHeaderRow ': {
                            background: '#2e7d32 !important',
                            color: 'white',
                        },
                    }}
                    columns={columns}
                    getRowId={(row) => row._id}
                    paginationMode="server"
                    rowCount={total}
                    onPaginationModelChange={handlePaginationModelChange}
                    pageSizeOptions={[10, 20, 30]}
                    paginationModel={{ page: page - 1, pageSize: limit }}
                    checkboxSelection
                    disableRowSelectionOnClick
                />
            </Box>
        </Box>
    );
};

export default SalaryComponent;
