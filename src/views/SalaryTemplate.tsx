'use client';

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
    InputLabel,
    MenuItem,
    DialogContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';

import type { AppDispatch, RootState } from '@/redux/store';
import { fetchSalaryTemplates } from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import 'react-toastify/dist/ReactToastify.css';

const SalaryTemplate = () => {
    const dispatch: AppDispatch = useDispatch();
    const { salaryTemplates, loading, error, filteredSalaryTemplate, total } = useSelector((state: RootState) => state.salaryTemplates);
    const [showForm, setShowForm] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedKeyword, setSelectedKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

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

    const handleInputChange = (e) => {
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

    function AddSalaryTemplateForm({ id, handleClose }) {
        const [formData, setFormData] = useState({
            name: '',
            components: [],
            baseSalary: 0,
            description: '',
        });

        const [errors, setErrors] = useState({
            name: '',
            baseSalary: '',
            description: '',
        });

        useEffect(() => {
            if (id) {
                const selected = salaryTemplates.find(temp => temp._id === id);
                if (selected) {
                    setFormData({
                        name: selected.name,
                        components: selected.components,
                        baseSalary: selected.baseSalary,
                        description: selected.description,
                    });
                }
            }
        }, [id, salaryTemplates]);

        const validateForm = () => {
            let isValid = true;
            const newErrors = { name: '', baseSalary: '', description: '' };

            if (!formData.name.trim()) {
                newErrors.name = 'Name is required';
                isValid = false;
            }
            if (!formData.baseSalary) {
                newErrors.baseSalary = 'Base salary is required';
                isValid = false;
            }

            setErrors(newErrors);
            return isValid;
        };

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prevState => ({ ...prevState, [name]: value }));
        };

        const handleSubmit = () => {
            if (validateForm()) {
                const method = id ? 'PUT' : 'POST';
                const url = id ? `${process.env.NEXT_PUBLIC_APP_URL}/salary-template/update/${id}` : `${process.env.NEXT_PUBLIC_APP_URL}/salary-template/create`;

                fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log("data>>>", data);
                        if (data.message) {
                            handleClose();
                            debouncedFetch();
                            toast.success(id ? "Salary Component Successfully Updated" : "Salary Component Successfully Updated")
                        } else {
                            toast.error('Unexpected error occurred');
                        }
                    })
                    .catch(error => {
                        toast.error('Error: ' + error.message);
                    });
            }
        };

        return (
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
                        {id ? 'Edit Salary Template' : 'Add Salary Template'}
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label='Template Name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label='Base Salary'
                            name='baseSalary'
                            type='number'
                            value={formData.baseSalary}
                            onChange={handleChange}
                            required
                            error={!!errors.baseSalary}
                            helperText={errors.baseSalary}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label='Description'
                            name='description'
                            value={formData.description}
                            onChange={handleChange}
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant='contained'
                            fullWidth
                            style={{ backgroundColor: '#ff902f' }}
                            onClick={handleSubmit}
                        >
                            {id ? 'Edit Template' : 'Add Template'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    const handleTemplateAddClick = () => {
        setSelectedTemplate(null);
        setShowForm(true);
    };

    const handleTemplateEditClick = (id) => {
        setSelectedTemplate(id);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'baseSalary', headerName: 'Base Salary', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        {
            field: 'edit',
            headerName: 'Edit',
            sortable: false,
            width: 150,
            renderCell: ({ row: { _id } }) => (
                <Button color="info" variant="contained" onClick={() => handleTemplateEditClick(_id)}>
                    Edit
                </Button>
            ),
        },
    ];
    console.log("salaryTemplates..>", salaryTemplates);

    return (
        <Box>
            <ToastContainer />
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                <Dialog open={showForm} onClose={handleClose} fullWidth maxWidth="md">
                    <DialogContent>
                        <AddSalaryTemplateForm id={selectedTemplate} handleClose={handleClose} />
                    </DialogContent>
                </Dialog>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" gutterBottom>
                        Salary Template
                    </Typography>
                    <Button variant="contained" color="warning" onClick={handleTemplateAddClick}>
                        <AddIcon /> Add Template
                    </Button>
                </Box>
                <Grid container spacing={6} alignItems="center" mb={2}>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth label="Search" variant="outlined" value={selectedKeyword} onChange={handleInputChange} />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={salaryTemplates}
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

export default SalaryTemplate;
