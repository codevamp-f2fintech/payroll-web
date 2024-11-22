import React, { useState, useEffect } from 'react';

import { Box, Grid, TextField, Typography, IconButton, Button, FormControl, Select, MenuItem, InputLabel, Autocomplete, TableContainer, Table, TableRow, TableCell, TableHead, TableBody, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast, } from 'react-toastify'; // Assuming you're using react-toastify for notifications
import { fetchSalaryTemplates } from '@/redux/features/salaryTemplate/salaryTemplateSlice';
import { fetchSalaryComponents } from '@/redux/features/salaryComponent/salaryComponentSlice'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';

const AddPayrollForm = ({ payroll, handleClose, payrolls, debouncedFetch, page, limit, selectedKeyword }) => {
  const dispatch: AppDispatch = useDispatch();
  const { salaryTemplates } = useSelector((state: RootState) => state.salaryTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [typeDetails, setTypeDetails] = useState({});

  const [formData, setFormData] = useState({
    employeeId: '',
    salaryTemplate: '',
    status: 'pending',
    processedBy: '',
    total: '',

  });

  const [errors, setErrors] = useState({
    employeeId: '',
    salaryTemplate: '',
    status: '',
    processedBy: '',
    total: '',
  });


  useEffect(() => {
    dispatch(fetchSalaryTemplates({ page, limit, keyword: selectedKeyword }));
  }, [dispatch, page, limit, selectedKeyword]);



  useEffect(() => {
    const fetchTypeDetails = async (typeIds) => {
      const validTypeIds = typeIds.filter((typeId) => /^[a-f\d]{24}$/i.test(typeId)); // Validate IDs
      const detailsById = {};

      await Promise.all(
        validTypeIds.map(async (typeId) => {
          if (!typeDetails[typeId]) {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/salary-component/get/${typeId}`);
              const detail = await response.json();
              detailsById[typeId] = detail;
            } catch (error) {
              console.error(`Failed to fetch details for typeId: ${typeId}`, error);
            }
          }
        })
      );
      setTypeDetails((prev) => ({ ...prev, ...detailsById }));
    };

    if (selectedTemplate) {
      const earningTypeIds = selectedTemplate?.earningTypes || [];
      const deductionTypeIds = selectedTemplate?.deductionTypes || [];

      fetchTypeDetails([...earningTypeIds, ...deductionTypeIds]);
    }
  }, [selectedTemplate]);




  useEffect(() => {
    if (payroll) {
      const selected = payrolls.find((h) => h._id === payroll);
      if (selected) {
        setFormData({
          employeeId: selected.employeeId,
          salaryTemplate: selected.salaryTemplate, // Add salaryTemplate
          status: selected.status,
          processedBy: selected.processedBy,
          total: selected.total,
        });
        const selectedTemplateData = salaryTemplates.find(

          (template) => template._id === selected.salaryTemplate._id
        );
        setSelectedTemplate(selectedTemplateData);
      }
    }
  }, [payroll, payrolls, salaryTemplates]);

  const validateForm = () => {
    let isValid = true;

    const newErrors = {
      employeeId: '',
      salaryTemplate: '',
      status: '',
      processedBy: '',
      total: '',
    };

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'employeeId is required';
      isValid = false;
    }

    if (!formData.salaryTemplate._id.trim()) {
      newErrors.salaryTemplate._id = 'Salary template is required';
      isValid = false;
    }

    if (!formData.status) {
      newErrors.status = 'Status  is required';
      isValid = false;
    }

    if (!formData.processedBy.trim()) {
      newErrors.processedBy = 'ProcessedBy is required';
      isValid = false;
    }
    // if (!formData.total.trim()) {
    //   newErrors.total = 'Total is required';
    //   isValid = false;
    // }


    setErrors(newErrors);

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => {
      const updatedFormData = {
        ...prevState,
        [name]: value
      };

      return updatedFormData;
    });
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   setFormData((prevState) => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // };



  // const handleTemplateChange = (event, newValue) => {
  //   setFormData({
  //     ...formData,
  //     salaryTemplate: newValue ? newValue._id : null
  //   });
  //   setSelectedTemplate(newValue);
  // };

  const handleTemplateChange = (event, newValue) => {
    setSelectedTemplate(newValue);

    setFormData((prevData) => ({
      ...prevData,
      salaryTemplate: newValue ? newValue._id : null,
      total: newValue?.baseSalary || '', // Set total to baseSalary or empty if not available
    }));
  };


  const handleSubmit = () => {
    if (validateForm()) {
      const method = payroll ? 'PUT' : 'POST';
      const url = payroll
        ? `${process.env.NEXT_PUBLIC_APP_URL}/payroll/update/${payroll}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/payroll/create`;


      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then(response => response.json())
        .then(data => {
          console.log("data>>>", data);
          if (data) {
            handleClose();
            debouncedFetch();
            toast.success(payroll ? "Payroll Successfully Updated" : "Payroll Successfully Created")
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
    <><Box sx={{ flexGrow: 1, padding: 2 }}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography style={{ fontSize: '2em' }} variant='h5' gutterBottom>
          {payroll ? 'Edit payroll' : 'Add payroll'}
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Employee ID'
            name='employeeId'
            value={formData.employeeId}
            onChange={handleChange}
            required
            error={!!errors.employeeId}
            helperText={errors.employeeId}
            FormHelperTextProps={{ style: { color: 'red' } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <Autocomplete
              id="Selec Template"
              options={salaryTemplates}
              getOptionLabel={(option) => `${option.name}`}
              renderOption={(props, option) => (
                <li {...props}>
                  {option.name}
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Select Template" variant="outlined" />}
              value={salaryTemplates.find((comp) => comp._id === formData.salaryTemplate._id) || null}
              onChange={handleTemplateChange}
              isOptionEqualToValue={(option, value) => option._id === value._id} />
            {errors.salaryTemplate && (
              <Typography color="error">{errors.salaryTemplate}</Typography>
            )}
          </FormControl>
        </Grid>

        {selectedTemplate && (
          <>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: 4,
                  textAlign: 'center',
                }}
              >
                <Typography textAlign={'center'}>Earning Types:</Typography>
              </Box>
              {selectedTemplate.earningTypes && selectedTemplate.earningTypes.length > 0 ? (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTemplate.earningTypes.map((typeId) => {
                          const details = typeDetails[typeId];
                          return (
                            <TableRow key={typeId}>
                              <TableCell>{details ? details.type : 'Unknown Type'}</TableCell>
                              <TableCell align="right">{details ? details.amount : 'N/A'}</TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {selectedTemplate.earningTypes
                                .reduce((total, typeId) => {
                                  const details = typeDetails[typeId];
                                  return total + (details?.amount || 0);
                                }, 0)
                                .toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography>N/A</Typography>
              )}
            </Grid>


            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: 4,
                  textAlign: 'center',
                }}
              >
                <Typography textAlign={'center'}>Deduction Types:</Typography>
              </Box>
              {selectedTemplate.deductionTypes && selectedTemplate.deductionTypes.length > 0 ? (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTemplate.deductionTypes.map((typeId) => {
                          const details = typeDetails[typeId];
                          return (
                            <TableRow key={typeId}>
                              <TableCell>{details ? details.type : 'Unknown Type'}</TableCell>
                              <TableCell align="right">{details ? details.amount : 'N/A'}</TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow>
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {selectedTemplate.deductionTypes
                                .reduce((total, typeId) => {
                                  const details = typeDetails[typeId];
                                  return total + (details?.amount || 0);
                                }, 0)
                                .toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography>N/A</Typography>
              )}
            </Grid>


            <Grid item xs={12}>

              <TextField
                fullWidth
                label='Base salary amount'
                variant="outlined"
                name='total'
                value={formData.total} // Bind to formData.total
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Typography sx={{ marginRight: 1 }}>₹</Typography>,
                }}
                error={!!errors.total}
                helperText={errors.total}
              />
            </Grid>

          </>
        )}

        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={!!errors.status}>
            <InputLabel required id='demo-simple-select-label'>Status</InputLabel>
            <Select
              label='Status'
              labelId='demo-simple-select-label'
              name='status'
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='processed'>Processed</MenuItem>
              <MenuItem value='paid'>Paid</MenuItem>
            </Select>
            {errors.status && <Typography color="error">{errors.status}</Typography>}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Processed By'
            name='processedBy'
            value={formData.processedBy}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.processedBy}
            helperText={errors.processedBy}
            FormHelperTextProps={{ style: { color: 'red' } }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'white',
              padding: 15,
              backgroundColor: '#2e7d32',
              width: 200,
            }}
            variant='contained'
            fullWidth
            onClick={handleSubmit}
          >
            {payroll ? 'UPDATE PAYROLL' : 'ADD PAYROLL'}
          </Button>
        </Grid>
      </Grid>
    </Box></>
  );
};

export default AddPayrollForm;


