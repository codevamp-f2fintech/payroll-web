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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';

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

  const AddSalaryTemplateForm = ({ id, handleClose }: { id: string | null; handleClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      components: [],
      baseSalary: 0,
      earningTypes: [] as string[],
      deductionTypes: [] as string[],
      description: '',
    });

    const [errors, setErrors] = useState({
      name: '',
      baseSalary: '',
      earningTypes: '',
      deductionTypes: '',
      description: '',
    });

    useEffect(() => {
      if (id) {
        const selected = salaryTemplates.find(temp => temp._id === id);
        if (selected) {
          setFormData({
            name: selected.name,
            baseSalary: selected.baseSalary,
            earningTypes: selected.earningTypes,
            deductionTypes: selected.deductionTypes,
            description: selected.description,
          });
        }
      }
    }, [id, salaryTemplates]);

    const validateForm = () => {
      let isValid = true;
      const newErrors = { name: '', baseSalary: '', earningTypes: '', deductionTypes: '', description: '' };

      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
        isValid = false;
      }
      if (!formData.baseSalary) {
        newErrors.baseSalary = 'Base salary is required';
        isValid = false;
      }
      if (!formData.earningTypes) {
        newErrors.earningTypes = 'earningTypt is required';
        isValid = false;
      }
      if (!formData.deductionTypes) {
        newErrors.deductionTypes = 'deductiontype is required';
        isValid = false;
      }



      setErrors(newErrors);
      return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prevState => ({ ...prevState, [name]: value }));
    };
    const handleEarningTypesChange = (event: any, newValue: any[]) => {
      const newIds = newValue.map((item) => item._id);
      setFormData((prev) => ({ ...prev, earningTypes: newIds }));
    };

    const handleDeductionTypesChange = (event: any, newValue: any[]) => {
      const newIds = newValue.map((item) => item._id);
      setFormData((prev) => ({ ...prev, deductionTypes: newIds }));
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
            if (data) {
              handleClose();
              debouncedFetch();
              toast.success(id ? "Salary Template Successfully Updated" : "Salary Template Successfully Created");
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography style={{ fontSize: '2em' }} variant="h5" gutterBottom>
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
              label="Template Name"
              name="name"
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
              label="Base Salary"
              name="baseSalary"
              type="number"
              value={formData.baseSalary}
              onChange={handleChange}
              required
              error={!!errors.baseSalary}
              helperText={errors.baseSalary}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <Autocomplete
                id="Select Earnings"
                multiple
                options={salaryComponents.filter(component => component.salarytype === 'Earnings')}
                getOptionLabel={(option) => `${option.type} - ${option.amount}`}
                renderOption={(props, option) => (
                  <li {...props}>
                    {option.type} - {option.amount}
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Select Earnings" variant="outlined" />}
                value={salaryComponents.filter((comp) =>
                  formData.earningTypes.includes(comp._id)
                )}
                onChange={handleEarningTypesChange}
                isOptionEqualToValue={(option, value) => option._id === value._id} />
              {errors.earningTypes && (
                <Typography color="error">{errors.earningTypes}</Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <Autocomplete
                id="Select Deductions"
                multiple
                options={salaryComponents.filter(component => component.salarytype === 'Deductions')}
                getOptionLabel={(option) => `${option.type} - ${option.amount}`}
                renderOption={(props, option) => (
                  <li {...props}>
                    {option.type} - {option.amount}
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Select Deductions" variant="outlined" />}
                value={salaryComponents.filter((comp) =>
                  formData.deductionTypes.includes(comp._id)
                )}
                onChange={handleDeductionTypesChange}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              {errors.deductionTypes && (
                <Typography color="error">{errors.deductionTypes}</Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
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
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'baseSalary', headerName: 'Base Salary', flex: 1 },
    {
      field: 'earningType',
      headerName: 'EarningType',
      flex: 1,
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
      field: 'deductionType', headerName: 'DeductionType', flex: 1,
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

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Salary Templates</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleTemplateAddClick}>
          Add Salary Template
        </Button>
      </Box>
      <Box mb={2}>
        <TextField
          label="Search"
          variant="outlined"
          value={selectedKeyword}
          onChange={handleInputChange}
        />
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
      <ToastContainer />
      <Dialog open={showForm} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <AddSalaryTemplateForm id={selectedTemplate} handleClose={handleClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SalaryTemplate;
